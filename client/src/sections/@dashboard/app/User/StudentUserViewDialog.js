import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import axios from 'axios';

export default function StudentUserViewDialog({ open, onClose, userId, user }) {
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
        grades: {},  // Now storing as an object
    });

    useEffect(() => {
        if (userId) {
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:7070/api/students/students/${userId}`);
                    
                    console.log("Fetched User Data:", response.data); // Debugging log

                    setUserData(response.data);
                    
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
                grades: {},
            });
        }
    }, [userId]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>View Student</DialogTitle>
            <DialogContent>
                <TextField fullWidth label="Name" value={user?.name || ''} margin="normal" disabled />
                <TextField fullWidth label="Email" value={user?.email || ''} margin="normal" disabled />
                <TextField fullWidth label="Date of Birth" value={new Date(user?.dob).toLocaleDateString() || ''} margin="normal" disabled />
                <TextField fullWidth label="Gender" value={user?.gender || ''} margin="normal" disabled />
                <TextField fullWidth label="Contact" value={user?.contact || ''} margin="normal" disabled />
                <TextField fullWidth label="Address" value={user?.address || ''} margin="normal" disabled />
                <TextField fullWidth label="Religion" value={user?.religion || ''} margin="normal" disabled />
                <TextField fullWidth label="Community" value={user?.community || ''} margin="normal" disabled />
                <TextField fullWidth label="Minority Status" value={user?.minorityStatus || ''} margin="normal" disabled />
                <TextField fullWidth label="Residential Status" value={user?.residentialStatus || ''} margin="normal" disabled />
                <TextField fullWidth label="Admission Quota" value={user?.admissionQuota || ''} margin="normal" disabled />
                <TextField fullWidth label="Country" value={user?.country || ''} margin="normal" disabled />
                <TextField fullWidth label="Course" value={user?.course || ''} margin="normal" disabled />
                <TextField fullWidth label="Department" value={user?.department || ''} margin="normal" disabled />
                <TextField fullWidth label="Year of Admission" value={user?.yearOfAdmission || ''} margin="normal" disabled />

                {/* Display Grades */}
                <Typography variant="h6" style={{ marginTop: '16px' }}>Grades:</Typography>
                {user?.grades && Object.keys(user?.grades).length > 0 ? (
                    <List>
                        {Object.entries(user?.grades).map(([semester, grade], index) => (
                            <ListItem key={index}>
                                <ListItemText primary={`${semester}: ${grade}`} />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" color="textSecondary">No grades available</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
