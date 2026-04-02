using Microsoft.EntityFrameworkCore;
using Veriton.Domain.Entities;
using Veriton.Domain.Common;
using Veriton.Application.Interfaces.Security;

namespace Veriton.Infrastructure.Persistence.DbContext;

public class AppDbContext : Microsoft.EntityFrameworkCore.DbContext
{
    private readonly ICurrentUserService? _currentUserService;

    public AppDbContext(DbContextOptions<AppDbContext> options, ICurrentUserService? currentUserService = null) 
        : base(options) 
    {
        _currentUserService = currentUserService;
    }

    // Platform tables
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Trainer> Trainers { get; set; } = null!;
    public DbSet<Learner> Learners { get; set; } = null!;

    // Learning Content
    public DbSet<Module> Modules { get; set; } = null!;
    public DbSet<Lesson> Lessons { get; set; } = null!;
    public DbSet<Question> Questions { get; set; } = null!;
    public DbSet<LessonCompletion> LessonCompletions { get; set; } = null!;
    public DbSet<UploadedFile> UploadedFiles { get; set; } = null!;

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker
            .Entries()
            .Where(e => e.Entity is BaseEntity && (
                e.State == EntityState.Added
                || e.State == EntityState.Modified));

        foreach (var entityEntry in entries)
        {
            var entity = (BaseEntity)entityEntry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;

            if (entityEntry.State == EntityState.Added)
            {
                entity.CreatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        var role = _currentUserService?.Role;
        var trainerId = _currentUserService?.TrainerId;
        var learnerId = _currentUserService?.LearnerId;

        // If Staff, bypass filters
        if (string.IsNullOrEmpty(role) || role == "Staff") return;

        // Apply Ownership Filters for Trainers
        if (role == "Trainer" && trainerId.HasValue)
        {
            // Simplified for now
        }

        // Apply Ownership Filters for Learners
        if (role == "Learner" && learnerId.HasValue)
        {
            // Only see self profile
            modelBuilder.Entity<Learner>().HasQueryFilter(x => x.Id == learnerId.Value);
        }
    }
}
