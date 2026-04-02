using Veriton.Domain.Common;

namespace Veriton.Domain.Entities;

/// <summary>
/// Represents a Lesson within a Module, created by a Trainer.
/// </summary>
public class Lesson : BaseEntity
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
    public Guid? CreatedByTrainerId { get; set; }
    public int SerialNumber { get; set; }
    public int TotalHours { get; set; } 
    public bool IsActive { get; set; } = true;

    // Navigation Properties
    public Module Module { get; set; } = null!;
    public Trainer? CreatedByTrainer { get; set; }
}
