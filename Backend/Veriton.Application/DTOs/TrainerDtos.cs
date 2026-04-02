namespace Veriton.Application.DTOs;

public class TrainerBaseDto
{
    public string? TrainerId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
}

public class TrainerCreateDto : TrainerBaseDto
{
    public string? Password { get; set; }
}

public class TrainerUpdateDto : TrainerBaseDto
{
    public bool IsActive { get; set; }
}

public class TrainerDto
{
    public Guid Id { get; set; }
    public string? TrainerId { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public string? Qualification { get; set; }
    public string? Specialization { get; set; }
    public bool IsActive { get; set; }
}