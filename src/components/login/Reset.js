import React, { useCallback, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { auth, sendPasswordReset } from '../../firebase';
import {
  Typography,
  Alert,
  Box,
  TextField,
  Grid,
  Button,
  Avatar,
} from '@mui/material';
import LockResetIcon from '@mui/icons-material/LockReset';
import LoginContainer from '../UI/LoginContainer';
import { useDataLayerValue } from '../../context-api/Datalayer';
import { actionTypes } from '../../context-api/reducer';

const Reset = () => {
  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState('');
  const [isSubmit, setIsSubmit] = useState(false);

  const [user, fetchingUser] = useAuthState(auth);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [{ isLoading }, dispatch] = useDataLayerValue();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setEmailErrors(validate(email));
    setIsSubmit(true);
  };

  const validate = (email) => {
    let emailError = '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!email || email.trim() === '') {
      emailError = 'Email is required!';
    } else if (!emailRegex.test(email)) {
      emailError = 'This is not a valid email format!';
    }

    return emailError;
  };

  const setLoader = useCallback(
    (isLoading) => {
      dispatch({
        type: actionTypes.SET_LOADER,
        isLoading: isLoading,
      });
    },
    [dispatch]
  );

  const setErrorMessage = (message) => {
    if (message.includes('auth/user-not-found')) {
      setEmail('');
      setError('User Not Found.');
    } else {
      setError('Failed to Reset Password.');
    }
  };

  useEffect(() => {
    const reset = async () => {
      setLoader(true);
      try {
        setMessage('');
        setError('');
        await sendPasswordReset(email);
        setMessage(
          'Check your inbox for further instructions. If not found, check Spam folder'
        );
      } catch (err) {
        setErrorMessage(err.message);
      }
      setEmailErrors('');
      setIsSubmit(false);
      setLoader(false);
    };

    if (emailErrors === '' && isSubmit) {
      reset();
    }
  }, [email, emailErrors, isSubmit, setLoader]);

  useEffect(() => {
    if (fetchingUser) {
      setLoader(true);
      return;
    }

    setLoader(false);
    if (user) navigate('/notes');
  }, [user, fetchingUser, navigate, setLoader]);

  return (
    <LoginContainer>
      <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
        <LockResetIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Scribbly - Password Reset
      </Typography>
      {error && (
        <Alert sx={{ mt: 1, width: 1, padding: '2px 5px' }} severity="error">
          {error}
        </Alert>
      )}
      {message && (
        <Alert sx={{ mt: 1, width: 1, padding: '2px 5px' }} severity="success">
          {message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleReset} noValidate sx={{ mt: 1 }}>
        <TextField
          error={emailErrors !== ''}
          helperText={emailErrors}
          margin="normal"
          required
          fullWidth
          size="small"
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          type="email"
          value={email}
          onChange={handleChange}
          autoFocus
        />
        <Button
          fullWidth
          variant="contained"
          disabled={fetchingUser || isLoading}
          type="submit"
          sx={{ mt: 2, mb: 2 }}
          disableElevation
        >
          Reset Password
        </Button>

        <Grid container>
          <Grid item>
            Need an account?{' '}
            <Link to="/register" style={{ textDecoration: 'none' }}>
              Register
            </Link>{' '}
            now.
          </Grid>
        </Grid>
      </Box>
    </LoginContainer>
  );
};

export default Reset;
