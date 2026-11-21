
import Cycle from "../models/Cycle.js";
import wellnessData from "../utils/wellnessData.js";

// Calculate difference between two calendar dates
const getDaysDifference = (startDate, currentDate) => {
  const start = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );

  const current = Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  return Math.floor((current - start) / 86400000);
};

// Get today's wellness information
export const getTodayWellness = async (req, res) => {
  try {
    const latestCycle = await Cycle.findOne({
      user: req.user._id
    }).sort({ periodStartDate: -1 });

    // No cycle recorded: this is a valid empty state, not an API error.
    if (!latestCycle) {
      return res.status(200).json({
        success: true,
        cycleDay: null,
        cycleLength: req.user.preferences?.cycleLength || 28,
        phase: null,
        message: "Add your period start date to receive wellness guidance.",
        estimatedOvulationDay: null,
        wellness: null,
        note: "Wellness guidance will appear after you record your first period."
      });
    }

    const cycleLength =
      latestCycle.cycleLength ||
      req.user.preferences?.cycleLength ||
      28;

    const currentDate = new Date();

    const daysDifference = getDaysDifference(
      new Date(latestCycle.periodStartDate),
      currentDate
    );

    if (daysDifference < 0) {
      return res.status(400).json({
        success: false,
        message: "Cycle start date cannot be in the future."
      });
    }

    const cycleDay = daysDifference + 1;

    const periodLength =
      req.user.preferences?.periodLength || 5;

    const estimatedOvulationDay = Math.max(
      1,
      cycleLength - 14
    );

    // Cycle has passed its estimated length
    if (cycleDay > cycleLength) {
      return res.status(200).json({
        success: true,
        cycleDay,
        cycleLength,
        phase: "overdue",
        message: "Your next period may be later than estimated.",
        wellness: null,
        note: "Cycle dates are estimates. Record a new period start date when your period begins."
      });
    }

    let phase;
    let phaseMessage;

    if (cycleDay <= periodLength) {
      phase = "menstrual";
      phaseMessage = "Take time for rest and gentle self-care.";
    } else if (cycleDay < estimatedOvulationDay) {
      phase = "follicular";
      phaseMessage = "Focus on balanced nutrition and comfortable activity.";
    } else if (cycleDay === estimatedOvulationDay) {
      phase = "ovulation";
      phaseMessage = "Stay hydrated and listen to your body.";
    } else {
      phase = "luteal";
      phaseMessage = "Prioritise rest, sleep and balanced meals.";
    }

    return res.status(200).json({
      success: true,
      cycleDay,
      cycleLength,
      phase,
      message: phaseMessage,
      estimatedOvulationDay,
      wellness: wellnessData[phase] || null,
      note: "Phase and ovulation dates are estimates, not medical predictions."
    });

  } catch (error) {
    console.error("Today's wellness error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate wellness information."
    });
  }
};

// Get information about all four cycle phases
export const getAllPhases = (req, res) => {
  return res.status(200).json({
    success: true,
    phases: wellnessData
  });
};
