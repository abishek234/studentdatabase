import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import Page from '../components/Page'; // Ensure Page component exists

const StudentChangeForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    reason: '',
    proof: null
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'proof') {
      setFormData({ ...formData, proof: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.rollNo || !formData.reason || !formData.proof) {
      toast.warning("All fields are required including proof.");
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('rollNo', formData.rollNo);
    data.append('reason', formData.reason);
    data.append('proof', formData.proof);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:7070/api/students/request-change', data);
      toast.success(res.data.message || "Request sent successfully!");
      setFormData({ name: '', rollNo: '', reason: '', proof: null });
    } catch (error) {
      toast.error("Failed to send request.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page title="Student Change Request">
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 5 }}>
          <Typography variant="h5" gutterBottom>
            Request for Profile Change
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Roll Number"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Reason for Change"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                >
                  Upload Proof
                  <input
                    type="file"
                    hidden
                    name="proof"
                    onChange={handleChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    required
                  />
                </Button>
                {formData.proof && (
                  <Typography variant="body2" mt={1}>
                    Selected: {formData.proof.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Page>
  );
};

export default StudentChangeForm;
