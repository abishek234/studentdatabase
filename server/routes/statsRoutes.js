const express = require("express");
const statsController = require("../controllers/statsController");
const router = express.Router();

// Get overall statistics for students
router.get("/stats", statsController.getStudentStats);

// Get individual statistics based on field and value
router.get("/stats/:field/:value", statsController.getIndividualStats);

module.exports = router;
