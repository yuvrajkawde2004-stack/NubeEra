using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Veriton.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangeTotalHoursToDouble : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "TotalHours",
                table: "lessons",
                type: "double",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "TotalHours",
                table: "lessons",
                type: "int",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "double");
        }
    }
}
