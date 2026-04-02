using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Veriton.Domain.Entities;

namespace Veriton.Infrastructure.Persistence.Configurations;

public class LearnerConfiguration : IEntityTypeConfiguration<Learner>
{
    public void Configure(EntityTypeBuilder<Learner> builder)
    {
        builder.ToTable("learners");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnType("char(36)");

        builder.Property(x => x.LearnerId).IsRequired().HasMaxLength(50);
        builder.HasIndex(x => x.LearnerId).IsUnique();

        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(150);
        builder.HasIndex(x => x.Email);

        builder.Property(x => x.Phone).HasMaxLength(20);
        builder.Property(x => x.Gender).HasMaxLength(10);
        builder.Property(x => x.IsActive).HasDefaultValue(true);

        builder.HasOne(x => x.User).WithOne(x => x.LearnerProfile).HasForeignKey<Learner>(x => x.UserId).OnDelete(DeleteBehavior.SetNull);
    }
}