using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Common;

namespace Veriton.API.Controllers;

[ApiController]
[Route("api/questions")]
[Authorize]
public class QuestionsController : ControllerBase
{
    private readonly IGenericService<QuestionCreateDto, QuestionUpdateDto, QuestionDto> _service;

    public QuestionsController(IGenericService<QuestionCreateDto, QuestionUpdateDto, QuestionDto> service)
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
        var question = await _service.GetByIdAsync(id);
        return question == null ? NotFound() : Ok(question);
    }

    [HttpPost]
    [Authorize(Policy = "TrainerOnly")] 
    public async Task<IActionResult> Create(QuestionCreateDto dto)
        => Ok(new { id = await _service.CreateAsync(dto) });

    [HttpPut("{id}")]
    [Authorize(Policy = "TrainerOnly")]
    public async Task<IActionResult> Update(Guid id, QuestionUpdateDto dto)
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
}
