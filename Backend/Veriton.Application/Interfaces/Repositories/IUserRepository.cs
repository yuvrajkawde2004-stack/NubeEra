using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Veriton.Domain.Entities;

namespace Veriton.Application.Interfaces.Repositories
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email, Func<IQueryable<User>, IQueryable<User>>? include = null);
        Task<User?> GetByEmailOrPhoneAsync(string identifier, Func<IQueryable<User>, IQueryable<User>>? include = null);
        Task<User?> GetByExternalProviderAsync(string provider, string providerId, Func<IQueryable<User>, IQueryable<User>>? include = null);
        // AddAsync is already in IGenericRepository
    }
}
