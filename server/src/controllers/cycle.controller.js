
import Cycle from "../models/Cycle.js";

// Add a new period record
export const addCycle = async (req, res) => {
  try {
    const {
      periodStartDate,
      periodEndDate,
      flow,
      notes
    } = req.body;

    if (!periodStartDate) {
      return res.status(400).json({
        success: false,
        message: "Period start date is required"
      });
    }

    const startDate = new Date(periodStartDate);

    if (Number.isNaN(startDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid start date"
      });
    }

    let endDate = null;

    if (periodEndDate) {
      endDate = new Date(periodEndDate);

      if (
        Number.isNaN(endDate.getTime()) ||
        endDate < startDate
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid period end date"
        });
      }
    }

    if (startDate > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Period start date cannot be in the future"
      });
    }

    const cycle = await Cycle.create({
      user: req.user._id,
      periodStartDate: startDate,
      periodEndDate: endDate,
      flow: flow || "unknown",
      notes: notes || ""
    });

    res.status(201).json({
      success: true,
      message: "Cycle record added successfully",
      cycle
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A cycle record already exists for this date"
      });
    }

    res.status(500).json({
      success: false,
      message: "Unable to add cycle record"
    });
  }
};

// Get all cycles belonging to the logged-in user
export const getCycles = async (req, res) => {
  try {
    const cycles = await Cycle.find({
      user: req.user._id
    }).sort({ periodStartDate: -1 });

    res.status(200).json({
      success: true,
      count: cycles.length,
      cycles
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch cycle records"
    });
  }
};

// Update a cycle record
export const updateCycle = async (req, res) => {
  try {
    const { periodEndDate, flow, notes } = req.body;

    const cycle = await Cycle.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle record not found"
      });
    }

    if (periodEndDate !== undefined) {
      if (periodEndDate === null || periodEndDate === "") {
        cycle.periodEndDate = null;
      } else {
        const endDate = new Date(periodEndDate);

        if (
          Number.isNaN(endDate.getTime()) ||
          endDate < cycle.periodStartDate ||
          endDate > new Date()
        ) {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid period end date"
          });
        }

        cycle.periodEndDate = endDate;
      }
    }

    if (flow !== undefined) cycle.flow = flow;
    if (notes !== undefined) cycle.notes = notes;

    await cycle.save();

    res.status(200).json({
      success: true,
      message: "Cycle record updated successfully",
      cycle
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update cycle record"
    });
  }
};

// Delete a cycle record
export const deleteCycle = async (req, res) => {
  try {
    const cycle = await Cycle.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!cycle) {
      return res.status(404).json({
        success: false,
        message: "Cycle record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Cycle record deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete cycle record"
    });
  }
};
// Get estimated next period date
export const getCyclePrediction = async (req, res) => {
  try {
    const latestCycle = await Cycle.findOne({
      user: req.user._id
    }).sort({ periodStartDate: -1 });

    // No cycle record available yet
    if (!latestCycle) {
      return res.status(200).json({
        success: true,
        prediction: null,
        estimatedNextPeriod: null,
        cycleLength: null,
        message: "Add your period details to get an estimate"
      });
    }

    const user = req.user;

    const cycleLength =
      latestCycle.cycleLength ||
      user.preferences?.cycleLength ||
      28;

    const nextPeriodDate = new Date(
      latestCycle.periodStartDate
    );

    nextPeriodDate.setDate(
      nextPeriodDate.getDate() + cycleLength
    );

    return res.status(200).json({
      success: true,
      prediction: nextPeriodDate,
      estimatedNextPeriod: nextPeriodDate,
      cycleLength,
      message: "This is an estimate, not a medical prediction"
    });

  } catch (error) {
    console.error("Cycle prediction error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to calculate cycle estimate"
    });
  }
};