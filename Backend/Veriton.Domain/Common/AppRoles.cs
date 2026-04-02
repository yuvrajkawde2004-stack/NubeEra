namespace Veriton.Domain.Common;

/// <summary>
/// Role constants matching the school operational hierarchy.
/// </summary>
public static class AppRoles
{
    public const string Staff = "Staff";
    public const string Trainer = "Trainer";
    public const string Learner = "Learner";

    /// <summary>
    /// Roles that can perform administrative operations.
    /// </summary>
    public const string AdminAndAbove = Staff;

    /// <summary>
    /// Roles that manage curriculum and platform settings.
    /// </summary>
    public const string StaffAndAbove = Staff;

    /// <summary>
    /// Roles that manage training content.
    /// </summary>
    public const string TrainerAndAbove = $"{Staff},{Trainer}";

    /// <summary>
    /// All authenticated roles.
    /// </summary>
    public const string AllRoles = $"{Staff},{Trainer},{Learner}";
}
