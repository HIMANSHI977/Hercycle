
import Symptom from "../models/Symptom.js";

const allowedSymptoms = [
  "cramps",
  "headache",
  "bloating",
  "fatigue",
  "back_pain",
  "breast_tenderness",
  "acne",
  "nausea",
  "other"
];

const allowedMoods = [
  "happy",
  "sad",
  "anxious",
  "irritated",
  "calm",
  "tired",
  "other"
];

const allowedSeverity = ["mild", "moderate", "severe"];

// Add a symptom record
export const addSymptom = async (req, res) => {
  try {
    const {
      date,
      symptoms,
      severity,
      mood,
      notes
    } = req.body;

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one symptom"
      });
    }

    if (!symptoms.every(item => allowedSymptoms.includes(item))) {
      return res.status(400).json({
        success: false,
        message: "Invalid symptom selected"
      });
    }

    if (severity && !allowedSeverity.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: "Invalid severity"
      });
    }

    if (mood && !allowedMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mood"
      });
    }

    const symptomDate = date ? new Date(date) : new Date();

    if (Number.isNaN(symptomDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date"
      });
    }

    const record = await Symptom.create({
      user: req.user._id,
      date: symptomDate,
      symptoms,
      severity: severity || "mild",
      mood: mood || "other",
      notes: notes || ""
    });

    res.status(201).json({
      success: true,
      message: "Symptoms recorded successfully",
      record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to record symptoms"
    });
  }
};

// Get all symptom records
export const getSymptoms = async (req, res) => {
  try {
    const records = await Symptom.find({
      user: req.user._id
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch symptoms"
    });
  }
};

// Update a symptom record
export const updateSymptom = async (req, res) => {
  try {
    const {
      date,
      symptoms,
      severity,
      mood,
      notes
    } = req.body;

    const record = await Symptom.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Symptom record not found"
      });
    }

    if (symptoms !== undefined) {
      if (
        !Array.isArray(symptoms) ||
        symptoms.length === 0 ||
        !symptoms.every(item => allowedSymptoms.includes(item))
      ) {
        return res.status(400).json({
          success: false,
          message: "Please provide valid symptoms"
        });
      }

      record.symptoms = symptoms;
    }

    if (severity !== undefined) {
      if (!allowedSeverity.includes(severity)) {
        return res.status(400).json({
          success: false,
          message: "Invalid severity"
        });
      }

      record.severity = severity;
    }

    if (mood !== undefined) {
      if (!allowedMoods.includes(mood)) {
        return res.status(400).json({
          success: false,
          message: "Invalid mood"
        });
      }

      record.mood = mood;
    }

    if (date !== undefined) {
      const updatedDate = new Date(date);

      if (Number.isNaN(updatedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date"
        });
      }

      record.date = updatedDate;
    }

    if (notes !== undefined) {
      record.notes = notes;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: "Symptom record updated successfully",
      record
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to update symptom record"
    });
  }
};

// Delete a symptom record
export const deleteSymptom = async (req, res) => {
  try {
    const record = await Symptom.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Symptom record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Symptom record deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete symptom record"
    });
  }
};
