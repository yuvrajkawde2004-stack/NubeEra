using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Application.Interfaces.Security;
using Veriton.Domain.Entities;
using Veriton.Domain.Common;

namespace Veriton.Application.Services;

public class LearnerService : IGenericService<LearnerCreateDto, LearnerUpdateDto, LearnerDto>
{
    private readonly IGenericRepository<Learner> _repository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly IGenericRepository<LessonCompletion> _completionRepository;
    private readonly IGenericRepository<Lesson> _lessonRepository;

    public LearnerService(
        IGenericRepository<Learner> repository, 
        IUserRepository userRepository, 
        ICurrentUserService currentUserService,
        IGenericRepository<LessonCompletion> completionRepository,
        IGenericRepository<Lesson> lessonRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
        _completionRepository = completionRepository;
        _lessonRepository = lessonRepository;
    }

    public async Task<List<LearnerDto>> GetAllAsync()
    {
        var learners = await _repository.GetAllAsync();
        var lessonsCount = await _lessonRepository.CountAsync();
        
        // Fetch completions efficiently if needed
        var completions = learners.Any() 
            ? await _completionRepository.GetAllAsync() 
            : new List<LessonCompletion>();

        return learners.Select(s => {
            var completedCount = completions.Count(c => c.LearnerId == s.Id);
            
            return new LearnerDto
            {
                Id = s.Id,
                LearnerId = s.LearnerId,
                FirstName = s.FirstName,
                LastName = s.LastName,
                FullName = $"{s.FirstName} {s.LastName}",
                Email = s.Email,
                Phone = s.Phone,
                DateOfBirth = s.DateOfBirth,
                Gender = s.Gender,
                Address = s.Address,
                IsActive = s.IsActive,
                ProgressPercentage = lessonsCount == 0 ? 0 : Math.Round((double)completedCount / lessonsCount * 100, 2)
            };
        }).ToList();
    }

    public async Task<LearnerDto?> GetByIdAsync(Guid id)
    {
        var s = await _repository.GetByIdAsync(id);
        if (s == null) return null;

        return new LearnerDto
        {
            Id = s.Id,
            LearnerId = s.LearnerId,
            FirstName = s.FirstName,
            LastName = s.LastName,
            FullName = $"{s.FirstName} {s.LastName}",
            Email = s.Email,
            Phone = s.Phone,
            DateOfBirth = s.DateOfBirth,
            Gender = s.Gender,
            Address = s.Address,
            IsActive = s.IsActive
        };
    }

    public async Task<Guid> CreateAsync(LearnerCreateDto dto)
    {
        User? user = null;
        if (!string.IsNullOrEmpty(dto.Email))
        {
            user = new User(
                email: dto.Email.ToLower().Trim(),
                passwordHash: BCrypt.Net.BCrypt.HashPassword(dto.Password),
                role: AppRoles.Learner
            );
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Phone = dto.Phone;

            await _userRepository.AddAsync(user);
        }

        var learner = new Learner
        {
            UserId = user?.Id,
            LearnerId = dto.LearnerId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Address = dto.Address,
            IsActive = true
        };

        await _repository.AddAsync(learner);
        return learner.Id;
    }

    public async Task UpdateAsync(Guid id, LearnerUpdateDto dto)
    {
        var learner = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Learner not found");

        learner.LearnerId = dto.LearnerId;
        learner.FirstName = dto.FirstName;
        learner.LastName = dto.LastName;
        learner.Email = dto.Email;
        learner.Phone = dto.Phone;
        learner.DateOfBirth = dto.DateOfBirth;
        learner.Gender = dto.Gender;
        learner.Address = dto.Address;
        learner.IsActive = dto.IsActive;

        await _repository.UpdateAsync(learner);

        // Sync with User entity
        if (learner.UserId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(learner.UserId.Value);
            if (user != null)
            {
                user.FirstName = dto.FirstName;
                user.LastName = dto.LastName;
                user.Phone = dto.Phone;
                await _userRepository.UpdateAsync(user);
            }
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        var learner = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Learner not found");

        var userId = learner.UserId;

        // Delete Learner Profile
        await _repository.DeleteAsync(learner);

        // Delete Associated User
        if (userId.HasValue)
        {
            var user = await _userRepository.GetByIdAsync(userId.Value);
            if (user != null)
            {
                await _userRepository.DeleteAsync(user);
            }
        }
    }
}