using Veriton.Application.DTOs;
using Veriton.Application.Interfaces.Services;

namespace Veriton.Application.Interfaces.Services;

public interface ILessonService : IGenericService<LessonCreateDto, LessonUpdateDto, LessonDto>
{
    Task MarkAsCompletedAsync(Guid lessonId);
    Task<List<Guid>> GetCompletedLessonIdsAsync();
}
