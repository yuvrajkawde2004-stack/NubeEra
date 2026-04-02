using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Domain.Common;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IGenericRepository<Learner> _learnerRepository;
    private readonly IGenericRepository<Trainer> _trainerRepository;

    public UsersController(
        IUserRepository userRepository, 
        ICurrentUserService currentUserService,
        IGenericRepository<Learner> learnerRepository,
        IGenericRepository<Trainer> trainerRepository)
    {
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _learnerRepository = learnerRepository;
        _trainerRepository = trainerRepository;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdStr));
            
        if (user == null) return NotFound();
        
        var learner = (await _learnerRepository.GetAllAsync(q => q.Where(s => s.UserId == user.Id))).FirstOrDefault();
        var trainer = (await _trainerRepository.GetAllAsync(q => q.Where(t => t.UserId == user.Id))).FirstOrDefault();

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            first_name = user.FirstName,
            last_name = user.LastName,
            full_name = $"{user.FirstName} {user.LastName}",
            role = user.Role,
            utype = user.Role.ToLower(),
            phone = user.Phone,
            is_active = user.IsActive,
            
            learner_details = learner != null ? new {
                gender = learner.Gender,
                learner_id = learner.LearnerId
            } : null,

            trainer_details = trainer != null ? new {
                gender = trainer.Gender,
                qualification = trainer.Qualification
            } : null
        });
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                        ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                        
        if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

        var user = await _userRepository.GetByIdAsync(Guid.Parse(userIdStr));
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Phone = request.Phone;

        await _userRepository.UpdateAsync(user);

        var learner = (await _learnerRepository.GetAllAsync(q => q.Where(s => s.UserId == user.Id))).FirstOrDefault();
        if (learner != null)
        {
            learner.FirstName = request.FirstName ?? learner.FirstName;
            learner.LastName = request.LastName ?? learner.LastName;
            learner.Phone = request.Phone;
            learner.Gender = request.Gender;
            await _learnerRepository.UpdateAsync(learner);
        }

        var trainer = (await _trainerRepository.GetAllAsync(q => q.Where(t => t.UserId == user.Id))).FirstOrDefault();
        if (trainer != null)
        {
            trainer.FirstName = request.FirstName ?? trainer.FirstName;
            trainer.LastName = request.LastName ?? trainer.LastName;
            trainer.Phone = request.Phone;
            trainer.Gender = request.Gender;
            trainer.Qualification = request.Qualification;
            await _trainerRepository.UpdateAsync(trainer);
        }

        return NoContent();
    }

    [HttpGet]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> GetAll([FromQuery] string? role)
    {
        var users = await _userRepository.GetAllAsync();
        
        IEnumerable<User> filtered = users;
        
        if (!string.IsNullOrEmpty(role))
            filtered = filtered.Where(u => u.Role == role);
            
        var response = filtered.Select(u => new
        {
            id = u.Id,
            email = u.Email,
            first_name = u.FirstName,
            last_name = u.LastName,
            full_name = $"{u.FirstName} {u.LastName}",
            role = u.Role,
            utype = u.Role.ToLower(),
            is_active = u.IsActive,
            phone = u.Phone,
            created_at = u.CreatedAt
        });

        return Ok(response);
    }

    [HttpPost]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Create(UserCreateRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var existingUser = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLower(), null);
        if (existingUser != null)
            return BadRequest(new { message = "User with this email already exists" });

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new User(request.Email.Trim().ToLower(), passwordHash, request.Role);
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;

        await _userRepository.AddAsync(user);

        if (request.Role.Equals("Trainer", StringComparison.OrdinalIgnoreCase))
        {
            var trainer = new Trainer
            {
                UserId = user.Id,
                TrainerId = "T-" + DateTime.UtcNow.Ticks.ToString().Substring(10),
                FirstName = request.FirstName ?? "",
                LastName = request.LastName ?? "",
                Email = request.Email.Trim().ToLower(),
                IsActive = true
            };
            await _trainerRepository.AddAsync(trainer);
        }
        else if (request.Role.Equals("Learner", StringComparison.OrdinalIgnoreCase))
        {
            var learner = new Learner
            {
                UserId = user.Id,
                FirstName = request.FirstName ?? "",
                LastName = request.LastName ?? "",
                Email = request.Email.Trim().ToLower(),
                LearnerId = "L-" + DateTime.UtcNow.Ticks.ToString().Substring(10),
                IsActive = true
            };
            await _learnerRepository.AddAsync(learner);
        }

        return Ok(new { id = user.Id, message = "User created successfully" });
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Update(Guid id, UserUpdateRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.SetRole(request.Role);
        
        if (request.IsActive) user.Activate();
        else user.Deactivate();

        await _userRepository.UpdateAsync(user);
        return NoContent();
    }

    [HttpPut("{id}/toggle-status")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> ToggleStatus(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        if (user.IsActive) user.Deactivate();
        else user.Activate();

        await _userRepository.UpdateAsync(user);
        return Ok(new { is_active = user.IsActive, message = user.IsActive ? "User activated" : "User put on hold" });
    }

    [HttpPut("{id}/reset-password")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> ResetPassword(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        var defaultPassword = user.Role switch
        {
            "Learner" => "Learner@123",
            "Trainer" => "Trainer@123",
            "Staff" => "Staff@123",
            _ => "Default@123"
        };

        var newHash = BCrypt.Net.BCrypt.HashPassword(defaultPassword);
        user.UpdatePassword(newHash);

        await _userRepository.UpdateAsync(user);
        return Ok(new { message = $"Password reset to default for {user.Email}" });
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null) return NotFound();

        // Delete associated Trainer profile if exists
        var trainer = (await _trainerRepository.GetAllAsync(q => q.Where(t => t.UserId == user.Id))).FirstOrDefault();
        if (trainer != null)
        {
            await _trainerRepository.DeleteAsync(trainer);
        }

        // Delete associated Learner profile if exists
        var learner = (await _learnerRepository.GetAllAsync(q => q.Where(l => l.UserId == user.Id))).FirstOrDefault();
        if (learner != null)
        {
            await _learnerRepository.DeleteAsync(learner);
        }

        await _userRepository.DeleteAsync(user);
        return NoContent();
    }
}

public class UserCreateRequest
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string Role { get; set; } = "Learner";
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
}

public class UserUpdateRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string Role { get; set; } = "Learner";
    public bool IsActive { get; set; }
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public string? Qualification { get; set; }
}
