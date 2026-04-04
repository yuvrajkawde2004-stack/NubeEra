using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Security;
using Veriton.Domain.Entities;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/auth/external")]
public class ExternalAuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtService;
    private readonly IGenericRepository<Learner> _learnerRepository;
    private readonly IConfiguration _configuration;

    public ExternalAuthController(
        IUserRepository userRepository,
        IJwtTokenService jwtService,
        IGenericRepository<Learner> learnerRepository,
        IConfiguration configuration)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _learnerRepository = learnerRepository;
        _configuration = configuration;
    }

    [HttpGet("login/{provider}")]
    [AllowAnonymous]
    public IActionResult Login(string provider)
    {
        var properties = new AuthenticationProperties
        {
            RedirectUri = Url.Action(nameof(Callback), new { provider })
        };

        return Challenge(properties, provider);
    }

    [HttpGet("callback/{provider}")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback(string provider)
    {
        var result = await HttpContext.AuthenticateAsync("ExternalCookie");
        if (!result.Succeeded)
        {
            return Redirect(_configuration["Frontend:Url"] + "/login?error=External authentication failed");
        }

        var claims = result.Principal.Identities.FirstOrDefault()?.Claims;
        var email = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value;
        var providerId = claims?.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        var firstName = claims?.FirstOrDefault(c => c.Type == ClaimTypes.GivenName)?.Value 
                        ?? claims?.FirstOrDefault(c => c.Type == "name")?.Value?.Split(' ')[0];
        var lastName = claims?.FirstOrDefault(c => c.Type == ClaimTypes.Surname)?.Value
                       ?? (claims?.FirstOrDefault(c => c.Type == "name")?.Value?.Contains(' ') == true 
                           ? claims.FirstOrDefault(c => c.Type == "name")?.Value?.Split(' ')[1] 
                           : "");

        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(providerId))
        {
            return Redirect(_configuration["Frontend:Url"] + "/login?error=Could not retrieve user info from provider");
        }

        // 1. Try to find user by provider and ID
        var user = await _userRepository.GetByExternalProviderAsync(provider, providerId);

        // 2. If not found, try to find by email and link
        if (user == null)
        {
            user = await _userRepository.GetByEmailAsync(email);
            if (user != null)
            {
                // Link account if it was a local account
                user.ExternalProvider = provider;
                user.ExternalId = providerId;
                await _userRepository.UpdateAsync(user);
            }
        }

        // 3. If still not found, create new user
        if (user == null)
        {
            user = Veriton.Domain.Entities.User.CreateExternal(email, provider, providerId);
            user.FirstName = firstName;
            user.LastName = lastName;
            
            await _userRepository.AddAsync(user);

            // Create Learner Profile
            var learner = new Learner
            {
                UserId = user.Id,
                FirstName = firstName ?? "",
                LastName = lastName ?? "",
                Email = email,
                LearnerId = "L-" + DateTime.UtcNow.Ticks.ToString().Substring(10),
                IsActive = true
            };
            await _learnerRepository.AddAsync(learner);
        }

        // Sign out from temporary cookie
        await HttpContext.SignOutAsync("ExternalCookie");

        // Generate JWT
        var token = _jwtService.GenerateToken(user);

        // Redirect back to frontend with token
        return Redirect(_configuration["Frontend:Url"] + $"/login?token={token}");
    }
}
