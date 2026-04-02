using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class QuestionService : IGenericService<QuestionCreateDto, QuestionUpdateDto, QuestionDto>
{
    private readonly IGenericRepository<Question> _repository;
    private readonly ICurrentUserService _currentUserService;

    public QuestionService(IGenericRepository<Question> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<List<QuestionDto>> GetAllAsync()
    {
        var questions = await _repository.GetAllAsync(q => q
            .Include(x => x.Module));

        return questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            ModuleId = q.ModuleId,
            ModuleName = q.Module?.Name,
            QuestionText = q.QuestionText,
            OptionA = q.OptionA,
            OptionB = q.OptionB,
            OptionC = q.OptionC,
            OptionD = q.OptionD,
            CorrectAnswer = q.CorrectAnswer,
            IsActive = q.IsActive
        }).ToList();
    }

    public async Task<QuestionDto?> GetByIdAsync(Guid id)
    {
        var q = await _repository.GetByIdAsync(id, query => query
            .Include(x => x.Module));
        if (q == null) return null;

        return new QuestionDto
        {
            Id = q.Id,
            ModuleId = q.ModuleId,
            ModuleName = q.Module?.Name,
            QuestionText = q.QuestionText,
            OptionA = q.OptionA,
            OptionB = q.OptionB,
            OptionC = q.OptionC,
            OptionD = q.OptionD,
            CorrectAnswer = q.CorrectAnswer,
            IsActive = q.IsActive
        };
    }

    public async Task<Guid> CreateAsync(QuestionCreateDto dto)
    {
        var question = new Question
        {
            ModuleId = dto.ModuleId,
            QuestionText = dto.QuestionText,
            OptionA = dto.OptionA,
            OptionB = dto.OptionB,
            OptionC = dto.OptionC,
            OptionD = dto.OptionD,
            CorrectAnswer = dto.CorrectAnswer.ToUpper(),
            IsActive = true
        };

        await _repository.AddAsync(question);
        return question.Id;
    }

    public async Task UpdateAsync(Guid id, QuestionUpdateDto dto)
    {
        var question = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Question not found");

        question.ModuleId = dto.ModuleId;
        question.QuestionText = dto.QuestionText;
        question.OptionA = dto.OptionA;
        question.OptionB = dto.OptionB;
        question.OptionC = dto.OptionC;
        question.OptionD = dto.OptionD;
        question.CorrectAnswer = dto.CorrectAnswer.ToUpper();
        question.IsActive = dto.IsActive;

        await _repository.UpdateAsync(question);
    }

    public async Task DeleteAsync(Guid id)
    {
        var question = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Question not found");

        await _repository.DeleteAsync(question);
    }
}
