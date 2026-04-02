using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;
using Veriton.Domain.Common;

namespace Veriton.Application.Services;

public class TrainerService : IGenericService<TrainerCreateDto, TrainerUpdateDto, TrainerDto>
{
    private readonly IGenericRepository<Trainer> _repository;
    private readonly IUserRepository _userRepository;
    private readonly ICurrentUserService _currentUserService;

    public TrainerService(IGenericRepository<Trainer> repository, IUserRepository userRepository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _userRepository = userRepository;
        _currentUserService = currentUserService;
    }

    public async Task<List<TrainerDto>> GetAllAsync()
    {
        var trainers = await _repository.GetAllAsync();
        
        return trainers.Select(t => new TrainerDto
        {
            Id = t.Id,
            TrainerId = t.TrainerId,
            FirstName = t.FirstName,
            LastName = t.LastName,
            FullName = $"{t.FirstName} {t.LastName}",
            Email = t.Email,
            Phone = t.Phone,
            Gender = t.Gender,
            Qualification = t.Qualification,
            Specialization = t.Specialization,
            IsActive = t.IsActive
        }).ToList();
    }

    public async Task<TrainerDto?> GetByIdAsync(Guid id)
    {
        var t = await _repository.GetByIdAsync(id);
        if (t == null) return null;

        return new TrainerDto
        {
            Id = t.Id,
            TrainerId = t.TrainerId,
            FirstName = t.FirstName,
            LastName = t.LastName,
            FullName = $"{t.FirstName} {t.LastName}",
            Email = t.Email,
            Phone = t.Phone,
            Gender = t.Gender,
            Qualification = t.Qualification,
            Specialization = t.Specialization,
            IsActive = t.IsActive
        };
    }

    public async Task<Guid> CreateAsync(TrainerCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Password))
            throw new ArgumentException("Password is required when creating a trainer.");

        // Check for duplicate email
        var existing = await _userRepository.GetByEmailAsync(dto.Email.ToLower().Trim());
        if (existing != null)
            throw new InvalidOperationException($"A user with email '{dto.Email}' already exists.");

        var user = new User(
            email: dto.Email.ToLower().Trim(),
            passwordHash: BCrypt.Net.BCrypt.HashPassword(dto.Password),
            role: AppRoles.Trainer
        );
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Phone = dto.Phone;

        await _userRepository.AddAsync(user);

        var trainerId = dto.TrainerId;
        if (string.IsNullOrWhiteSpace(trainerId))
        {
            trainerId = $"TRN-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
        }

        var trainer = new Trainer
        {
            UserId = user.Id,
            TrainerId = trainerId,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Address = dto.Address,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Qualification = dto.Qualification,
            Specialization = dto.Specialization,
            IsActive = true
        };

        await _repository.AddAsync(trainer);
        return trainer.Id;
    }

    public async Task UpdateAsync(Guid id, TrainerUpdateDto dto)
    {
        var trainer = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Trainer not found");

        trainer.TrainerId = dto.TrainerId;
        trainer.FirstName = dto.FirstName;
        trainer.LastName = dto.LastName;
        trainer.Email = dto.Email;
        trainer.Phone = dto.Phone;
        trainer.Address = dto.Address;
        trainer.DateOfBirth = dto.DateOfBirth;
        trainer.Gender = dto.Gender;
        trainer.Qualification = dto.Qualification;
        trainer.Specialization = dto.Specialization;
        trainer.IsActive = dto.IsActive;

        await _repository.UpdateAsync(trainer);

        // Sync with User entity
        var user = await _userRepository.GetByIdAsync(trainer.UserId);
        if (user != null)
        {
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.Phone = dto.Phone;
            await _userRepository.UpdateAsync(user);
        }
    }

    public async Task DeleteAsync(Guid id)
    {
        var trainer = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Trainer not found");

        var userId = trainer.UserId;

        // Delete Trainer Profile
        await _repository.DeleteAsync(trainer);

        // Delete Associated User
        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            await _userRepository.DeleteAsync(user);
        }
    }
}