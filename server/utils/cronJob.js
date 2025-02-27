const cron = require("node-cron");
const Student = require("../models/Student");
const { sendProfileCompletionEmail } = require("./mailer"); 

// Function to check incomplete profiles
const checkAndSendReminderEmails = async () => {
    try {
        const students = await Student.find(); // Fetch all students

        let studentsWithIncompleteProfiles = [];

        for (const student of students) {
            const { name, email, dob, gender, address, contact, religion, community, 
                minorityStatus, residentialStatus, admissionQuota, country, course, 
                department, yearOfAdmission } = student;

            const profileCompletion = {
                name: !!name,
                email: !!email,
                dob: !!dob,
                gender: !!gender,
                address: !!address,
                contact: !!contact,
                religion: !!religion,
                community: !!community,
                minorityStatus: !!minorityStatus,
                residentialStatus: !!residentialStatus,
                admissionQuota: !!admissionQuota,
                country: !!country,
                course: !!course,
                department: !!department,
                yearOfAdmission: !!yearOfAdmission,
            };

            // Find missing fields
            const missingFields = Object.keys(profileCompletion).filter(field => !profileCompletion[field]);

            if (missingFields.length > 0) {
                studentsWithIncompleteProfiles.push({ email, missingFields });
            }
        }

        if (studentsWithIncompleteProfiles.length > 0) {
            for (const student of studentsWithIncompleteProfiles) {
                await sendProfileCompletionEmail(student.email, student.missingFields);
                console.log(`✅ Reminder email sent to ${student.email} for missing fields: ${student.missingFields.join(", ")}`);
            }
        } else {
            console.log("✔️ All student profiles are complete. No emails sent.");
        }
    } catch (error) {
        console.error("❌ Error checking profiles:", error);
    }
};

// Function to start the cron job
const startCronJob = () => {
    cron.schedule("* * * * *", async () => {  // Run every minute for testing
        console.log("⏳ Running profile check...");
        await checkAndSendReminderEmails();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata", // Ensure it runs in IST timezone
    });
};

module.exports = { startCronJob };
