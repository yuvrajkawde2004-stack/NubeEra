using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.Extensions.Caching.Memory;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Security;
using Veriton.Domain.Entities;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtService;
    private readonly IMemoryCache _cache;
    private readonly IGenericRepository<Learner> _learnerRepository;

    public AuthController(
        IUserRepository userRepository,
        IJwtTokenService jwtService,
        IMemoryCache cache,
        IGenericRepository<Learner> learnerRepository)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
        _cache = cache;
        _learnerRepository = learnerRepository;
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdStr));
        if (user == null) return NotFound();

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Invalid current password" });
        }

        // Hash and update new password
        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatePassword(newHash);

        await _userRepository.UpdateAsync(user);
        return Ok(new { message = "Password changed successfully" });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLower());
        if (existingUser != null)
        {
            return BadRequest(new { message = "User with this email already exists." });
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password.Trim());
        var newUser = new Domain.Entities.User(
            request.Email.Trim().ToLower(),
            passwordHash,
            request.Role ?? "Learner"
        );
        
        if (!string.IsNullOrEmpty(request.FirstName)) newUser.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName)) newUser.LastName = request.LastName;

        await _userRepository.AddAsync(newUser);

        if (newUser.Role.Equals("Learner", StringComparison.OrdinalIgnoreCase))
        {
            var learner = new Learner
            {
                UserId = newUser.Id,
                FirstName = request.FirstName ?? "",
                LastName = request.LastName ?? "",
                Email = request.Email.Trim().ToLower(),
                LearnerId = "L-" + DateTime.UtcNow.Ticks.ToString().Substring(10),
                IsActive = true
            };
            await _learnerRepository.AddAsync(learner);
        }

        return Ok(new { message = "Registration successful" });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(
            request.Email.Trim().ToLower(),
            q => q.Include(u => u.TrainerProfile)
                  .Include(u => u.LearnerProfile));

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password.Trim(), user.PasswordHash);
        
        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Invalid credentials" });
        }

        var token = _jwtService.GenerateToken(user);
        
        return Ok(new 
        { 
            token,
            user = new 
            {
                id = user.Id,
                email = user.Email,
                first_name = user.FirstName,
                last_name = user.LastName,
                full_name = $"{user.FirstName} {user.LastName}",
                role = user.Role,
                utype = user.Role.ToLower(),
                trainer_id = user.TrainerProfile?.Id,
                learner_id = user.LearnerProfile?.Id,
                phone = user.Phone,
                is_active = user.IsActive
            }
        });
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLower());
        if (user == null)
        {
            return Ok(new { message = "If this account exists, an OTP will be sent." });
        }

        var otp = new Random().Next(100000, 999999).ToString();
        _cache.Set($"OTP_{request.Email.Trim().ToLower()}", otp, TimeSpan.FromMinutes(15));
        
        Console.WriteLine($"\n[MAIL SIMULATION] Sent OTP {otp} to {request.Email}\n");

        return Ok(new { message = "OTP sent successfully" });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest request)
    {
        var cacheKey = $"OTP_{request.Email.Trim().ToLower()}";
        if (!_cache.TryGetValue(cacheKey, out string? savedOtp) || savedOtp != request.Otp)
        {
            return BadRequest(new { message = "Invalid or expired OTP" });
        }

        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLower());
        if (user == null) return BadRequest(new { message = "User not found" });

        var newHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatePassword(newHash);
        await _userRepository.UpdateAsync(user);

        _cache.Remove(cacheKey);

        return Ok(new { message = "Password reset successfully" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(
            Guid.Parse(userIdStr),
            q => q.Include(u => u.TrainerProfile)
                  .Include(u => u.LearnerProfile));

        if (user == null) return NotFound();

        return Ok(new 
        {
            id = user.Id,
            email = user.Email,
            first_name = user.FirstName,
            last_name = user.LastName,
            full_name = $"{user.FirstName} {user.LastName}",
            role = user.Role,
            utype = user.Role.ToLower(),
            trainer_id = user.TrainerProfile?.Id,
            learner_id = user.LearnerProfile?.Id,
            phone = user.Phone,
            is_active = user.IsActive
        });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RegisterRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string? Role { get; set; } = "Learner";
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = "";
    public string NewPassword { get; set; } = "";
}

public class ForgotPasswordRequest
{
    public string Email { get; set; } = "";
}

public class ResetPasswordRequest
{
    public string Email { get; set; } = "";
    public string Otp { get; set; } = "";
    public string NewPassword { get; set; } = "";
}
