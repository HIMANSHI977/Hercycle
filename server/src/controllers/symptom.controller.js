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
    const { date, symptoms, severity, mood, notes } = req.body;

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
    console.error("Add symptom error:", error.message);
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
    console.error("Get symptoms error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to fetch symptoms"
    });
  }
};

// Update a symptom record
export const updateSymptom = async (req, res) => {
  try {
    const { date, symptoms, severity, mood, notes } = req.body;

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
    console.error("Update symptom error:", error.message);
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
    console.error("Delete symptom error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to delete symptom record"
    });
  }
};

// Get symptom insights
export const getSymptomInsights = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await Symptom.find({
      user: req.user._id,
      date: { $gte: thirtyDaysAgo, $lte: now }
    }).sort({ date: -1 });

    const symptomCounts = {};
    const severityCounts = {
      mild: 0,
      moderate: 0,
      severe: 0
    };
    const moodCounts = {};

    records.forEach(record => {
      record.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });

      severityCounts[record.severity] =
        (severityCounts[record.severity] || 0) + 1;

      moodCounts[record.mood] = (moodCounts[record.mood] || 0) + 1;
    });

    const mostFrequentSymptoms = Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      period: "Last 30 days",
      totalRecords: records.length,
      totalSymptoms: Object.values(symptomCounts).reduce(
        (total, count) => total + count,
        0
      ),
      mostFrequentSymptoms,
      severityDistribution: severityCounts,
      moodDistribution: moodCounts,
      recentHistory: records.slice(0, 7)
    });
  } catch (error) {
    console.error("Symptom insights error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to generate symptom insights"
    });
  }
};

// Get symptom guidance
export const getSymptomGuidance = async (req, res) => {
  try {
    const now = new Date();
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const records = await Symptom.find({
      user: req.user._id,
      date: { $gte: fourteenDaysAgo, $lte: now }
    }).sort({ date: -1 });

    const warnings = [];

    const recentSevere = records.filter((record) => record.severity === "severe");

    if (recentSevere.length > 0) {
      warnings.push({
        level: "urgent",
        title: "Recent severe symptom recorded",
        message: "Consider prompt medical advice if severe pain, bleeding or another concerning symptom is ongoing or worsening.",
        action: "Seek urgent care for fainting, severe sudden pain, very heavy bleeding or fever with pelvic pain."
      });
    }

    const cramps = records.filter((record) => record.symptoms.includes("cramps"));

    if (cramps.length >= 3 && cramps.some((record) => record.severity !== "mild")) {
      warnings.push({
        level: "professional",
        title: "Persistent or repeated cramps",
        message: "Repeated cramping that affects daily activities may deserve a healthcare conversation.",
        action: "Arrange a routine appointment if symptoms are persistent, unusual or concerning."
      });
    }

    const nauseaOrHeadache = records.filter((record) =>
      record.symptoms.includes("nausea") || record.symptoms.includes("headache")
    );

    if (nauseaOrHeadache.length >= 3) {
      warnings.push({
        level: "professional",
        title: "Repeated headache or nausea",
        message: "Frequent or worsening headache or nausea may benefit from professional review.",
        action: "Consult a healthcare professional, especially if symptoms interfere with daily life."
      });
    }

    if (warnings.length === 0) {
      warnings.push({
        level: "general",
        title: "No urgent warning detected",
        message: "Your recent entries do not show a clear urgent pattern, but symptoms can change quickly.",
        action: "Continue tracking, rest comfortably and seek care if symptoms become severe or unusual."
      });
    }

    return res.status(200).json({
      success: true,
      period: "Last 14 days",
      totalRecords: records.length,
      warnings,
      disclaimer: "This guidance is educational and cannot diagnose a medical condition."
    });
  } catch (error) {
    console.error("Symptom guidance error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to generate symptom guidance"
    });
  }
};
