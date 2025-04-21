import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    IconButton,
    Typography,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function StudentAddUserDialog({ open, onClose, userId, fetchUsers }) {
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

    const [bulkData, setBulkData] = useState(null);
    const [fileType, setFileType] = useState('csv');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false); // NEW STATE

    useEffect(() => {
        if (userId) {
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:7070/api/students/students/${userId}`);
                    const fetchedData = response.data;
                    let gradesArray = [];

                    if (fetchedData.grades) {
                        gradesArray = Array.isArray(fetchedData.grades)
                            ? fetchedData.grades
                            : Object.values(fetchedData.grades);
                    }

                    setUserData({ ...fetchedData, grades: gradesArray });
                } catch (error) {
                    console.error("Error fetching user details:", error);
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

    const handleAddUser = async () => {
        try {
            const formattedGrades = userData.grades.reduce((acc, grade, index) => {
                acc[`Semester ${index + 1}`] = grade;
                return acc;
            }, {});

            const studentData = { ...userData, grades: formattedGrades };

            const response = await axios.post('http://localhost:7070/api/students/add-student', studentData);
            if (response.status === 201) {
                fetchUsers();
                onClose();
                toast.success('Student added successfully');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            toast.error('Error adding student');
        }
    };

    const handleBulkUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file before uploading.');
            return;
        }

        setIsUploading(true); // START LOADING

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://localhost:7070/api/students/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 201) {
                toast.success('Bulk students uploaded successfully');
                fetchUsers();
                setSelectedFile(null);
            }
        } catch (error) {
            console.error('Error bulk uploading students:', error.response?.data || error);
            toast.error('Error bulk uploading students');
        } finally {
            setIsUploading(false); // STOP LOADING
        }
    };

    const handleGradeChange = (index, value) => {
        const updatedGrades = [...userData.grades];
        updatedGrades[index] = value;
        setUserData({ ...userData, grades: updatedGrades });
    };

    const addNewGrade = () => {
        setUserData({ ...userData, grades: [...userData.grades, ''] });
    };

    const deleteGrade = (index) => {
        const updatedGrades = userData.grades.filter((_, idx) => idx !== index);
        setUserData({ ...userData, grades: updatedGrades });
    };

    const handleFileUpload = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            toast.error('Please select a file.');
            return;
        }
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    let actionButtonContent;
if (isUploading) {
    actionButtonContent = <CircularProgress size={24} color="inherit" />;
} else if (selectedFile) {
    actionButtonContent = 'Upload Bulk Data';
} else {
    actionButtonContent = 'Save';
}



    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Add Student</DialogTitle>
            <DialogContent>
                <TextField fullWidth label="Name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} margin='normal' />
                <TextField fullWidth label="Email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} margin='normal' />
                <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={userData.dob} onChange={(e) => setUserData({ ...userData, dob: e.target.value })} margin='normal' />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Gender</InputLabel>
                    <Select label="Gender" value={userData.gender} onChange={(e) => setUserData({ ...userData, gender: e.target.value })}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                </FormControl>

                <TextField fullWidth label="Contact" value={userData.contact} onChange={(e) => setUserData({ ...userData, contact: e.target.value })} margin='normal' />
                <TextField fullWidth label="Address" value={userData.address} onChange={(e) => setUserData({ ...userData, address: e.target.value })} margin='normal' />
                <TextField fullWidth label="Religion" value={userData.religion} onChange={(e) => setUserData({ ...userData, religion: e.target.value })} margin='normal' />
                <TextField fullWidth label="Community" value={userData.community} onChange={(e) => setUserData({ ...userData, community: e.target.value })} margin='normal' />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Minority Status</InputLabel>
                    <Select label="Minority Status" value={userData.minorityStatus} onChange={(e) => setUserData({ ...userData, minorityStatus: e.target.value })}>
                        <MenuItem value="Minority">Minority</MenuItem>
                        <MenuItem value="Non-Minority">Non-Minority</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Residential Status</InputLabel>
                    <Select label="Residential Status" value={userData.residentialStatus} onChange={(e) => setUserData({ ...userData, residentialStatus: e.target.value })}>
                        <MenuItem value="Hosteller">Hosteller</MenuItem>
                        <MenuItem value="Day Scholar">Day Scholar</MenuItem>
                    </Select>
                </FormControl>

                <TextField fullWidth label="Admission Quota" value={userData.admissionQuota} onChange={(e) => setUserData({ ...userData, admissionQuota: e.target.value })} margin='normal' />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Country</InputLabel>
                    <Select label="Country" value={userData.country} onChange={(e) => setUserData({ ...userData, country: e.target.value })}>
                        <MenuItem value="Domestic">Domestic</MenuItem>
                        <MenuItem value="International">International</MenuItem>
                    </Select>
                </FormControl>

                <TextField fullWidth label="Course" value={userData.course} onChange={(e) => setUserData({ ...userData, course: e.target.value })} margin='normal' />
                <TextField fullWidth label="Department" value={userData.department} onChange={(e) => setUserData({ ...userData, department: e.target.value })} margin='normal' />
                <TextField fullWidth label="Year of Admission" value={userData.yearOfAdmission} onChange={(e) => setUserData({ ...userData, yearOfAdmission: e.target.value })} margin='normal' />

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>Semester Grades</Typography>
                    <IconButton onClick={addNewGrade} color="primary">
                        <AddIcon />
                    </IconButton>
                </div>

                {userData.grades.map((grade, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                            fullWidth
                            label={`Semester ${index + 1} Grade`}
                            value={grade}
                            onChange={(e) => handleGradeChange(index, e.target.value)}
                            margin='normal'
                        />
                        <IconButton onClick={() => deleteGrade(index)} color="error" style={{ marginLeft: '8px' }}>
                            <DeleteIcon />
                        </IconButton>
                    </div>
                ))}

                <div>
                    <Typography variant="h6">Bulk Upload</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>File Type</InputLabel>
                        <Select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="excel">Excel</MenuItem>
                        </Select>
                    </FormControl>

                    <input
                        type="file"
                        accept={fileType === 'csv' ? '.csv' : '.xlsx,.xls'}
                        onChange={handleFileUpload}
                    />

                    {selectedFile && (
                        <div>
                            <Typography variant="body2">Preview of uploaded file:</Typography>
                            <pre>{JSON.stringify(selectedFile.name, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={selectedFile ? handleBulkUpload : handleAddUser}
                    color="primary"
                    variant="contained"
                    disabled={isUploading}
                >
                    {actionButtonContent}
                </Button>

            </DialogActions>
        </Dialog>
    );
}
