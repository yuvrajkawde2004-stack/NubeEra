using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Veriton.Domain.Entities;

namespace Veriton.Infrastructure.Persistence.Configurations;

public class LessonConfiguration : IEntityTypeConfiguration<Lesson>
{
    public void Configure(EntityTypeBuilder<Lesson> builder)
    {
        builder.ToTable("lessons");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnType("char(36)");

        builder.Property(x => x.SubTopic).IsRequired().HasMaxLength(300);
        builder.Property(x => x.Activity).HasMaxLength(1000);
        builder.Property(x => x.VideoUrl).HasMaxLength(500);
        builder.Property(x => x.DiagramUrl).HasMaxLength(500);
        builder.Property(x => x.Code).HasColumnType("text");
        builder.Property(x => x.Procedure).HasColumnType("text");
        builder.Property(x => x.RequiredMaterial).HasColumnType("text");
        builder.Property(x => x.WhatYouGet).HasColumnType("text");
        builder.Property(x => x.IsActive).HasDefaultValue(true);

        builder.Property(x => x.CreatedByTrainerId).HasColumnType("char(36)");
        builder.HasOne(x => x.Module).WithMany(x => x.Lessons).HasForeignKey(x => x.ModuleId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(x => x.CreatedByTrainer).WithMany(x => x.Lessons).HasForeignKey(x => x.CreatedByTrainerId).OnDelete(DeleteBehavior.SetNull);
    }
}
