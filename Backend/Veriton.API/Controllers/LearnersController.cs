using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Application.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/learners")]
[Authorize]
public class LearnersController : ControllerBase
{
    private readonly IGenericService<LearnerCreateDto, LearnerUpdateDto, LearnerDto> _service;

    public LearnersController(IGenericService<LearnerCreateDto, LearnerUpdateDto, LearnerDto> service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.TrainerAndAbove)]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Roles = AppRoles.TrainerAndAbove)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var learner = await _service.GetByIdAsync(id);
        return learner == null ? NotFound() : Ok(learner);
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.TrainerAndAbove)]
    public async Task<IActionResult> Create(LearnerCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.TrainerAndAbove)]
    public async Task<IActionResult> Update(Guid id, LearnerUpdateDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = AppRoles.TrainerAndAbove)]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}