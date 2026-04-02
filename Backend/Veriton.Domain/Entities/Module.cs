using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

/// <summary>
/// Represents a Learning Module, created by a Trainer.
/// </summary>
public class Module : BaseEntity
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTrainerId { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Trainer? CreatedByTrainer { get; set; }
    public ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();
    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
