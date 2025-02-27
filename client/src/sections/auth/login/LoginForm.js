import * as Yup from 'yup';
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {  Stack, IconButton, InputAdornment } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

const AUTO_LOGOUT_TIME = 1000 * 60 * 1; 

export default function LoginForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    useEffect(() => {
      let timeoutId;

      const resetTimer = () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
              localStorage.removeItem('token');
              localStorage.removeItem('email');
              localStorage.removeItem('role');
              navigate('/login'); // Redirect to login on logout
          }, AUTO_LOGOUT_TIME);
      };

      // Set up event listeners for user activity
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);

      // Start timer on component mount
      resetTimer();

      // Clean up event listeners and timeout on unmount
      return () => {
          clearTimeout(timeoutId);
          window.removeEventListener('mousemove', resetTimer);
          window.removeEventListener('keypress', resetTimer);
      };
  }, [navigate]);

    const LoginSchema = Yup.object().shape({
        email: Yup.string().email('Email must be a valid email address').required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const defaultValues = {
        email: '',
        password: '',
        remember: true,
    };

    const methods = useForm({
        resolver: yupResolver(LoginSchema),
        defaultValues,
    });

    const { handleSubmit, formState: { isSubmitting } } = methods;

    const onSubmit = async (data) => {
        setError('');
        try {
            const response = await axios.post('http://localhost:7070/api/auth/login', data);
            if (response.status === 200 || response.status === 201) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('email', response.data.email);
                localStorage.setItem('id', response.data.id);
                localStorage.setItem('role',response.data.role);
                toast.success('Logged in successfully');
                if (response.data.role === 'admin' || response.data.role === 'staff') { 
                    navigate('/dashboard/app', { replace: true });
                } else {
                navigate('/dashboard/student-profile', { replace: true });
                }
            }
        } catch (error) {
            console.error(error);
             toast.error('Invalid email or password');

        }
    };

    return (
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
                <RHFTextField name="email" label="Email address" />
                <RHFTextField
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Stack>
            <br />
            <br />
            <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                Login
            </LoadingButton>
        </FormProvider>
    );
}
