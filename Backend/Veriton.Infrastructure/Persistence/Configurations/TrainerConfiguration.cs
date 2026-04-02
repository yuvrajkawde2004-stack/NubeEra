using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Veriton.Domain.Entities;

namespace Veriton.Infrastructure.Persistence.Configurations;

public class TrainerConfiguration : IEntityTypeConfiguration<Trainer>
{
    public void Configure(EntityTypeBuilder<Trainer> builder)
    {
        builder.ToTable("trainers");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnType("char(36)");
        
        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.LastName).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Email).IsRequired().HasMaxLength(150);
        builder.HasIndex(x => x.Email);
        
        builder.Property(x => x.Phone).HasMaxLength(20);
        builder.Property(x => x.Gender).HasMaxLength(10);
        builder.Property(x => x.Qualification).HasMaxLength(200);
        builder.Property(x => x.IsActive).HasDefaultValue(true);
        
        builder.HasOne(x => x.User).WithOne(x => x.TrainerProfile).HasForeignKey<Trainer>(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
    }
}