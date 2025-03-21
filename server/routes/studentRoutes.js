const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

const studentController = require('../controllers/studentController');

router.post('/add-student', studentController.addStudent);
router.get('/students', studentController.getStudents);
router.get('/students/:id', studentController.getStudentById);
router.put('/students/:id', studentController.updateStudent);
router.delete('/students/:id', studentController.deleteStudent);
router.post('/send-bulk-email', studentController.sendEmails);
router.post('/send-profile-completion-email', studentController.checkProfileCompletion);
router.post('/bulk-upload', upload.single('file'), studentController.bulkUploadStudents);
router.post('/migrate-students', studentController.migrateStudentsToUsers);
router.get('/student-profile/:id', studentController.getStudentsByUserId);
router.put('/update-profile/:id', studentController.updateStudentByUserId);
router.post("/request-change", upload.single("proof"),studentController.sendChangeRequest);
module.exports = router;