using Microsoft.EntityFrameworkCore;
using Veriton.Application.Interfaces.Repositories;
using Veriton.Domain.Entities;
using Veriton.Infrastructure.Persistence.DbContext;

namespace Veriton.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, Func<IQueryable<User>, IQueryable<User>>? include = null)
    {
        IQueryable<User> query = _dbSet;
        
        if (include != null)
        {
            query = include(query);
        }

        return await query
            .Include(u => u.TrainerProfile)
            .Include(u => u.LearnerProfile)
            .FirstOrDefaultAsync(x => x.Email == email && x.IsActive);
    }

    public async Task<User?> GetByEmailOrPhoneAsync(string identifier, Func<IQueryable<User>, IQueryable<User>>? include = null)
    {
        IQueryable<User> query = _dbSet;
        
        if (include != null)
        {
            query = include(query);
        }

        return await query
            .Include(u => u.TrainerProfile)
            .Include(u => u.LearnerProfile)
            .FirstOrDefaultAsync(x => (x.Email == identifier || x.Phone == identifier) && x.IsActive);
    }

    public async Task<User?> GetByExternalProviderAsync(string provider, string providerId, Func<IQueryable<User>, IQueryable<User>>? include = null)
    {
        IQueryable<User> query = _dbSet;
        
        if (include != null)
        {
            query = include(query);
        }

        return await query
            .Include(u => u.TrainerProfile)
            .Include(u => u.LearnerProfile)
            .FirstOrDefaultAsync(x => x.ExternalProvider == provider && x.ExternalId == providerId && x.IsActive);
    }
}

