import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaSignInAlt, FaEye, FaEyeSlash, FaEnvelope, FaLock, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/Auth/login', formData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Trigger navbar update
      window.dispatchEvent(new Event('authChange'));
      
      // Check if user has completed preferences
      try {
        const preferencesResponse = await axios.get('http://localhost:8080/users/preferences', {
          headers: {
            'Authorization': `Bearer ${response.data.token}`
          }
        });
        
        // Check if preferences are completed (at least some basic preferences filled)
        const preferences = preferencesResponse.data;
        const hasBasicPreferences = preferences.cleanliness || 
                                   preferences.sleepSchedule || 
                                   preferences.noiseTolerance || 
                                   preferences.socialPreference ||
                                   preferences.minBudget ||
                                   preferences.maxBudget;
        
        if (!hasBasicPreferences) {
          // Show welcome message and redirect to preferences
          await Swal.fire({
            icon: 'info',
            title: 'Welcome! 🎉',
            text: 'Let\'s set up your preferences to find your perfect roommate match!',
            confirmButtonText: 'Set Preferences',
            background: 'var(--background-card)',
            color: 'var(--text-primary)'
          });
          
          // Redirect to preferences
          navigate('/preferences');
        } else {
          // Show success message and redirect to dashboard
          await Swal.fire({
            icon: 'success',
            title: 'Login Successful!',
            text: 'Welcome back!',
            timer: 2000,
            showConfirmButton: false,
            background: 'var(--background-card)',
            color: 'var(--text-primary)'
          });
          
          // Redirect to dashboard
          navigate('/dashboard');
        }
      } catch (preferencesErr) {
        // If preferences check fails, still redirect to dashboard
        console.error('Failed to check preferences:', preferencesErr);
        await Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: 'Welcome back!',
          timer: 2000,
          showConfirmButton: false,
          background: 'var(--background-card)',
          color: 'var(--text-primary)'
        });
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      
      // Show error with SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.message || 'Please check your credentials and try again.',
        background: 'var(--background-card)',
        color: 'var(--text-primary)'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="d-flex justify-content-center align-items-center min-vh-100"
      >
        <Card className="form-modern login-card">
          <Card.Body className="p-5">
            {/* Back Button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                as={Link} 
                to="/" 
                variant="link" 
                className="back-button text-decoration-none"
              >
                <FaArrowLeft className="me-2" />
                Back to Home
              </Button>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-4"
            >
              <div className="login-icon">
                <FaSignInAlt size={40} />
              </div>
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Sign in to your account to continue</p>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="danger" className="modern-alert">
                  {error}
                </Alert>
              </motion.div>
            )}
            
            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="form-label">
                    <FaEnvelope className="me-2" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="form-control-modern"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="form-label">
                    <FaLock className="me-2" />
                    Password
                  </Form.Label>
                  <div className="password-input-container">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="form-control-modern"
                      required
                    />
                    <Button
                      type="button"
                      variant="link"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                </Form.Group>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="btn-modern w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Signing In...
                      </div>
                    ) : (
                      <>
                        <FaSignInAlt className="me-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </motion.div>
              </Form>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center mt-4"
            >
              <p className="mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="link-modern">
                  Create one here
                </Link>
              </p>
            </motion.div>
          </Card.Body>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login; 