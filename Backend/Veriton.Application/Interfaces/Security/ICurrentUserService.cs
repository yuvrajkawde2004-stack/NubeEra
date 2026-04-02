using System.Security.Claims;

namespace Veriton.Application.Interfaces.Security;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Role { get; }
    Guid? TrainerId { get; }
    Guid? LearnerId { get; }
    bool IsAuthenticated { get; }
    ClaimsPrincipal User { get; }
}
