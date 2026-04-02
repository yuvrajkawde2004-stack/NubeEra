using Microsoft.EntityFrameworkCore;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Application.Interfaces.Services;
using Veriton.Domain.Entities;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Application.Services;

public class ModuleService : IGenericService<ModuleCreateDto, ModuleUpdateDto, ModuleDto>
{
    private readonly IGenericRepository<Module> _repository;
    private readonly ICurrentUserService _currentUserService;

    public ModuleService(IGenericRepository<Module> repository, ICurrentUserService currentUserService)
    {
        _repository = repository;
        _currentUserService = currentUserService;
    }

    public async Task<List<ModuleDto>> GetAllAsync()
    {
        var modules = await _repository.GetAllAsync(q => q
            .Include(m => m.CreatedByTrainer)
            .Include(m => m.Lessons));

        return modules.Select(m => new ModuleDto
        {
            Id = m.Id,
            Name = m.Name,
            Description = m.Description,
            Credits = m.Credits,
            CreatedByTrainerId = m.CreatedByTrainerId,
            CreatedByTrainerName = m.CreatedByTrainer != null
                ? $"{m.CreatedByTrainer.FirstName} {m.CreatedByTrainer.LastName}" : "System/Admin",
            IsActive = m.IsActive,
            LessonCount = m.Lessons?.Count ?? 0
        }).ToList();
    }

    public async Task<ModuleDto?> GetByIdAsync(Guid id)
    {
        var m = await _repository.GetByIdAsync(id, q => q
            .Include(m => m.CreatedByTrainer)
            .Include(m => m.Lessons));
        if (m == null) return null;

        return new ModuleDto
        {
            Id = m.Id,
            Name = m.Name,
            Description = m.Description,
            Credits = m.Credits,
            CreatedByTrainerId = m.CreatedByTrainerId,
            CreatedByTrainerName = m.CreatedByTrainer != null
                ? $"{m.CreatedByTrainer.FirstName} {m.CreatedByTrainer.LastName}" : "System/Admin",
            IsActive = m.IsActive,
            LessonCount = m.Lessons?.Count ?? 0
        };
    }

    public async Task<Guid> CreateAsync(ModuleCreateDto dto)
    {
        var module = new Module
        {
            Name = dto.Name,
            Description = dto.Description,
            Credits = dto.Credits,
            CreatedByTrainerId = dto.CreatedByTrainerId ?? _currentUserService.TrainerId,
            IsActive = true
        };

        await _repository.AddAsync(module);
        return module.Id;
    }

    public async Task UpdateAsync(Guid id, ModuleUpdateDto dto)
    {
        var module = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Module not found");

        module.Name = dto.Name;
        module.Description = dto.Description;
        module.Credits = dto.Credits;
        module.CreatedByTrainerId = dto.CreatedByTrainerId;
        module.IsActive = dto.IsActive;

        await _repository.UpdateAsync(module);
    }

    public async Task DeleteAsync(Guid id)
    {
        var module = await _repository.GetByIdAsync(id)
            ?? throw new Exception("Module not found");

        await _repository.DeleteAsync(module);
    }
}