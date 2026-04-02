namespace Veriton.Domain.Common;

public interface IOwnedByTrainer
{
    Guid TrainerId { get; set; }
}

public interface IOwnedByLearner
{
    Guid LearnerId { get; set; }
}
