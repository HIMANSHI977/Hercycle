
import {
  CalendarDays,
  Droplets,
  Sparkles
} from "lucide-react";

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const getCycleDay = (startDate) => {
  if (!startDate) return null;

  const start = new Date(startDate);
  const today = new Date();

  if (Number.isNaN(start.getTime())) return null;

  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const difference = Math.floor(
    (today - start) / (1000 * 60 * 60 * 24)
  );

  return difference >= 0 ? difference + 1 : null;
};

const CycleCard = ({
  cycles = [],
  prediction,
  wellness,
  user
}) => {
  const latestCycle = cycles?.[0] || null;

  // Extract prediction response correctly
  const predictionInfo =
    prediction?.data || prediction;

  // Extract wellness response
  const wellnessInfo =
    wellness?.wellness ||
    wellness?.data ||
    wellness;

  const cycleLength =
    latestCycle?.cycleLength ||
    user?.preferences?.cycleLength ||
    28;

  const periodLength =
    latestCycle?.periodEndDate &&
    latestCycle?.periodStartDate
      ? Math.max(
          1,
          Math.round(
            (
              new Date(latestCycle.periodEndDate) -
              new Date(latestCycle.periodStartDate)
            ) / 86400000
          ) + 1
        )
      : user?.preferences?.periodLength || 5;

  const cycleDay = getCycleDay(
    latestCycle?.periodStartDate
  );

  const phase =
    wellnessInfo?.phase ||
    wellnessInfo?.currentPhase ||
    "Not available";

  // Read estimated date from backend response
  const nextPeriod =
    predictionInfo?.estimatedNextPeriod ||
    predictionInfo?.prediction ||
    predictionInfo?.nextPeriodDate ||
    predictionInfo?.predictedNextPeriod ||
    predictionInfo?.nextPeriod ||
    null;

  const phaseDescriptions = {
    menstrual: "Take time to rest and care for yourself.",
    follicular: "A time of renewal and fresh energy.",
    ovulation: "Your body may be entering its ovulation phase.",
    luteal: "Focus on nourishment and gentle self-care."
  };

  const description =
    phaseDescriptions[phase.toLowerCase()] ||
    "Understand your body, one day at a time.";

  return (
    <section className="cycle-card">

      {/* Card Header */}
      <div className="cycle-card-top">
        <div>
          <span className="eyebrow">
            YOUR CYCLE OVERVIEW
          </span>

          <h2>Your cycle journey</h2>

          <p>
            Understand your body, one day at a time.
          </p>
        </div>

        <div className="cycle-icon">
          <Droplets size={25} />
        </div>
      </div>

      {/* Cycle Progress */}
      <div className="cycle-progress">

        <div className="cycle-number">
          <strong>{cycleDay || "--"}</strong>
          <span>Day of cycle</span>
        </div>

        <div className="cycle-details">

          <span className="phase-tag">
            {phase}
          </span>

          <h3>{description}</h3>

          <p>
            {latestCycle
              ? `Your last recorded period started on ${formatDate(
                  latestCycle.periodStartDate
                )}.`
              : "Add your first period record to begin tracking your cycle."}
          </p>

        </div>
      </div>

      {/* Cycle Statistics */}
      <div className="cycle-stats">

        <div>
          <CalendarDays size={18} />

          <span>Cycle length</span>

          <strong>
            {cycleLength} days
          </strong>
        </div>

        <div>
          <Droplets size={18} />

          <span>Period duration</span>

          <strong>
            {periodLength} days
          </strong>
        </div>

        <div>
          <Sparkles size={18} />

          <span>Next period</span>

          <strong>
            {formatDate(nextPeriod)}
          </strong>
        </div>

      </div>

      {/* Estimate Information */}
      <p className="cycle-estimate-note">
        Cycle phases and upcoming period dates are estimates,
        based on your recorded information.
      </p>

    </section>
  );
};

export default CycleCard;
