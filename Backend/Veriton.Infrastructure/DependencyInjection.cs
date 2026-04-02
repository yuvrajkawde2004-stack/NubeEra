using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading;
using Veriton.Infrastructure.Persistence.DbContext;

namespace Veriton.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("MySql");

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "MySQL connection string 'ConnectionStrings:MySql' is missing."
                );
            }

            services.AddDbContext<AppDbContext>(options =>
                options.UseMySql(
                    connectionString,
                    new MySqlServerVersion(new Version(8, 0, 33)),
                    mysqlOptions =>
                    {
                        mysqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 10,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null
                        );
                    }
                )
            );

            services.AddScoped(
                typeof(Veriton.Application.Interfaces.Repositories.IGenericRepository<>),
                typeof(Veriton.Infrastructure.Repositories.GenericRepository<>)
            );

            services.AddScoped<
                Veriton.Application.Interfaces.Repositories.IUserRepository,
                Veriton.Infrastructure.Repositories.UserRepository>
            ();

            services.AddScoped<
                Veriton.Application.Interfaces.Security.IJwtTokenService,
                Veriton.Infrastructure.Security.JwtTokenService>
            ();

            return services;
        }
    }
}
