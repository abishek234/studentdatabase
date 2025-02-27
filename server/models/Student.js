const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  address: { type: String, required: true },
  contact: { type: String, },
  religion: { type: String},
  community: { type: String },
  minorityStatus: { type: String, enum: ["Minority", "Non-Minority"] },
  residentialStatus: { type: String, enum: ["Hosteller", "Day Scholar"] },
  admissionQuota: { type: String, required: true },
  country: { type: String, enum: ["Domestic", "International"], required: true },
  course: { type: String, required: true },
  department: { type: String, required: true },
  yearOfAdmission: { type: Number, required: true },
  grades: { type: Object, default: {} },
});

module.exports = mongoose.model("Student", studentSchema);
