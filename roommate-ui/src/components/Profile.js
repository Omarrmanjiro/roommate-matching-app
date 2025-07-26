import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { 
  FaUser, FaEdit, FaSave, FaTimes, FaEnvelope, FaCheckCircle,
  FaCamera
} from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const calculateProfileCompletion = useCallback(() => {
    const fields = ['firstName', 'lastName', 'email'];
    
    const completedFields = fields.filter(field => {
      const value = user[field];
      return value && value.toString().trim() !== '';
    }).length;
    
    const completion = Math.round((completedFields / fields.length) * 100);
    setProfileCompletion(completion);
  }, [user]);

  useEffect(() => {
    if (user) {
      calculateProfileCompletion();
    }
  }, [user, calculateProfileCompletion]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/Auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load profile. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Only send the fields that are supported by the backend
      const updateData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName
        // Note: password is not included as it's optional for profile updates
      };
      
      await axios.put('http://localhost:8080/Auth/profile', updateData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUser(formData);
      setEditing(false);
      setSaving(false);
      
      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been successfully updated.',
        confirmButtonColor: '#28a745'
      });
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditing(false);
  };

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would typically upload to a server
      // For now, we'll just show a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profilePicture: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status" style={{ color: 'var(--highlight-color)' }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Row className="justify-content-center">
          <Col lg={10}>
            {/* Profile Completion Card */}
            <Card className="modern-card mb-4">
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5 className="mb-2">Profile Completion</h5>
                    <ProgressBar 
                      now={profileCompletion} 
                      variant={profileCompletion >= 80 ? 'success' : profileCompletion >= 60 ? 'warning' : 'danger'}
                      className="mb-2"
                    />
                    <small className="text-muted">
                      {profileCompletion}% complete - {profileCompletion >= 80 ? 'Excellent!' : profileCompletion >= 60 ? 'Good progress!' : 'Keep going!'}
                    </small>
                  </Col>
                  <Col md={4} className="text-end">
                    <Badge bg={profileCompletion >= 80 ? 'success' : profileCompletion >= 60 ? 'warning' : 'danger'}>
                      {profileCompletion}%
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Main Profile Card */}
            <Card className="modern-card">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h3 className="mb-0">
                    <FaUser className="me-2" />
                    Profile Information
                  </h3>
                  <small className="text-muted">Manage your basic profile information</small>
                </div>
                {!editing ? (
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setEditing(true)}
                    className="btn-modern"
                  >
                    <FaEdit className="me-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div>
                    <Button 
                      variant="success" 
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-modern me-2"
                    >
                      {saving ? <Spinner size="sm" /> : <FaSave />}
                      {saving ? ' Saving...' : ' Save Changes'}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={handleCancel}
                      className="btn-modern"
                    >
                      <FaTimes className="me-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </Card.Header>
              <Card.Body>
                <Row>
                  {/* Profile Picture Section */}
                  <Col md={3} className="text-center mb-4">
                    <div className="position-relative">
                      <div 
                        className="rounded-circle mx-auto mb-3 position-relative"
                        style={{
                          width: '150px',
                          height: '150px',
                          background: 'var(--gradient-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          color: 'var(--highlight-color)',
                          cursor: editing ? 'pointer' : 'default'
                        }}
                        onClick={() => editing && document.getElementById('profilePictureInput').click()}
                      >
                        {formData.profilePicture ? (
                          <img 
                            src={formData.profilePicture} 
                            alt="Profile" 
                            className="rounded-circle"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <FaUser />
                        )}
                        {editing && (
                          <div className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2">
                            <FaCamera size={16} color="white" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        id="profilePictureInput"
                        accept="image/*"
                        onChange={handleProfilePictureUpload}
                        style={{ display: 'none' }}
                        disabled={!editing}
                      />
                      {user.isVerified && (
                        <Badge 
                          bg="success" 
                          className="position-absolute"
                          style={{ top: '10px', right: '50%', transform: 'translateX(50%)' }}
                        >
                          <FaCheckCircle className="me-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <h4>{formData.firstName} {formData.lastName}</h4>
                    <p className="text-muted mb-2">
                      <FaEnvelope className="me-1" />
                      {formData.email}
                    </p>
                  </Col>

                  {/* Profile Information */}
                  <Col md={9}>
                    <Row>
                      {/* Basic Information */}
                      <Col md={12}>
                        <h5 className="mb-3">
                          <FaUser className="me-2" />
                          Basic Information
                        </h5>
                        <Row>
                          <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={formData.firstName || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="form-control-modern"
                            placeholder="Enter your first name"
                          />
                        </Form.Group>
                          </Col>
                          <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={formData.lastName || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="form-control-modern"
                            placeholder="Enter your last name"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaEnvelope className="me-2" />
                            Email Address *
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            disabled={!editing}
                            className="form-control-modern"
                            placeholder="Enter your email address"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Account Information */}
                    <Row className="mt-4">
                      <Col md={12}>
                        <h5 className="mb-3">Account Information</h5>
                        <Row>
                          <Col md={4}>
                            <p><strong>Member since:</strong><br />
                              {new Date(user.createAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </Col>
                          <Col md={4}>
                            <p><strong>Status:</strong><br />
                              <Badge bg={user.status === 'ACTIVE' ? 'success' : 'warning'}>
                                {user.status}
                              </Badge>
                            </p>
                          </Col>
                          <Col md={4}>
                            <p><strong>Last Login:</strong><br />
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                            </p>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Profile; 