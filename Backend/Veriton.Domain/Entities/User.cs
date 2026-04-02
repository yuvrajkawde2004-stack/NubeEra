using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

public class User : BaseEntity
{
    public string Email { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public string Role { get; private set; } = "Learner"; // "Staff", "Trainer", "Learner"
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public bool IsActive { get; private set; } = true;
    public DateTime? LastLoginAt { get; set; }

    // Navigation Properties
    public Trainer? TrainerProfile { get; set; }
    public Learner? LearnerProfile { get; set; }

    private User() { }

    public User(string email, string passwordHash, string role = "Learner")
    {
        Id = Guid.NewGuid();
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
        CreatedAt = DateTime.UtcNow;
    }


    public void UpdatePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
    }

    public void UpdateLastLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }

    public void SetRole(string role)
    {
        Role = role;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public void Activate()
    {
        IsActive = true;
    }
}
