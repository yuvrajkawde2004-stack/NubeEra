using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

/// <summary>
/// Represents a multiple-choice Question within a Module.
/// </summary>
public class Question : BaseEntity
{
    public Guid? ModuleId { get; set; }
    public string QuestionText { get; set; } = null!;
    public string OptionA { get; set; } = null!;
    public string OptionB { get; set; } = null!;
    public string OptionC { get; set; } = null!;
    public string OptionD { get; set; } = null!;
    public string CorrectAnswer { get; set; } = null!; // "A", "B", "C", "D"
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Module? Module { get; set; }
}
