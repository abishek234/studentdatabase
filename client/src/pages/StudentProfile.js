import React, { useEffect, useState } from "react";
import {
  TextField,
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress
} from "@mui/material";
import axios from "axios";

export default function StudentProfile() {
  const studentId = localStorage.getItem("id");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`http://localhost:7070/api/students/student-profile/${studentId}`);
      const studentData = Array.isArray(res.data) ? res.data[0] : res.data;
      const { _id, __v, grades, ...filteredProfile } = studentData;
      setProfile(filteredProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CircularProgress />;
  if (!profile) return <Typography variant="h6">No profile found</Typography>;

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
                value={
                  key === "dob"
                    ? new Date(profile[key]).toLocaleDateString()
                    : profile[key] || ""
                }
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
}
