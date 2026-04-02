using Microsoft.Extensions.DependencyInjection;
using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;
using Veriton.Application.Services;

namespace Veriton.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Trainer Service
        services.AddScoped<IGenericService<TrainerCreateDto, TrainerUpdateDto, TrainerDto>, TrainerService>();

        // Learner Service
        services.AddScoped<IGenericService<LearnerCreateDto, LearnerUpdateDto, LearnerDto>, LearnerService>();

        // Module Service
        services.AddScoped<IGenericService<ModuleCreateDto, ModuleUpdateDto, ModuleDto>, ModuleService>();

        // Lesson Service
        services.AddScoped<ILessonService, LessonService>();
        services.AddScoped<IGenericService<LessonCreateDto, LessonUpdateDto, LessonDto>>(sp => sp.GetRequiredService<ILessonService>());

        // Question Service
        services.AddScoped<IGenericService<QuestionCreateDto, QuestionUpdateDto, QuestionDto>, QuestionService>();

        // Dashboard Stats Service
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
