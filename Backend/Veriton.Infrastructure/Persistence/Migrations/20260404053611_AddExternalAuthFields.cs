using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Veriton.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalAuthFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_lessons_trainers_CreatedByTrainerId",
                table: "lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_modules_trainers_CreatedByTrainerId",
                table: "modules");

            migrationBuilder.AddColumn<string>(
                name: "ExternalId",
                table: "users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ExternalProvider",
                table: "users",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "TrainerId",
                table: "trainers",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_lessons_trainers_CreatedByTrainerId",
                table: "lessons",
                column: "CreatedByTrainerId",
                principalTable: "trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_modules_trainers_CreatedByTrainerId",
                table: "modules",
                column: "CreatedByTrainerId",
                principalTable: "trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_lessons_trainers_CreatedByTrainerId",
                table: "lessons");

            migrationBuilder.DropForeignKey(
                name: "FK_modules_trainers_CreatedByTrainerId",
                table: "modules");

            migrationBuilder.DropColumn(
                name: "ExternalId",
                table: "users");

            migrationBuilder.DropColumn(
                name: "ExternalProvider",
                table: "users");

            migrationBuilder.UpdateData(
                table: "trainers",
                keyColumn: "TrainerId",
                keyValue: null,
                column: "TrainerId",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "TrainerId",
                table: "trainers",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "FK_lessons_trainers_CreatedByTrainerId",
                table: "lessons",
                column: "CreatedByTrainerId",
                principalTable: "trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_modules_trainers_CreatedByTrainerId",
                table: "modules",
                column: "CreatedByTrainerId",
                principalTable: "trainers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
