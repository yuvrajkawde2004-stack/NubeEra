namespace Veriton.Application.Interfaces.Services;

using Veriton.Application.DTOs;

public interface IDashboardService
{
    Task<DashboardStatsDto> GetStatsAsync();
}
