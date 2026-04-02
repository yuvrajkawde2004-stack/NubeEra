using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

public class LessonCompletion : BaseEntity
{
    public Guid LearnerId { get; set; }
    public Guid LessonId { get; set; }
    public DateTime CompletionDate { get; set; }

    // Navigation Properties
    public Learner Learner { get; set; } = null!;
    public Lesson Lesson { get; set; } = null!;
}
