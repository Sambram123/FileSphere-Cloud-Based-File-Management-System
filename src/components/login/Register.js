import React, { useCallback, useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Link, useNavigate } from 'react-router-dom';
import { auth, registerWithEmailAndPassword } from '../../firebase';
import {
  Typography,
  Alert,
  Box,
  TextField,
  Grid,
  Button,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginContainer from '../UI/LoginContainer';
import { useDataLayerValue } from '../../context-api/Datalayer';
import { actionTypes } from '../../context-api/reducer';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register = () => {
  const initialValues = {
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [user, fetchingUser] = useAuthState(auth);
  const [{ isLoading }, dispatch] = useDataLayerValue();
  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);
  const handleMouseDownPassword = () => setShowPassword((prev) => !prev);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);
  const handleMouseDownConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevState) => {
      return { ...prevState, [name]: value };
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setFormErrors(validate(formValues));
    setIsSubmit(true);
  };

  const validate = (values) => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

    if (!values.name || values.name.trim() === '') {
      errors.name = 'Name is required!';
    }

    if (!values.email || values.email.trim() === '') {
      errors.email = 'Email is required!';
    } else if (!emailRegex.test(values.email)) {
      errors.email = 'This is not a valid email format!';
    }

    if (!values.password || values.password.trim() === '') {
      errors.password = 'Password is required';
    } else if (values.password.length < 4) {
      errors.password = 'Password must be more than 4 characters';
    } else if (values.password.length > 10) {
      errors.password = 'Password cannot exceed more than 10 characters';
    }

    if (!values.passwordConfirm) {
      errors.passwordConfirm = 'Confirm Password is required';
    } else if (values.password !== values.passwordConfirm) {
      errors.passwordConfirm = 'Passwords do not match';
    }

    return errors;
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
    if (message.includes('auth/email-already-in-use')) {
      setFormValues((prevState) => {
        return { ...prevState, email: '', password: '', passwordConfirm: '' };
      });
      setError('User/Email Already Exists.');
    } else {
      setError('Failed to Register User.');
    }
  };

  useEffect(() => {
    const register = async () => {
      setLoader(true);
      try {
        setError('');
        await registerWithEmailAndPassword(
          formValues.name,
          formValues.email,
          formValues.password
        );
      } catch (err) {
        setErrorMessage(err.message);
      }
      setFormErrors({});
      setIsSubmit(false);
      setLoader(false);
    };

    if (Object.keys(formErrors).length === 0 && isSubmit) {
      register();
    }
  }, [
    formErrors,
    formValues.email,
    formValues.name,
    formValues.password,
    isSubmit,
    setLoader,
  ]);

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
        <LockOutlinedIcon />
      </Avatar>
      <Typography component="h1" variant="h5">
        Scribbly - Sign Up
      </Typography>
      {error && (
        <Alert sx={{ mt: 1, width: 1, padding: '2px 5px' }} severity="error">
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleRegister} noValidate sx={{ mt: 1 }}>
        <TextField
          error={formErrors.name && formErrors.name !== ''}
          helperText={formErrors.name}
          margin="normal"
          required
          fullWidth
          size="small"
          id="name"
          label="Name"
          name="name"
          type="text"
          value={formValues.name}
          onChange={handleChange}
          autoFocus
        />
        <TextField
          error={formErrors.email && formErrors.email !== ''}
          helperText={formErrors.email}
          margin="normal"
          required
          fullWidth
          size="small"
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          type="email"
          value={formValues.email}
          onChange={handleChange}
        />
        <TextField
          error={formErrors.password && formErrors.password !== ''}
          helperText={formErrors.password}
          margin="normal"
          required
          fullWidth
          size="small"
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          value={formValues.password}
          onChange={handleChange}
          autoComplete="current-password"
          InputProps={{
            // <-- This is where the toggle button is added.
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          error={
            formErrors.passwordConfirm && formErrors.passwordConfirm !== ''
          }
          helperText={formErrors.passwordConfirm}
          margin="normal"
          required
          fullWidth
          size="small"
          name="passwordConfirm"
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          id="password-confirm"
          value={formValues.passwordConfirm}
          onChange={handleChange}
          autoComplete="current-password"
          InputProps={{
            // <-- This is where the toggle button is added.
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowConfirmPassword}
                  onMouseDown={handleMouseDownConfirmPassword}
                >
                  {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          fullWidth
          variant="contained"
          disabled={fetchingUser || isLoading}
          type="submit"
          sx={{ mt: 2, mb: 2 }}
          disableElevation
        >
          Sign Up
        </Button>

        <Grid container>
          <Grid item>
            Already have an account?&nbsp;
            <Link to="/">Login</Link> now.
          </Grid>
        </Grid>
      </Box>
    </LoginContainer>
  );
};

export default Register;
