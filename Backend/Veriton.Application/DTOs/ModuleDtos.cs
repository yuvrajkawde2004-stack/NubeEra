namespace Veriton.Application.DTOs;

public class ModuleCreateDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTrainerId { get; set; }
}

public class ModuleUpdateDto
{
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTrainerId { get; set; }
    public bool IsActive { get; set; }
}

public class ModuleDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public int Credits { get; set; }
    public Guid? CreatedByTrainerId { get; set; }
    public string CreatedByTrainerName { get; set; } = "";
    public bool IsActive { get; set; }
    public int LessonCount { get; set; }
}