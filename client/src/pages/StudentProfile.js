import React, { useEffect, useState } from "react";
import { TextField, Container, Typography, Grid, Paper, CircularProgress, Button } from "@mui/material";
import axios from "axios";

export default function StudentProfile() {
    const studentId = localStorage.getItem("id");
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editableFields, setEditableFields] = useState({});
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`http://localhost:7070/api/students/student-profile/${studentId}`);
            const studentData = Array.isArray(res.data) ? res.data[0] : res.data;
            const { _id, __v, grades, ...filteredProfile } = studentData;

            // Identify missing fields
            const missingFields = Object.keys(filteredProfile).reduce((acc, key) => {
                if (!filteredProfile[key]) acc[key] = true; // Mark missing fields as editable
                return acc;
            }, {});

            setProfile(filteredProfile);
            setEditableFields(missingFields);
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setProfile((prevProfile) => ({ ...prevProfile, [name]: value }));
    };

    const handleSubmit = async () => {
        setUpdating(true);
        try {
            await axios.put(`http://localhost:7070/api/students/update-profile/${studentId}`, profile);
            alert("Profile updated successfully!");
            fetchProfile(); // Refresh profile after update
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <CircularProgress />;
    if (!profile) return <Typography variant="h6">No profile found</Typography>;

    // Check if any fields are incomplete
    const hasIncompleteFields = Object.keys(editableFields).length > 0;

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Student Profile
                </Typography>
                <Grid container spacing={2}>
                    {Object.keys(profile).map((key) => (
                        <Grid item xs={12} sm={6} key={key}>
                            <TextField
                                fullWidth
                                label={key.replace(/([A-Z])/g, " $1").trim()}
                                name={key}
                                value={key === "dob" ? new Date(profile[key]).toLocaleDateString() : profile[key] || ""}
                                onChange={handleChange}
                                disabled={!editableFields[key]}
                            />
                        </Grid>
                    ))}
                </Grid>
                
                {/* Show button only if there are incomplete fields */}
                {hasIncompleteFields && (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginTop: 2 }}
                        onClick={handleSubmit}
                        disabled={updating}
                    >
                        {updating ? "Updating..." : "Update Profile"}
                    </Button>
                )}
            </Paper>
        </Container>
    );
}
