using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/trainers")]
[Authorize]
public class TrainersController : ControllerBase
{
    private readonly IGenericService<TrainerCreateDto, TrainerUpdateDto, TrainerDto> _service;

    public TrainersController(IGenericService<TrainerCreateDto, TrainerUpdateDto, TrainerDto> service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var trainer = await _service.GetByIdAsync(id);
        return trainer == null ? NotFound() : Ok(trainer);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> Create(TrainerCreateDto dto)
    {
        try
        {
            return Ok(new { id = await _service.CreateAsync(dto) });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> Update(Guid id, TrainerUpdateDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.Staff)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}