const Student = require("../models/Student");
const User = require("../models/User");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const csvparser = require("csv-parser");
const Parser = require("json2csv").Parser;
const Papa = require("papaparse");
const {sendBulkEmail,sendProfileCompletionEmail,sendStudentRequestToAdmin} = require("../utils/mailer");

exports.addStudent = async (req, res) => {
  try {
      const { name, email, password, ...studentDetails } = req.body;

      // Check if the email is already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "Email already exists" });
      }

      // Create Student Entry
      const student = await Student.create({ name, email, ...studentDetails });

      // Create User Entry (linked to student)
      const user = await User.create({
          name,
          email,
          password: "student123",
          role: "student"
      });

      res.status(201).json({ student, user });
  } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Error adding student" });
  }
};
  
  exports.getStudents = async (req, res) => {
    try {
      const students = await Student.find();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Error fetching students" });
    }
  };

  exports.getStudentById = async (req, res) => {
    try {
      const student = await Student.findById(req.params.id);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json(student);
    } catch (error) {
      res.status(500).json({ message: "Error fetching student" });
    }
  };
  exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: "Error updating student" });
    }
};


  exports.deleteStudent = async (req, res) => {
    try {
      const student = await Student.findByIdAndDelete(req.params.id);

      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting student" });
    }
  };

  // Function to process CSV file
  const processCSV = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (err, data) => {
            if (err) {
                return reject(err);
            }
            Papa.parse(data, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                },
            });
        });
    });
};
  // Function to process Excel file
const processExcel = async (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
  };


  exports.bulkUploadStudents = async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  
      const filePath = path.resolve(req.file.path);
      let students = [];
  
      const mimetype = req.file.mimetype.toLowerCase();
  
      if (mimetype === "text/csv") {
        students = await processCSV(filePath);
      } else if (
        mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimetype === "application/vnd.ms-excel"
      ) {
        students = await processExcel(filePath);
      } else {
        return res.status(400).json({ message: "Invalid file type. Only CSV or Excel files are allowed." });
      }
  
      const studentData = students
        .map((s, index) => {
          if (!s.name || !s.dob || !s.gender || !s.contact || !s.country || !s.course) {
            console.log(`Skipping row ${index + 1} due to missing required fields.`);
            return null;
          }
  
          let grades = {};
          Object.keys(s).forEach((key) => {
            if (key.toLowerCase().includes("semester")) {
              if (s[key] !== "0" && s[key] !== "" && s[key] !== null) {
                grades[key.trim()] = s[key];
              }
            }
          });
  
          return {
            name: s.name || "Unknown",
            email: s.email || "N/A",
            dob: s.dob ? new Date(s.dob) : null,
            gender: s.gender || "Not Specified",
            address: s.address || "N/A",
            contact: s.contact || "N/A",
            religion: s.religion || "N/A",
            community: s.community || "N/A",
            minorityStatus: s.minorityStatus || "None",
            residentialStatus: s.residentialStatus || "Non-Resident",
            admissionQuota: s.admissionQuota || "General",
            country: s.country || "Unknown",
            course: s.course || "Unknown",
            department: s.department || "N/A",
            yearOfAdmission: parseInt(s.yearOfAdmission) || new Date().getFullYear(),
            grades: grades,
          };
        })
        .filter((student) => student !== null);
  
      if (studentData.length === 0) {
        return res.status(400).json({ message: "No valid student data to upload." });
      }
  
      // Insert student and user documents
      let insertedCount = 0;
      for (const student of studentData) {
        const existingUser = await User.findOne({ email: student.email });
  
        if (!existingUser) {
          await Student.create(student);
  
          await User.create({
            name: student.name,
            email: student.email,
            password: "student123",
            role: "student",
          });
  
          insertedCount++;
        } else {
          console.log(`Skipped ${student.email} - user already exists.`);
        }
      }
  
      fs.unlinkSync(filePath); // Remove uploaded file after processing
  
      res.status(201).json({ message: "Students uploaded successfully", count: insertedCount });
    } catch (error) {
      console.error("Error processing file:", error);
      res.status(500).json({ message: "Error processing file" });
    }
  };
  


exports.sendEmails = async (req, res) => {
  try {
    const { emails, text } = req.body;
    await sendBulkEmail(emails, text);
    res.json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Error sending emails' });
  }
};

// check profile completion

exports.checkProfileCompletion = async (req, res) => {
  try {

     
      const student = await Student.findById(req.params.id);
      

      if (!student) {
          return res.status(404).json({ message: "Student not found" });
      }

      const { name, email, dob, gender,address, contact, religion,community,minorityStatus,residentialStatus,admissionQuota, country, course, department, yearOfAdmission } = student;
    
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

      // send mail

      const fields = Object.keys(profileCompletion).filter(field => !profileCompletion[field]);
      await sendProfileCompletionEmail(email, fields);

      res.json({ profileCompletion });
      res.status(200).send('Profile completion checked successfully');
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }

}


exports.migrateStudentsToUsers = async (req, res) => {
    try {
        // Fetch all students who are not already in User model
        const students = await Student.find();
        let migratedUsers = [];

        for (const student of students) {
            const existingUser = await User.findOne({ email: student.email });

            if (!existingUser) {
              

                // Create user entry
                const user = await User.create({
                    name: student.name,
                    email: student.email,
                    password: "student123",
                    role: "student",
                });

          
            }
        }

        if (migratedUsers.length === 0) {
            return res.status(200).json({ message: "All students are already in User model." });
        }

        res.status(201).json({ message: "Students migrated successfully.", migratedUsers });
    } catch (error) {
        console.error("Migration Error:", error);
        res.status(500).json({ message: "Error migrating students", error });
    }
};


exports.getStudentsByUserId = async (req, res) => {
  try {
      const user = await User.find(req.params.id ? { _id: req.params.id } : { role: "student" }); // Find user by id or role
      if (user.length === 0) {
          return res.status(404).json({ message: "User not found" });
      }
      const students = await Student.find({ email: { $in: user.map((u) => u.email) } });  // Find students by email
      if(students.length === 0) {
          return res.status(404).json({ message: 'Students not found' });
      }
      res.json(students);
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
  }
};

exports.updateStudentByUserId = async (req, res) => {
  try {
      const user = await User.findById(req.params.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      const student = await Student.findOneAndUpdate({ email: user.email }, req.body, { new: true });
      if (!student) {
          return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
  }
};

exports.sendChangeRequest = async (req, res) => {
    try {
      const { name, rollNo, reason } = req.body;
      const proofPath = req.file?.path;
  
      if (!name || !rollNo || !reason || !proofPath) {
        return res.status(400).json({ message: "All fields are required including proof file." });
      }
  
      await sendStudentRequestToAdmin({ name, rollNo, reason }, proofPath);
  
      res.status(200).json({ message: "Request sent to admin successfully." });
    } catch (err) {
      console.error("Error sending request:", err);
      res.status(500).json({ message: "Failed to send request." });
    }
  };