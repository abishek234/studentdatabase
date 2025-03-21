import * as Yup from 'yup';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, IconButton, InputAdornment, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Iconify from '../../../components/Iconify';
import { FormProvider, RHFTextField } from '../../../components/hook-form';

export default function LoginForm() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [otpDialogOpen, setOtpDialogOpen] = useState(false);
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');
    const [loadingOtp, setLoadingOtp] = useState(false);

    const LoginSchema = Yup.object().shape({
        email: Yup.string().email('Email must be a valid email address').required('Email is required'),
        password: Yup.string().required('Password is required'),
    });

    const methods = useForm({
        resolver: yupResolver(LoginSchema),
        defaultValues: { email: '', password: '' },
    });

    const { handleSubmit, formState: { isSubmitting } } = methods;

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('http://localhost:7070/api/auth/login', data);
            if (response.status === 200) {
                setEmail(data.email);
                setOtpDialogOpen(true);
                toast.info('OTP sent to your email');
            }
        } catch (error) {
            console.error(error);
            toast.error('Invalid email or password');
        }
    };

    const handleVerifyOtp = async () => {
        setLoadingOtp(true);
        try {
            const response = await axios.post('http://localhost:7070/api/auth/verification-otp', { email, userOtp: otp });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('email', response.data.email);
                localStorage.setItem('id', response.data.id);
                localStorage.setItem('role', response.data.role);
                toast.success('Logged in successfully');
                setOtpDialogOpen(false);

                // Redirect user based on role
                if (response.data.role === 'admin' || response.data.role === 'staff') {
                    navigate('/dashboard/app', { replace: true });
                } else {
                    navigate('/dashboard/student-profile', { replace: true });
                }
            }
        } catch (error) {
            console.log(error);
            toast.error('Invalid OTP');
        } finally {
            setLoadingOtp(false);
        }
    };

    return (
        <>
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
                <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={isSubmitting}>
                    Login
                </LoadingButton>
            </FormProvider>

            {/* OTP Dialog */}
            <Dialog open={otpDialogOpen} onClose={() => setOtpDialogOpen(false)}>
                <DialogTitle>Enter OTP</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="OTP"
                        type="text"
                        fullWidth
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOtpDialogOpen(false)}>Cancel</Button>
                    <LoadingButton onClick={handleVerifyOtp} loading={loadingOtp} variant="contained">
                        Verify OTP
                    </LoadingButton>
                </DialogActions>
            </Dialog>
        </>
    );
}
