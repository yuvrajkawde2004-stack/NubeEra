using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class LessonService : ILessonService
{
    private readonly IGenericRepository<Lesson> _repository;
    private readonly IGenericRepository<LessonCompletion> _completionRepository;
    private readonly ICurrentUserService _currentUserService;

    public LessonService(
        IGenericRepository<Lesson> repository, 
        IGenericRepository<LessonCompletion> completionRepository,
        ICurrentUserService currentUserService)
    {
        _repository = repository;
        _completionRepository = completionRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<LessonDto>> GetAllAsync()
    {
        var lessons = await _repository.GetAllAsync(q => q
            .Include(l => l.Module)
            .Include(l => l.CreatedByTrainer));

        return lessons.Select(l => new LessonDto
        {
            Id = l.Id,
            ModuleId = l.ModuleId,
            ModuleName = l.Module?.Name ?? "",
            SubTopic = l.SubTopic,
            Activity = l.Activity,
            VideoUrl = l.VideoUrl,
            DiagramUrl = l.DiagramUrl,
            Code = l.Code,
            Procedure = l.Procedure,
            RequiredMaterial = l.RequiredMaterial,
            WhatYouGet = l.WhatYouGet,
            CreatedByTrainerId = l.CreatedByTrainerId,
            CreatedByTrainerName = l.CreatedByTrainer != null
                ? $"{l.CreatedByTrainer.FirstName} {l.CreatedByTrainer.LastName}" : "",
            SerialNumber = l.SerialNumber,
            TotalHours = l.TotalHours,
            IsActive = l.IsActive,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    public async Task<LessonDto?> GetByIdAsync(Guid id)
    {
        var l = await _repository.GetByIdAsync(id, q => q
            .Include(l => l.Module)
            .Include(l => l.CreatedByTrainer));
        if (l == null) return null;

        return new LessonDto
        {
            Id = l.Id,
            ModuleId = l.ModuleId,
            ModuleName = l.Module?.Name ?? "",
            SubTopic = l.SubTopic,
            Activity = l.Activity,
            VideoUrl = l.VideoUrl,
            DiagramUrl = l.DiagramUrl,
            Code = l.Code,
            Procedure = l.Procedure,
            RequiredMaterial = l.RequiredMaterial,
            WhatYouGet = l.WhatYouGet,
            SerialNumber = l.SerialNumber,
            TotalHours = l.TotalHours,
            CreatedByTrainerId = l.CreatedByTrainerId,
            CreatedByTrainerName = l.CreatedByTrainer != null
                ? $"{l.CreatedByTrainer.FirstName} {l.CreatedByTrainer.LastName}" : "",
            IsActive = l.IsActive,
            CreatedAt = l.CreatedAt
        };
    }

    public async Task<Guid> CreateAsync(LessonCreateDto dto)
    {
        var trainerId = dto.CreatedByTrainerId ?? _currentUserService.TrainerId;

        var lesson = new Lesson
        {
            ModuleId = dto.ModuleId,
            SubTopic = dto.SubTopic,
            Activity = dto.Activity,
            VideoUrl = dto.VideoUrl,
            DiagramUrl = dto.DiagramUrl,
            Code = dto.Code,
            Procedure = dto.Procedure,
            RequiredMaterial = dto.RequiredMaterial,
            WhatYouGet = dto.WhatYouGet,
            SerialNumber = dto.SerialNumber,
            TotalHours = dto.TotalHours,
            CreatedByTrainerId = trainerId,
            IsActive = true
        };

        await _repository.AddAsync(lesson);
        return lesson.Id;
    }

    public async Task UpdateAsync(Guid id, LessonUpdateDto dto)
    {
        var lesson = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Lesson not found");

        lesson.ModuleId = dto.ModuleId;
        lesson.SubTopic = dto.SubTopic;
        lesson.Activity = dto.Activity;
        lesson.VideoUrl = dto.VideoUrl;
        lesson.DiagramUrl = dto.DiagramUrl;
        lesson.Code = dto.Code;
        lesson.Procedure = dto.Procedure;
        lesson.RequiredMaterial = dto.RequiredMaterial;
        lesson.WhatYouGet = dto.WhatYouGet;
        lesson.SerialNumber = dto.SerialNumber;
        lesson.TotalHours = dto.TotalHours;
        if (dto.CreatedByTrainerId.HasValue)
            lesson.CreatedByTrainerId = dto.CreatedByTrainerId;
        lesson.IsActive = dto.IsActive;

        await _repository.UpdateAsync(lesson);
    }

    public async Task DeleteAsync(Guid id)
    {
        var lesson = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Lesson not found");

        await _repository.DeleteAsync(lesson);
    }

    public async Task MarkAsCompletedAsync(Guid lessonId)
    {
        var learnerId = _currentUserService.LearnerId ?? Guid.Empty;
        if (learnerId == Guid.Empty) throw new Exception("Only learners can mark lessons as complete");

        var existing = await _completionRepository.GetAllAsync(q => 
            q.Where(c => c.LessonId == lessonId && c.LearnerId == learnerId));

        if (existing.Any()) return;

        var completion = new LessonCompletion
        {
            LearnerId = learnerId,
            LessonId = lessonId,
            CompletionDate = DateTime.UtcNow
        };

        await _completionRepository.AddAsync(completion);
    }

    public async Task<List<Guid>> GetCompletedLessonIdsAsync()
    {
        var learnerId = _currentUserService.LearnerId ?? Guid.Empty;
        if (learnerId == Guid.Empty) return new List<Guid>();

        var completions = await _completionRepository.GetAllAsync(q => 
            q.Where(c => c.LearnerId == learnerId));

        return completions.Select(c => c.LessonId).ToList();
    }
}
