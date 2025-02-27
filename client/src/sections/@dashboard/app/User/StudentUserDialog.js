import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function StudentUserDialog({ open, onClose, userId, fetchUsers }) {
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        dob: '',
        gender: '',
        contact: '',
        address: '',
        religion: '',
        community: '',
        minorityStatus: '',
        residentialStatus: '',
        admissionQuota: '',
        country: '',
        course: '',
        department: '',
        yearOfAdmission: '',
        grades: [],
    });

    useEffect(() => {
        if (userId) {
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:7070/api/students/students/${userId}`);
                    const fetchedUserData = response.data;
                    const grades = fetchedUserData.grades || {};
                    const gradesArray = Object.keys(grades).map((key) => ({
                        semester: key,
                        grade: grades[key],
                    }));

                    setUserData(prevUserData => ({
                        ...prevUserData,
                        ...fetchedUserData,
                        dob: fetchedUserData.dob? new Date(fetchedUserData.dob).toISOString().split('T')[0] : '',
                        grades: gradesArray,
                    }));
                } catch (error) {
                    console.error("Error fetching user details:", error);
                    toast.error("Failed to fetch user details");
                }
            };
            fetchUserDetails();
        } else {
            setUserData({
                name: '',
                email: '',
                dob: '',
                gender: '',
                contact: '',
                address: '',
                religion: '',
                community: '',
                minorityStatus: '',
                residentialStatus: '',
                admissionQuota: '',
                country: '',
                course: '',
                department: '',
                yearOfAdmission: '',
                grades: [],
            });
        }
    }, [userId]);

    const handleUpdateUser = async () => {
        try {
            const gradesObject = userData.grades.reduce((acc, grade) => {
                acc[grade.semester] = grade.grade;
                return acc;
            }, {});

            const response = await axios.put(`http://localhost:7070/api/students/students/${userId}`, {
                ...userData,
                grades: gradesObject,
            });

            toast.success("Student updated successfully");
            fetchUsers();
            onClose();
        } catch (error) {
            console.error("Error saving student:", error);
            toast.error("Error updating student");
        }
    };

    const handleGradesChange = (e) => {
        const { name, value } = e.target;
        const updatedGrades = [...userData.grades];

        const index = updatedGrades.findIndex((grade) => grade.semester === name);
        if (index >= 0) {
            updatedGrades[index] = { ...updatedGrades[index], grade: value };
        } else {
            updatedGrades.push({ semester: name, grade: value });
        }

        setUserData({ ...userData, grades: updatedGrades });
    };

    const handleAddGrade = () => {
        const newGrade = {
            semester: `Semester ${userData.grades.length + 1}`,
            grade: '',
        };
        setUserData({ ...userData, grades: [...userData.grades, newGrade] });
    };

    const handleDeleteGrade = (semesterToDelete) => {
        const updatedGrades = userData.grades.filter(grade => grade.semester !== semesterToDelete);
        setUserData({ ...userData, grades: updatedGrades });
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Update Student</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Name"
                    value={userData.name}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Date of Birth"
                    value={userData.dob}
                    onChange={(e) => setUserData({ ...userData, dob: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Gender"
                    value={userData.gender}
                    onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Contact"
                    value={userData.contact}
                    onChange={(e) => setUserData({ ...userData, contact: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Address"
                    value={userData.address}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Religion"
                    value={userData.religion}
                    onChange={(e) => setUserData({ ...userData, religion: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Community"
                    value={userData.community}
                    onChange={(e) => setUserData({ ...userData, community: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Minority Status"
                    value={userData.minorityStatus}
                    onChange={(e) => setUserData({ ...userData, minorityStatus: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Residential Status"
                    value={userData.residentialStatus}
                    onChange={(e) => setUserData({ ...userData, residentialStatus: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Admission Quota"
                    value={userData.admissionQuota}
                    onChange={(e) => setUserData({ ...userData, admissionQuota: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Country"
                    value={userData.country}
                    onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Course"
                    value={userData.course}
                    onChange={(e) => setUserData({ ...userData, course: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Department"
                    value={userData.department}
                    onChange={(e) => setUserData({ ...userData, department: e.target.value })}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    label="Year of Admission"
                    value={userData.yearOfAdmission}
                    onChange={(e) => setUserData({ ...userData, yearOfAdmission: e.target.value })}
                    margin="normal"
                />

                {/* Handle Grades dynamically */}
                {userData.grades.map((grade, index) => (
                    <div key={index}>
                        <TextField
                            fullWidth
                            label={`Grade for ${grade.semester}`}
                            name={grade.semester}
                            value={grade.grade || ''}
                            onChange={handleGradesChange}
                            margin="normal"
                        />
                        <Button
                            onClick={() => handleDeleteGrade(grade.semester)}
                            variant="outlined"
                            color="error"
                            style={{ marginTop: 8, marginBottom: 16 }}
                        >
                            Delete Semester
                        </Button>
                    </div>
                ))}
                <Button onClick={handleAddGrade} variant="outlined" style={{ marginTop: 16 }}>
                    Add Semester
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleUpdateUser} variant="contained" color="primary">
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
}
