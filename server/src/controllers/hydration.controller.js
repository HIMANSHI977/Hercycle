import Hydration from "../models/Hydration.js";

const getStartAndEndOfToday = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

export const getTodayHydration = async (req, res) => {
  try {
    const { start, end } = getStartAndEndOfToday();

    const entries = await Hydration.find({
      user: req.user._id,
      recordedAt: { $gte: start, $lte: end }
    }).sort({ recordedAt: -1 });

    const totalMl = entries.reduce(
      (total, entry) => total + entry.amountMl,
      0
    );

    const goalMl = req.user.preferences?.hydrationGoalMl || 2000;

    return res.status(200).json({
      success: true,
      entries,
      totalMl,
      goalMl,
      percentage: Math.min(
        100,
        Math.round((totalMl / goalMl) * 100)
      )
    });
  } catch (error) {
    console.error("Get hydration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load hydration progress"
    });
  }
};

export const addHydration = async (req, res) => {
  try {
    const amountMl = Number(req.body.amountMl);

    if (!Number.isInteger(amountMl) || amountMl < 50 || amountMl > 3000) {
      return res.status(400).json({
        success: false,
        message: "Please enter an amount from 50 to 3000 ml"
      });
    }

    const entry = await Hydration.create({
      user: req.user._id,
      amountMl,
      recordedAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: "Water intake recorded",
      entry
    });
  } catch (error) {
    console.error("Add hydration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to record water intake"
    });
  }
};

export const deleteHydration = async (req, res) => {
  try {
    const entry = await Hydration.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Hydration entry not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hydration entry removed"
    });
  } catch (error) {
    console.error("Delete hydration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to remove hydration entry"
    });
  }
};

export const updateHydrationGoal = async (req, res) => {
  try {
    const goalMl = Number(req.body.goalMl);

    if (!Number.isInteger(goalMl) || goalMl < 500 || goalMl > 6000) {
      return res.status(400).json({
        success: false,
        message: "Please enter a goal from 500 to 6000 ml"
      });
    }

    req.user.preferences.hydrationGoalMl = goalMl;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Daily hydration goal updated",
      goalMl
    });
  } catch (error) {
    console.error("Update hydration goal error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update hydration goal"
    });
  }
};
