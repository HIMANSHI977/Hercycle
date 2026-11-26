import Appointment from "../models/Appointment.js";

const allowedStatuses = ["requested", "confirmed", "completed", "cancelled"];

export const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ user: req.user._id })
      .sort({ appointmentAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    console.error("Get appointments error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load appointments" });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const { doctorName, specialty, clinicName, appointmentAt, reason, notes } = req.body;

    if (typeof doctorName !== "string" || !doctorName.trim() || doctorName.trim().length > 100) {
      return res.status(400).json({ success: false, message: "Doctor name must contain 1–100 characters" });
    }

    if (typeof specialty !== "string" || !specialty.trim() || specialty.trim().length > 100) {
      return res.status(400).json({ success: false, message: "Specialty must contain 1–100 characters" });
    }

    if (!appointmentAt) {
      return res.status(400).json({ success: false, message: "Appointment date and time are required" });
    }

    const appointmentDate = new Date(appointmentAt);

    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate <= new Date()) {
      return res.status(400).json({ success: false, message: "Please select a valid future date and time" });
    }

    if (typeof reason !== "undefined" && (typeof reason !== "string" || reason.length > 500)) {
      return res.status(400).json({ success: false, message: "Reason cannot exceed 500 characters" });
    }

    if (typeof notes !== "undefined" && (typeof notes !== "string" || notes.length > 500)) {
      return res.status(400).json({ success: false, message: "Notes cannot exceed 500 characters" });
    }

    if (typeof clinicName !== "undefined" && (typeof clinicName !== "string" || clinicName.length > 100)) {
      return res.status(400).json({ success: false, message: "Clinic name cannot exceed 100 characters" });
    }

    const appointment = await Appointment.create({
      user: req.user._id,
      doctorName: doctorName.trim(),
      specialty: specialty.trim(),
      clinicName: clinicName?.trim() || "",
      appointmentAt: appointmentDate,
      reason: reason?.trim() || "",
      notes: notes?.trim() || "",
      status: "requested"
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request saved",
      appointment
    });
  } catch (error) {
    console.error("Create appointment error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to save appointment request" });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const { doctorName, specialty, clinicName, appointmentAt, reason, notes, status } = req.body;

    if (status !== undefined) {
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid appointment status" });
      }
      appointment.status = status;
    }

    if (doctorName !== undefined) {
      if (typeof doctorName !== "string" || !doctorName.trim() || doctorName.trim().length > 100) {
        return res.status(400).json({ success: false, message: "Doctor name must contain 1–100 characters" });
      }
      appointment.doctorName = doctorName.trim();
    }

    if (specialty !== undefined) {
      if (typeof specialty !== "string" || !specialty.trim() || specialty.trim().length > 100) {
        return res.status(400).json({ success: false, message: "Specialty must contain 1–100 characters" });
      }
      appointment.specialty = specialty.trim();
    }

    if (clinicName !== undefined) {
      if (typeof clinicName !== "string" || clinicName.length > 100) {
        return res.status(400).json({ success: false, message: "Clinic name cannot exceed 100 characters" });
      }
      appointment.clinicName = clinicName.trim();
    }

    if (appointmentAt !== undefined) {
      const appointmentDate = new Date(appointmentAt);

      if (Number.isNaN(appointmentDate.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid appointment date and time" });
      }

      appointment.appointmentAt = appointmentDate;
    }

    if (reason !== undefined) {
      if (typeof reason !== "string" || reason.length > 500) {
        return res.status(400).json({ success: false, message: "Reason cannot exceed 500 characters" });
      }
      appointment.reason = reason.trim();
    }

    if (notes !== undefined) {
      if (typeof notes !== "string" || notes.length > 500) {
        return res.status(400).json({ success: false, message: "Notes cannot exceed 500 characters" });
      }
      appointment.notes = notes.trim();
    }

    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment updated",
      appointment
    });
  } catch (error) {
    console.error("Update appointment error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update appointment" });
  }
};

export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    appointment.status = "cancelled";
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled",
      appointment
    });
  } catch (error) {
    console.error("Cancel appointment error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to cancel appointment" });
  }
};
