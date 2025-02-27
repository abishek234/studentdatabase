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
    Select
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx'; // For Excel file parsing
import Papa from 'papaparse'; // For CSV file parsing

// ----------------------------------------------------------------------
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
        grades: [], // Ensure grades is always an array
    });

    const [bulkData, setBulkData] = useState(null); // For storing bulk data
    const [fileType, setFileType] = useState('csv'); // Default file type
    const [selectedFile, setSelectedFile] = useState(null); // Store selected file

    useEffect(() => {
        if (userId) {
            // Fetch user details for editing
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:7070/api/students/students/${userId}`);
                    const fetchedData = response.data;

                    let gradesArray = [];

                    if (fetchedData.grades) {
                        if (Array.isArray(fetchedData.grades)) {
                            gradesArray = fetchedData.grades;
                        } else {
                            gradesArray = Object.values(fetchedData.grades); // Convert object to array
                        }
                    }

                    setUserData({ ...fetchedData, grades: gradesArray });
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            };
            fetchUserDetails();
        } else {
            // Reset fields for adding a new user
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
                grades: [], // Ensure grades is always an array
            });
        }
    }, [userId]);

    const handleAddUser = async () => {
        try {
            // Transform grades array into an object with keys like "Semester 1", "Semester 2"
            const formattedGrades = userData.grades.reduce((acc, grade, index) => {
                acc[`Semester ${index + 1}`] = grade;
                return acc;
            }, {});

            const studentData = {
                ...userData,
                grades: formattedGrades, // Store as an object instead of an array
            };

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
    
        console.log('Uploading file:', selectedFile);
    
        const formData = new FormData();
        formData.append('file', selectedFile);
    
        try {
            const response = await axios.post('http://localhost:7070/api/students/bulk-upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
    
            console.log('Bulk upload response:', response);
    
            if (response.status === 201) {
                toast.success('Bulk students uploaded successfully');
                fetchUsers();
                setSelectedFile(null); // Clear selected file after upload
            }
        } catch (error) {
            console.error('Error bulk uploading students:', error.response?.data || error);
            toast.error('Error bulk uploading students');
        }
    };
    


    // Function to handle grade input change
    const handleGradeChange = (index, value) => {
        const updatedGrades = [...userData.grades];
        updatedGrades[index] = value;
        setUserData({ ...userData, grades: updatedGrades });
    };

    // Function to add a new semester grade
    const addNewGrade = () => {
        setUserData({ ...userData, grades: [...userData.grades, ''] });
    };

    // Function to delete a semester grade
    const deleteGrade = (index) => {
        const updatedGrades = userData.grades.filter((_, idx) => idx !== index);
        setUserData({ ...userData, grades: updatedGrades });
    };
   

    const handleFileUpload = (event) => {
        if (!event.target.files || event.target.files.length === 0) {
            console.error('No file selected.');
            toast.error('Please select a file.');
            return;
        }
    
        const file = event.target.files[0];
        setSelectedFile(file); // Store file for later upload
        
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Add Student</DialogTitle>

            <DialogContent>
                <TextField fullWidth label="Name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} margin='normal' />
                <TextField fullWidth label="Email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} margin='normal' />
                <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={userData.dob} onChange={(e) => setUserData({ ...userData, dob: e.target.value })} margin='normal' />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Gender</InputLabel>
                    <Select
                        label="Gender"
                        value={userData.gender}
                        onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                        fullWidth
                        displayEmpty
                        margin="normal"
                    >
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
                    <Select
                        label="Minority Status"
                        value={userData.minorityStatus}
                        onChange={(e) => setUserData({ ...userData, minorityStatus: e.target.value })}
                        fullWidth
                        displayEmpty
                        margin="normal"
                    >
                        <MenuItem value="Minority">Minority</MenuItem>
                        <MenuItem value="Non-Minority">Non-Minority</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Residential Status</InputLabel>
                    <Select
                        label="Residential Status"
                        value={userData.residentialStatus}
                        onChange={(e) => setUserData({ ...userData, residentialStatus: e.target.value })}
                        fullWidth
                        displayEmpty
                        margin="normal"
                    >
                        <MenuItem value="Hosteller">Hosteller</MenuItem>
                        <MenuItem value="Day Scholar">Day Scholar</MenuItem>
                    </Select>
                </FormControl>

                <TextField fullWidth label="Admission Quota" value={userData.admissionQuota} onChange={(e) => setUserData({ ...userData, admissionQuota: e.target.value })} margin='normal' />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Country</InputLabel>
                    <Select
                        label="country"
                        value={userData.country}
                        onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                        fullWidth
                        displayEmpty
                        margin="normal"
                    >
                        <MenuItem value="Domestic">Domestic</MenuItem>
                        <MenuItem value="International">International</MenuItem>
                    </Select>
                </FormControl>

                <TextField fullWidth label="Course" value={userData.course} onChange={(e) => setUserData({ ...userData, course: e.target.value })} margin='normal' />
                <TextField fullWidth label="Department" value={userData.department} onChange={(e) => setUserData({ ...userData, department: e.target.value })} margin='normal' />
                <TextField fullWidth label="Year of Admission" value={userData.yearOfAdmission} onChange={(e) => setUserData({ ...userData, yearOfAdmission: e.target.value })} margin='normal' />

                {/* Multiple Grade Inputs with "+" Button */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>Semester Grades</Typography>
                    <IconButton onClick={addNewGrade} color="primary">
                        <AddIcon />
                    </IconButton>
                </div>

                {Array.isArray(userData.grades) &&
                    userData.grades.map((grade, index) => (
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
                    ))
                }

                <div>
                    <Typography variant="h6">Bulk Upload</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>File Type</InputLabel>
                        <Select
                            label="File Type"
                            value={fileType}
                            onChange={(e) => setFileType(e.target.value)}
                        >
                            <MenuItem value="csv">CSV</MenuItem>
                            <MenuItem value="excel">Excel</MenuItem>
                        </Select>
                    </FormControl>

                    <input
                        type="file"
                        accept={fileType === 'csv' ? '.csv' : '.xlsx,.xls'}
                        onChange={handleFileUpload} // Ensure this function matches your handler
                    />


                    {/* Display preview of the bulk data */}
                    {selectedFile && (
                        <div>
                            <Typography variant="body2">Preview of uploaded data:</Typography>
                            <pre>{JSON.stringify(selectedFile, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={selectedFile ? handleBulkUpload : handleAddUser} color="primary" variant="contained">
                    {selectedFile ? 'Upload Bulk Data' : 'Save'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
