namespace Veriton.Application.DTOs;

public class LessonCreateDto
{
    public Guid ModuleId { get; set; }
    public string SubTopic { get; set; } = null!;
    public string? Activity { get; set; }
    public string? VideoUrl { get; set; }
    public string? DiagramUrl { get; set; }
    public string? Code { get; set; }
    public string? Procedure { get; set; }
    public string? RequiredMaterial { get; set; }
    public string? WhatYouGet { get; set; }
    public int SerialNumber { get; set; }
    public double TotalHours { get; set; }
    public Guid? CreatedByTrainerId { get; set; } 
}

public class LessonUpdateDto
{
    public Guid ModuleId { get; set; }
    public string SubTopic { get; set; } = null!;
    public string? Activity { get; set; }
    public string? VideoUrl { get; set; }
    public string? DiagramUrl { get; set; }
    public string? Code { get; set; }
    public string? Procedure { get; set; }
    public string? RequiredMaterial { get; set; }
    public string? WhatYouGet { get; set; }
    public int SerialNumber { get; set; }
    public double TotalHours { get; set; }
    public Guid? CreatedByTrainerId { get; set; } 
    public bool IsActive { get; set; }
}

public class LessonDto
{
    public Guid Id { get; set; }
    public Guid ModuleId { get; set; }
    public string ModuleName { get; set; } = "";
    public string SubTopic { get; set; } = null!;
    public string? Activity { get; set; }
    public string? VideoUrl { get; set; }
    public string? DiagramUrl { get; set; }
    public string? Code { get; set; }
    public string? Procedure { get; set; }
    public string? RequiredMaterial { get; set; }
    public string? WhatYouGet { get; set; }
    public int SerialNumber { get; set; }
    public double TotalHours { get; set; }
    public Guid? CreatedByTrainerId { get; set; }
    public string CreatedByTrainerName { get; set; } = "";
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
