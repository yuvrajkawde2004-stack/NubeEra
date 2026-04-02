using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Veriton.Infrastructure.Persistence.DbContext;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/dev")]
[AllowAnonymous] // ← This allows public access!
public class DevController : ControllerBase
{
    [HttpGet("hash")]
    public IActionResult Hash([FromQuery] string password)
    {
        if (string.IsNullOrEmpty(password))
            return BadRequest(new { error = "Password required" });

        var hash = BCrypt.Net.BCrypt.HashPassword(password);

        return Ok(new
        {
            password = password,
            hash = hash,
            message = "Password hashed successfully"
        });
    }
}