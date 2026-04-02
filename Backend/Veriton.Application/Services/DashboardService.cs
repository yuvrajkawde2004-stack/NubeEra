using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;

namespace Veriton.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IGenericRepository<Learner> _learnerRepo;
    private readonly IGenericRepository<Trainer> _trainerRepo;
    private readonly IGenericRepository<Module> _moduleRepo;
    private readonly IGenericRepository<Lesson> _lessonRepo;
    private readonly IGenericRepository<LessonCompletion> _completionRepo;

    public DashboardService(
        IGenericRepository<Learner> learnerRepo,
        IGenericRepository<Trainer> trainerRepo,
        IGenericRepository<Module> moduleRepo,
        IGenericRepository<Lesson> lessonRepo,
        IGenericRepository<LessonCompletion> completionRepo)
    {
        _learnerRepo = learnerRepo;
        _trainerRepo = trainerRepo;
        _moduleRepo = moduleRepo;
        _lessonRepo = lessonRepo;
        _completionRepo = completionRepo;
    }

    public async Task<DashboardStatsDto> GetStatsAsync()
    {
        return new DashboardStatsDto
        {
            TotalLearners = await _learnerRepo.CountAsync(),
            TotalTrainers = await _trainerRepo.CountAsync(),
            TotalModules = await _moduleRepo.CountAsync(),
            TotalLessons = await _lessonRepo.CountAsync(),
            
            TotalTrainersPending = await _trainerRepo.CountAsync(q => q.Where(t => !t.IsActive)),
            TotalLearnersPending = await _learnerRepo.CountAsync(q => q.Where(s => !s.IsActive)),

            // Populate Chart Data
            LearnerProgress = await GetLearnerProgressStatsAsync(),
            TrainerStats = await GetTrainerStatsAsync()
        };
    }

    private async Task<List<LearnerProgressStatDto>> GetLearnerProgressStatsAsync()
    {
        var learners = await _learnerRepo.GetAllAsync(q => q.OrderByDescending(s => s.CreatedAt).Take(5));
        var completions = await _completionRepo.GetAllAsync();
        var lessonsCount = await _lessonRepo.CountAsync();

        return learners.Select(s => {
            var completed = completions.Count(c => c.LearnerId == s.Id);
            return new LearnerProgressStatDto {
                Name = s.FirstName,
                Progress = lessonsCount == 0 ? 0 : Math.Round((double)completed / lessonsCount * 100, 2)
            };
        }).ToList();
    }

    private async Task<List<TrainerStatDto>> GetTrainerStatsAsync()
    {
        var trainers = await _trainerRepo.GetAllAsync(q => q.Take(4));
        return trainers.Select(t => new TrainerStatDto {
            Name = t.FirstName,
            Value = 25
        }).ToList();
    }
}
