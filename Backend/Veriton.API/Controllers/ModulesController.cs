using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/modules")]
[Authorize]
public class ModulesController : ControllerBase
{
    private readonly IGenericService<ModuleCreateDto, ModuleUpdateDto, ModuleDto> _service;
    private readonly ILogger<ModulesController> _logger;

    public ModulesController(
        IGenericService<ModuleCreateDto, ModuleUpdateDto, ModuleDto> service,
        ILogger<ModulesController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Policy = "LearnerOnly")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "LearnerOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var module = await _service.GetByIdAsync(id);
        return module == null ? NotFound() : Ok(module);
    }

    [HttpPost]
    [Authorize(Policy = "StaffOnly")] 
    public async Task<IActionResult> Create(ModuleCreateDto dto)
    {
        try
        {
            var id = await _service.CreateAsync(dto);
            return Ok(new { id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating module");
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Update(Guid id, ModuleUpdateDto dto)
    {
        try
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating module {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "StaffOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting module {Id}", id);
            return BadRequest(new { message = ex.Message });
        }
    }
}