import Cycle from "../models/Cycle.js";
import PeriodPreparation from "../models/PeriodPreparation.js";
import Reminder from "../models/Reminder.js";

const defaultChecklist = [
  { id: "products", label: "Check menstrual products", checked: false },
  { id: "spares", label: "Pack a spare pair of underwear", checked: false },
  { id: "pain-care", label: "Keep a heat pack or comfort item ready", checked: false },
  { id: "hydration", label: "Prepare water bottle and hydration reminder", checked: false },
  { id: "schedule", label: "Plan a lighter schedule if needed", checked: false }
];

const getEstimatedNextPeriod = (latestCycle, user) => {
  if (!latestCycle) return null;

  const cycleLength = latestCycle.cycleLength ||
    user.preferences?.cycleLength || 28;

  const nextPeriod = new Date(latestCycle.periodStartDate);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

  return nextPeriod;
};

export const getPeriodPreparation = async (req, res) => {
  try {
    const latestCycle = await Cycle.findOne({
      user: req.user._id
    }).sort({ periodStartDate: -1 });

    let plan = await PeriodPreparation.findOne({
      user: req.user._id
    });

    if (!plan) {
      plan = await PeriodPreparation.create({
        user: req.user._id,
        checklist: defaultChecklist,
        personalNotes: "",
        reminderLeadDays: 3
      });
    }

    const estimatedNextPeriod = getEstimatedNextPeriod(latestCycle, req.user);

    let daysUntilNextPeriod = null;

    if (estimatedNextPeriod) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const estimate = new Date(estimatedNextPeriod);
      estimate.setHours(0, 0, 0, 0);

      daysUntilNextPeriod = Math.ceil(
        (estimate - today) / 86400000
      );
    }

    return res.status(200).json({
      success: true,
      estimatedNextPeriod,
      daysUntilNextPeriod,
      cycleLength: latestCycle
        ? latestCycle.cycleLength || req.user.preferences?.cycleLength || 28
        : null,
      plan,
      disclaimer: "Dates are estimates and may vary from cycle to cycle."
    });
  } catch (error) {
    console.error("Get period preparation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load period preparation information"
    });
  }
};

export const updatePeriodPreparation = async (req, res) => {
  try {
    const { checklist, personalNotes, reminderLeadDays } = req.body;

    if (checklist !== undefined) {
      if (!Array.isArray(checklist) || checklist.length > 30) {
        return res.status(400).json({
          success: false,
          message: "Checklist must be a valid list"
        });
      }

      const validChecklist = checklist.every((item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.label === "string" &&
        item.label.trim().length > 0 &&
        item.label.length <= 120 &&
        typeof item.checked === "boolean"
      );

      if (!validChecklist) {
        return res.status(400).json({
          success: false,
          message: "Checklist contains invalid items"
        });
      }
    }

    if (personalNotes !== undefined) {
      if (typeof personalNotes !== "string" || personalNotes.length > 500) {
        return res.status(400).json({
          success: false,
          message: "Personal notes cannot exceed 500 characters"
        });
      }
    }

    if (reminderLeadDays !== undefined) {
      const leadDays = Number(reminderLeadDays);

      if (!Number.isInteger(leadDays) || leadDays < 0 || leadDays > 30) {
        return res.status(400).json({
          success: false,
          message: "Reminder lead time must be between 0 and 30 days"
        });
      }
    }

    let plan = await PeriodPreparation.findOne({
      user: req.user._id
    });

    if (!plan) {
      plan = new PeriodPreparation({
        user: req.user._id,
        checklist: defaultChecklist
      });
    }

    if (checklist !== undefined) {
      plan.checklist = checklist.map((item) => ({
        id: item.id,
        label: item.label.trim(),
        checked: item.checked
      }));
    }

    if (personalNotes !== undefined) {
      plan.personalNotes = personalNotes.trim();
    }

    if (reminderLeadDays !== undefined) {
      plan.reminderLeadDays = Number(reminderLeadDays);
    }

    await plan.save();

    const latestCycle = await Cycle.findOne({ user: req.user._id })
      .sort({ periodStartDate: -1 });

    const estimatedNextPeriod = getEstimatedNextPeriod(latestCycle, req.user);

    if (estimatedNextPeriod) {
      const reminderDate = new Date(estimatedNextPeriod);
      reminderDate.setDate(reminderDate.getDate() - plan.reminderLeadDays);

      if (reminderDate > new Date()) {
        const existingReminder = await Reminder.findOne({
          user: req.user._id,
          type: "period",
          title: "Prepare for your estimated period"
        });

        if (existingReminder) {
          existingReminder.scheduledAt = reminderDate;
          existingReminder.isActive = true;
          existingReminder.isCompleted = false;
          existingReminder.isNotified = false;
          await existingReminder.save();
        } else {
          await Reminder.create({
            user: req.user._id,
            title: "Prepare for your estimated period",
            type: "period",
            scheduledAt: reminderDate
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Period preparation plan updated",
      plan
    });
  } catch (error) {
    console.error("Update period preparation error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update period preparation plan"
    });
  }
};
