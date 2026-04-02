using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

public class Learner : BaseEntity
{
    public Guid? UserId { get; set; }
    public string LearnerId { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Address { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public User? User { get; set; }
}
