namespace Veriton.Application.DTOs;

public class DashboardStatsDto
{
    // Core counts
    public int TotalLearners { get; set; }
    public int TotalTrainers { get; set; }
    public int TotalModules { get; set; }
    public int TotalLessons { get; set; }

    // Pending counts
    public int TotalTrainersPending { get; set; }
    public int TotalLearnersPending { get; set; }
    public int TotalActiveLearners { get; set; }
    public int TotalLessonCompletions { get; set; }

    // Chart Data
    public List<LearnerProgressStatDto> LearnerProgress { get; set; } = new();
    public List<TrainerStatDto> TrainerStats { get; set; } = new();
}

public class LearnerProgressStatDto
{
    public string Name { get; set; } = null!;
    public double Progress { get; set; }
}

public class TrainerStatDto
{
    public string Name { get; set; } = null!;
    public double Value { get; set; }
}
