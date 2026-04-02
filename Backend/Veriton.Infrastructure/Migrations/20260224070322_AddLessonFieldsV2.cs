using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Veriton.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLessonFieldsV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RequiredMaterial",
                table: "lessons",
                type: "text",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "WhatYouGet",
                table: "lessons",
                type: "text",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RequiredMaterial",
                table: "lessons");

            migrationBuilder.DropColumn(
                name: "WhatYouGet",
                table: "lessons");
        }
    }
}
