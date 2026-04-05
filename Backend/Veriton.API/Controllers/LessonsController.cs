using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/lessons")]
[Authorize]
public class LessonsController : ControllerBase
{
    private readonly ILessonService _service;

    public LessonsController(ILessonService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Policy = "LearnerOnly")]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());

    [HttpGet("{id}")]
    [Authorize(Policy = "LearnerOnly")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var lesson = await _service.GetByIdAsync(id);
        return lesson == null ? NotFound() : Ok(lesson);
    }

    [HttpPost]
    [Authorize(Policy = "TrainerOnly")] 
    public async Task<IActionResult> Create(LessonCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Policy = "TrainerOnly")]
    public async Task<IActionResult> Update(Guid id, LessonUpdateDto dto)
    {
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "TrainerOnly")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/complete")]
    [Authorize(Policy = "LearnerOnly")]
    public async Task<IActionResult> MarkCompleted(Guid id)
    {
        await _service.MarkAsCompletedAsync(id);
        return Ok();
    }

    [HttpGet("completed")]
    [Authorize(Policy = "LearnerOnly")]
    public async Task<IActionResult> GetCompleted()
        => Ok(await _service.GetCompletedLessonIdsAsync());

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecent([FromQuery] int count = 5)
        => Ok(await _service.GetRecentAsync(count));
}
