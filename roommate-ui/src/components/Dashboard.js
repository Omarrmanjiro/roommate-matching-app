import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUser, FaEnvelope, FaSignOutAlt, FaEdit, FaCog, FaSearch, FaComments, FaExclamationTriangle } from 'react-icons/fa';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/Auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUser(response.data);
    } catch (err) {
      setError('Failed to load user profile');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  }, [navigate]);

  const fetchPreferences = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return;
    }

    try {
      const response = await axios.get('http://localhost:8080/users/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setPreferences(response.data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await fetchUserProfile();
      await fetchPreferences();
      setLoading(false);
    };
    
    loadData();
  }, [fetchUserProfile, fetchPreferences]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('token');
      await Swal.fire(
        'Logged out!',
        'You have been successfully logged out.',
        'success'
      );
      navigate('/');
    }
  };

  // Check if preferences are completed
  const hasBasicPreferences = preferences && (
    preferences.cleanliness || 
    preferences.sleepSchedule || 
    preferences.noiseTolerance || 
    preferences.socialPreference ||
    preferences.minBudget ||
    preferences.maxBudget
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (
    <div>
      {/* Preferences Completion Alert */}
      {!hasBasicPreferences && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex align-items-center">
            <FaExclamationTriangle className="me-3" size={24} />
            <div className="flex-grow-1">
              <h5 className="mb-1">Complete Your Preferences to Find Perfect Matches! 🎯</h5>
              <p className="mb-2">
                To help you find the best roommate matches, please set up your preferences. 
                This will ensure we can match you with compatible roommates.
              </p>
              <Button 
                variant="warning" 
                size="sm"
                onClick={() => navigate('/preferences')}
                className="btn-modern"
              >
                <FaCog className="me-2" />
                Set Up Preferences Now
              </Button>
            </div>
          </div>
        </Alert>
      )}

      <Row className="mb-4">
        <Col>
          <h2>Welcome to your Dashboard</h2>
          <p className="text-muted">Manage your profile and find your perfect roommate match</p>
        </Col>
        <Col xs="auto">
          <Button variant="outline-danger" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" />
            Logout
          </Button>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="modern-card">
            <Card.Header>
              <FaUser className="me-2" />
              Profile Information
            </Card.Header>
            <Card.Body>
              <Row>
                <Col sm={4}>
                  <strong>Name:</strong>
                </Col>
                <Col sm={8}>
                  {user?.firstName} {user?.lastName}
                </Col>
              </Row>
              <Row className="mt-2">
                <Col sm={4}>
                  <strong>Email:</strong>
                </Col>
                <Col sm={8}>
                  <FaEnvelope className="me-1" />
                  {user?.email}
                </Col>
              </Row>
              {user?.profession && (
                <Row className="mt-2">
                  <Col sm={4}>
                    <strong>Profession:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.profession}
                  </Col>
                </Row>
              )}
              {user?.isStudent && (
                <Row className="mt-2">
                  <Col sm={4}>
                    <strong>Student:</strong>
                  </Col>
                  <Col sm={8}>
                    {user.university} - {user.major}
                  </Col>
                </Row>
              )}
              <Button 
                variant="outline-primary" 
                className="mt-3 btn-modern"
                onClick={() => navigate('/profile')}
              >
                <FaEdit className="me-2" />
                Edit Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="modern-card">
            <Card.Header>
              Quick Actions
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  className="btn-modern"
                  onClick={() => navigate('/dashboard')}
                  disabled={!hasBasicPreferences}
                >
                  <FaSearch className="me-2" />
                  Find Roommates
                </Button>
                <Button 
                  variant={hasBasicPreferences ? "success" : "warning"}
                  className="btn-modern"
                  onClick={() => navigate('/preferences')}
                >
                  <FaCog className="me-2" />
                  {hasBasicPreferences ? "Update Preferences" : "Complete Preferences"}
                </Button>
                <Button 
                  variant="info" 
                  className="btn-modern"
                  onClick={() => navigate('/dashboard')}
                  disabled={!hasBasicPreferences}
                >
                  <FaComments className="me-2" />
                  View Messages
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="modern-card">
            <Card.Header>
              Recent Activity
            </Card.Header>
            <Card.Body>
              <p className="text-muted">No recent activity to display.</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 