const Student = require("../models/Student");

// Helper function to get overall and individual counts
const getStats = async (field) => {
    const overallStats = await Student.aggregate([
        { $group: { _id: `$${field}`, count: { $sum: 1 } } }
    ]);

    return overallStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
    }, {});
};

// Controller for getting student statistics
exports.getStudentStats = async (req, res) => {
    try {
        const stats = {
            religionDistribution: await getStats("religion"),
            communityDistribution: await getStats("community"),
            minorityStatusDistribution: await getStats("minorityStatus"),
            admissionQuotaDistribution: await getStats("admissionQuota"),
            residentialStatusDistribution: await getStats("residentialStatus"),
            countryDistribution: await getStats("country"),
        };

        res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error("Error fetching student statistics:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Controller to get individual statistics based on a specific field
exports.getIndividualStats = async (req, res) => {
    try {
        const { field, value } = req.params;

        // Ensure field exists in schema
        const allowedFields = [
            "religion",
            "community",
            "minorityStatus",
            "admissionQuota",
            "residentialStatus",
            "country"
        ];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ success: false, message: "Invalid field" });
        }

        const count = await Student.countDocuments({ [field]: value });

        res.status(200).json({ success: true, field, value, count });
    } catch (error) {
        console.error("Error fetching individual statistics:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


