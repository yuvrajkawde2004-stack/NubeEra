using Veriton.Domain.Common;
using Veriton.Domain.Entities;
using Veriton.Infrastructure.Persistence.DbContext;
using Microsoft.Extensions.Configuration;

namespace Veriton.Infrastructure.Persistence.Seed;

public static class AdminSeeder
{
    public static void Seed(AppDbContext context, IConfiguration configuration)
    {
        // Admin Credentials from Config or Defaults
        string adminEmail = configuration["Seed:AdminEmail"] ?? "staff@gmail.com";
        string adminPassword = configuration["Seed:AdminPassword"] ?? "Staff@123";

        // 1. Staff Admin
        SeedUser(context, adminEmail, adminPassword, AppRoles.Staff, "Antigravity", "Staff");

        // 2. Extra Staff
        SeedUser(context, "staff1@gmail.com", "Staff@123", AppRoles.Staff, "Support", "One");

        // 3. Trainer User
        SeedTrainer(context, "trainer1@gmail.com", "Staff@123", "TRAIN-001", "Lead", "Trainer");

        // 4. Learner User
        SeedLearner(context, "learner1@gmail.com", "Staff@123", "LEARN-001", "Active", "Learner");

        context.SaveChanges();
    }

    private static void SeedUser(AppDbContext context, string email, string password, string role, string firstName, string lastName)
    {
        if (!context.Users.Any(u => u.Email == email))
        {
            var user = new User(
                email: email,
                passwordHash: BCrypt.Net.BCrypt.HashPassword(password),
                role: role
            );
            user.FirstName = firstName;
            user.LastName = lastName;
            context.Users.Add(user);
            Console.WriteLine($"✅ User Seeded: {email} [Role: {role}]");
        }
    }

    private static void SeedTrainer(AppDbContext context, string email, string password, string trainerId, string firstName, string lastName)
    {
        if (!context.Users.Any(u => u.Email == email))
        {
            var user = new User(
                email: email,
                passwordHash: BCrypt.Net.BCrypt.HashPassword(password),
                role: AppRoles.Trainer
            );
            user.FirstName = firstName;
            user.LastName = lastName;
            context.Users.Add(user);

            var trainer = new Trainer
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                TrainerId = trainerId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                IsActive = true
            };
            context.Trainers.Add(trainer);
            Console.WriteLine($"✅ Trainer Seeded: {email}");
        }
    }

    private static void SeedLearner(AppDbContext context, string email, string password, string learnerId, string firstName, string lastName)
    {
        if (!context.Users.Any(u => u.Email == email))
        {
            var user = new User(
                email: email,
                passwordHash: BCrypt.Net.BCrypt.HashPassword(password),
                role: AppRoles.Learner
            );
            user.FirstName = firstName;
            user.LastName = lastName;
            context.Users.Add(user);

            var learner = new Learner
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                LearnerId = learnerId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                IsActive = true
            };
            context.Learners.Add(learner);
            Console.WriteLine($"✅ Learner Seeded: {email}");
        }
    }
}
