using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Veriton.Domain.Entities;

namespace Veriton.Infrastructure.Persistence.Configurations;

public class ModuleConfiguration : IEntityTypeConfiguration<Module>
{
    public void Configure(EntityTypeBuilder<Module> builder)
    {
        builder.ToTable("modules");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnType("char(36)");

        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.IsActive).HasDefaultValue(true);

        builder.HasOne(x => x.CreatedByTrainer).WithMany(x => x.Modules).HasForeignKey(x => x.CreatedByTrainerId).IsRequired(false).OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(x => x.Name);
    }
}