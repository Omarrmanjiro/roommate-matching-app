import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Badge, ProgressBar } from 'react-bootstrap';
import { 
  FaCog, FaSave, FaPaw, FaSmoking, FaUsers, FaClock, FaMapMarkerAlt, 
  FaDollarSign, FaVenusMars, FaBirthdayCake, FaVolumeUp, FaBed, FaGraduationCap, 
  FaHeart, FaCheckCircle, FaExclamationTriangle, FaInfoCircle
} from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';
import Confetti from 'react-confetti';

const Preferences = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({});
  const [preferencesCompletion, setPreferencesCompletion] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const calculatePreferencesCompletion = useCallback(() => {
    const fields = [
      'cleanliness', 'sleepSchedule', 'noiseTolerance', 'studyPreference',
      'visitorPolicy', 'socialPreference', 'workSchedule', 'genderPreference',
      'agePreference', 'minBudget', 'maxBudget', 'preferredNeighborhoods'
    ];
    
    const completedFields = fields.filter(field => {
      const value = preferences[field];
      return value && value.toString().trim() !== '';
    }).length;
    
    const completion = Math.round((completedFields / fields.length) * 100);
    setPreferencesCompletion(completion);
  }, [preferences]);

  useEffect(() => {
    if (preferences) {
      calculatePreferencesCompletion();
      // Check if this is first time setup (no basic preferences filled)
      const hasBasicPreferences = preferences.cleanliness || 
                                 preferences.sleepSchedule || 
                                 preferences.noiseTolerance || 
                                 preferences.socialPreference ||
                                 preferences.minBudget ||
                                 preferences.maxBudget;
      
      setIsFirstTimeSetup(!hasBasicPreferences);
      
      // Encouragement messages
      if (preferencesCompletion === 100) {
        setEncouragement("🎉 All done! You're ready for perfect matches!");
      } else if (preferencesCompletion >= 80) {
        setEncouragement("🔥 Amazing! Just a few more for perfection.");
      } else if (preferencesCompletion >= 60) {
        setEncouragement("🚀 Great progress! Keep going!");
      } else if (preferencesCompletion >= 40) {
        setEncouragement("✨ You're getting there! Fill out more for better matches.");
      } else {
        setEncouragement("🌱 Start setting your preferences for awesome matches!");
      }
    }
  }, [preferences, preferencesCompletion, calculatePreferencesCompletion]);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/users/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle null values properly - keep null as null for empty inputs
      const processedData = {};
      Object.keys(response.data).forEach(key => {
        const value = response.data[key];
        if (value === null || value === undefined) {
          processedData[key] = null; // Keep null as null for empty inputs
        } else if (typeof value === 'boolean') {
          processedData[key] = value;
        } else {
          processedData[key] = value;
        }
      });
      
      setPreferences(processedData);
      setFormData(processedData);
      setLoading(false);
    } catch (err) {
      setError('Failed to load preferences. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue;
    
    if (type === 'checkbox') {
      processedValue = checked;
    } else {
      // Convert empty strings to null for better data consistency
      processedValue = value === '' ? null : value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setShowConfetti(false);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/users/preferences', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPreferences(formData);
      setSuccess('Preferences updated successfully!');
      setSaving(false);
      setShowConfetti(true);
      
      // Check if this was first-time setup
      const hasBasicPreferences = formData.cleanliness || 
                                 formData.sleepSchedule || 
                                 formData.noiseTolerance || 
                                 formData.socialPreference ||
                                 formData.minBudget ||
                                 formData.maxBudget;
      
      if (isFirstTimeSetup && hasBasicPreferences) {
        // First time completing preferences
        await Swal.fire({
          icon: 'success',
          title: 'Preferences Completed! 🎉',
          text: 'Great job! Your preferences have been saved. You\'re now ready to find your perfect roommate match!',
          confirmButtonText: 'Go to Dashboard',
          background: 'var(--background-card)',
          color: 'var(--text-primary)'
        });
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        // Regular update
        Swal.fire({
          icon: 'success',
          title: 'Preferences Saved!',
          text: 'Your roommate preferences have been updated successfully.',
          confirmButtonColor: '#28a745'
        });
      }
      
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (err) {
      setError('Failed to update preferences. Please try again.');
      setSaving(false);
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

  return (
    <Container fluid className="mt-4 px-3">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />} 
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Row className="justify-content-center">
          <Col lg={11} xl={10}>
            {/* Preferences Completion Card */}
            <motion.div className="modern-card mb-4 fade-in" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <Card.Body>
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5 className="mb-2 gradient-text section-title">🎯 Preferences Completion</h5>
                    <ProgressBar 
                      now={preferencesCompletion} 
                      variant={preferencesCompletion >= 80 ? 'success' : preferencesCompletion >= 60 ? 'warning' : 'danger'}
                      className="mb-2"
                      animated
                    />
                    <small className="text-muted progress-label">
                      {preferencesCompletion}% complete - {preferencesCompletion >= 80 ? 'Excellent matching potential!' : preferencesCompletion >= 60 ? 'Good matching potential!' : 'Complete more preferences for better matches!'}
                    </small>
                    <div className="mt-2 encouragement-text">{encouragement}</div>
                  </Col>
                  <Col md={4} className="text-end">
                    <Badge bg={preferencesCompletion >= 80 ? 'success' : preferencesCompletion >= 60 ? 'warning' : 'danger'}>
                      {preferencesCompletion}%
                    </Badge>
                  </Col>
                </Row>
              </Card.Body>
            </motion.div>

            {/* Main Preferences Card */}
            <motion.div className="modern-card fade-in" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h3 className="mb-0 preferences-header">
                      <FaCog className="me-2" /> 
                      {isFirstTimeSetup ? 'Welcome! Set Up Your Preferences' : 'Roommate Preferences'} 
                      <span role="img" aria-label="sparkles">✨</span>
                    </h3>
                    <p className="text-muted mb-0">
                      {isFirstTimeSetup 
                        ? 'Let\'s get to know you better to find your perfect roommate match! 🎯'
                        : 'Set your preferences to find the perfect roommate match 🥳'
                      }
                    </p>
                  </div>
                  <motion.div whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="success" 
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-modern"
                  >
                    {saving ? <Spinner size="sm" /> : <FaSave />}
                    {saving ? ' Saving...' : isFirstTimeSetup ? ' Complete Setup' : ' Save Preferences'}
                  </Button>
                  </motion.div>
                </div>
              </Card.Header>
              <Card.Body className="px-3">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                <Form>
                  {/* Basic Lifestyle Preferences */}
                  <motion.div className="slide-up" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                  <Row className="mb-4 preferences-section">
                    <Col md={12}>
                        <h5 className="mb-3 gradient-text section-title">
                          <FaHeart className="me-2" /> Basic Lifestyle Preferences <span role="img" aria-label="sun">☀️</span>
                      </h5>
                      <p className="section-subtitle highlight">These preferences help us understand your daily lifestyle and habits.</p>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#007bff' }}>Cleanliness Level</Form.Label>
                        <Form.Select
                          name="cleanliness"
                          value={formData.cleanliness ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Cleanliness Level</option>
                          <option value="VERY_TIDY">Very Tidy - I keep everything spotless</option>
                          <option value="TIDY">Tidy - I maintain a clean environment</option>
                          <option value="NEUTRAL">Neutral - I'm reasonably tidy</option>
                          <option value="MESSY">Messy - I don't mind some mess</option>
                          <option value="VERY_MESSY">Very Messy - I'm quite relaxed about cleanliness</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Cleanliness Importance</Form.Label>
                        <Form.Select
                          name="cleanlinessImportance"
                          value={formData.cleanlinessImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#20c997' }}>
                          <FaBed className="me-2" />
                          Sleep Schedule
                        </Form.Label>
                        <Form.Select
                          name="sleepSchedule"
                          value={formData.sleepSchedule ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Sleep Schedule</option>
                          <option value="EARLY_BIRD">Early Bird - Early to bed, early to rise</option>
                          <option value="DAY_ORIENTED">Day Oriented - Regular daytime schedule</option>
                          <option value="NIGHT_OWL">Night Owl - Late to bed, late to rise</option>
                          <option value="FLEXIBLE">Flexible - I adapt to different schedules</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Sleep Schedule Importance</Form.Label>
                        <Form.Select
                          name="sleepScheduleImportance"
                          value={formData.sleepScheduleImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  </motion.div>

                  {/* Noise and Study Preferences */}
                  <motion.div className="slide-up" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                  <Row className="mb-4 preferences-section">
                    <Col md={12}>
                        <h5 className="mb-3 gradient-text section-title">
                          <FaVolumeUp className="me-2" /> Noise & Study Preferences <span role="img" aria-label="books">📚</span>
                      </h5>
                      <p className="section-subtitle highlight" style={{ color: '#e83e8c' }}>Set your noise and study preferences for a harmonious living environment.</p>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#17a2b8' }}>Noise Tolerance</Form.Label>
                        <Form.Select
                          name="noiseTolerance"
                          value={formData.noiseTolerance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Noise Tolerance</option>
                          <option value="LOW">Low - I need a quiet environment</option>
                          <option value="MEDIUM">Medium - Some noise is okay</option>
                          <option value="HIGH">High - I don't mind noise</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Noise Tolerance Importance</Form.Label>
                        <Form.Select
                          name="noiseToleranceImportance"
                          value={formData.noiseToleranceImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#fd7e14' }}>
                          <FaGraduationCap className="me-2" />
                          Study Preference
                        </Form.Label>
                        <Form.Select
                          name="studyPreference"
                          value={formData.studyPreference ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Study Preference</option>
                          <option value="SOLO">Solo Study - I prefer studying alone</option>
                          <option value="GROUP">Group Study - I prefer studying with others</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Study Preference Importance</Form.Label>
                        <Form.Select
                          name="studyPreferenceImportance"
                          value={formData.studyPreferenceImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  </motion.div>

                  {/* Pet and Smoking Preferences */}
                  <motion.div className="slide-up" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
                  <Row className="mb-4 preferences-section">
                    <Col md={12}>
                        <h5 className="mb-3 gradient-text section-title">
                          <FaPaw className="me-2" /> Pet & Smoking Preferences <span role="img" aria-label="paw">🐾</span>
                      </h5>
                      <p className="section-subtitle highlight">Set your pet and smoking preferences for a comfortable living environment.</p>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          name="hasPets"
                          checked={formData.hasPets === true}
                          onChange={handleInputChange}
                          label="I have pets"
                          className="mb-3"
                        />
                        <Form.Label style={{ color: '#6f42c1' }}>Has Pets Importance</Form.Label>
                        <Form.Select
                          name="hasPetsImportance"
                          value={formData.hasPetsImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          name="acceptsPets"
                          checked={formData.acceptsPets === true}
                          onChange={handleInputChange}
                          label="I accept pets"
                          className="mb-3"
                        />
                        <Form.Label style={{ color: '#6f42c1' }}>Accepts Pets Importance</Form.Label>
                        <Form.Select
                          name="acceptsPetsImportance"
                          value={formData.acceptsPetsImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Check
                          type="checkbox"
                          name="isSmoker"
                          checked={formData.isSmoker === true}
                          onChange={handleInputChange}
                          label="I am a smoker"
                          className="mb-3"
                        />
                        <Form.Check
                          type="checkbox"
                          name="acceptsSmokers"
                          checked={formData.acceptsSmokers === true}
                          onChange={handleInputChange}
                          label="I accept smokers"
                          className="mb-3"
                        />
                        <Form.Label style={{ color: '#6f42c1' }}>Smoking Importance</Form.Label>
                        <Form.Select
                          name="smokingImportance"
                          value={formData.smokingImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  </motion.div>

                  {/* Social and Work Preferences */}
                  <motion.div className="slide-up" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }}>
                  <Row className="mb-4 preferences-section">
                    <Col md={12}>
                        <h5 className="mb-3 gradient-text section-title">
                          <FaUsers className="me-2" /> Social & Work Preferences <span role="img" aria-label="briefcase">💼</span>
                      </h5>
                      <p className="section-subtitle highlight">Set your social and work preferences for a balanced living environment.</p>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#007bff' }}>Social Preference</Form.Label>
                        <Form.Select
                          name="socialPreference"
                          value={formData.socialPreference ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Social Preference</option>
                          <option value="VERY_SOCIAL">Very Social - I love having people over</option>
                          <option value="MODERATELY_SOCIAL">Moderately Social - I have friends over occasionally</option>
                          <option value="QUIET">Quiet - I prefer a peaceful environment</option>
                          <option value="INTROVERT">Introvert - I prefer minimal social interaction</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Social Preference Importance</Form.Label>
                        <Form.Select
                          name="socialPreferenceImportance"
                          value={formData.socialPreferenceImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#fd7e14' }}>
                          <FaClock className="me-2" />
                          Work/Study Schedule
                        </Form.Label>
                        <Form.Select
                          name="workSchedule"
                          value={formData.workSchedule ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Work/Study Schedule</option>
                          <option value="MORNING_SHIFT">Morning Shift - Early morning work/study</option>
                          <option value="AFTERNOON_SHIFT">Afternoon Shift - Afternoon work/study</option>
                          <option value="NIGHT_SHIFT">Night Shift - Evening/Night work</option>
                          <option value="FLEXIBLE">Flexible Hours - Varies</option>
                          <option value="REMOTE">Remote Work - Work from home</option>
                          <option value="HYBRID">Hybrid - Mix of office and remote</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Work Schedule Importance</Form.Label>
                        <Form.Select
                          name="workScheduleImportance"
                          value={formData.workScheduleImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  </motion.div>

                  {/* Budget and Location Preferences */}
                  <motion.div className="slide-up" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.5 }}>
                  <Row className="mb-4 preferences-section">
                    <Col md={12}>
                        <h5 className="mb-3 gradient-text section-title">
                          <FaDollarSign className="me-2" /> Budget & Location Preferences <span role="img" aria-label="money">💸</span>
                      </h5>
                      <p className="section-subtitle highlight">Set your budget and location preferences for a comfortable living environment.</p>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#20c997' }}>Minimum Budget (per month)</Form.Label>
                        <Form.Control
                          type="number"
                          name="minBudget"
                          value={formData.minBudget ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                          placeholder="e.g., 800"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#20c997' }}>Maximum Budget (per month)</Form.Label>
                        <Form.Control
                          type="number"
                          name="maxBudget"
                          value={formData.maxBudget ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                          placeholder="e.g., 1500"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Budget Importance</Form.Label>
                        <Form.Select
                          name="budgetImportance"
                          value={formData.budgetImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#007bff' }}>
                          <FaMapMarkerAlt className="me-2" />
                          Preferred Neighborhoods
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="preferredNeighborhoods"
                          value={formData.preferredNeighborhoods ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                          placeholder="Enter preferred neighborhoods, areas, or cities..."
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#007bff' }}>Preferred Transportation</Form.Label>
                        <Form.Control
                          type="text"
                          name="preferredTransportation"
                          value={formData.preferredTransportation ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                          placeholder="e.g., Near subway, walking distance to campus, etc."
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Location Importance</Form.Label>
                        <Form.Select
                          name="locationImportance"
                          value={formData.locationImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  </motion.div>

                  {/* Roommate Preferences */}
                  <motion.div className="slide-up" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }}>
                  <Row className="mb-4 preferences-section">
                    <Col md={12}>
                        <h5 className="mb-3 gradient-text section-title">
                          <FaVenusMars className="me-2" /> Roommate Preferences <span role="img" aria-label="friends">🧑‍🤝‍🧑</span>
                      </h5>
                      <p className="section-subtitle highlight">Set your roommate preferences for a compatible living arrangement.</p>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#007bff' }}>Gender Preference</Form.Label>
                        <Form.Select
                          name="genderPreference"
                          value={formData.genderPreference ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Gender Preference</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="ANY">Any Gender</option>
                          <option value="SAME_GENDER">Same Gender</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Gender Preference Importance</Form.Label>
                        <Form.Select
                          name="genderPreferenceImportance"
                          value={formData.genderPreferenceImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#fd7e14' }}>
                          <FaBirthdayCake className="me-2" />
                          Age Preference
                        </Form.Label>
                        <Form.Select
                          name="agePreference"
                          value={formData.agePreference ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Age Preference</option>
                          <option value="SAME_AGE">Same Age</option>
                          <option value="YOUNGER">Younger</option>
                          <option value="OLDER">Older</option>
                          <option value="ANY_AGE">Any Age</option>
                          <option value="STUDENT_AGE">Student Age</option>
                          <option value="PROFESSIONAL_AGE">Professional Age</option>
                        </Form.Select>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ color: '#6f42c1' }}>Age Preference Importance</Form.Label>
                        <Form.Select
                          name="agePreferenceImportance"
                          value={formData.agePreferenceImportance ?? ''}
                          onChange={handleInputChange}
                          className="form-control-modern"
                        >
                          <option value="">Select Importance Level</option>
                          <option value="NEUTRAL">Neutral - Not a major concern</option>
                          <option value="PREFERRED">Preferred - Would like someone similar</option>
                          <option value="MUST_HAVE">Must Have - Very important to me</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  </motion.div>

                  {/* Additional Lifestyle Preferences */}
                  <motion.div className="slide-up" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.7 }}>
                  <Row className="mb-4 preferences-section">
                    <Col md={12}>
                        <h5 className="mb-3 gradient-text section-title">
                          <FaHeart className="me-2" /> Additional Lifestyle Preferences <span role="img" aria-label="sparkles">🌟</span>
                      </h5>
                      <p className="section-subtitle highlight">Select any additional preferences that are important to you.</p>
                    </Col>
                    <Col md={6} className="px-2">
                      <Form.Group className="mb-2">
                        <Form.Check
                          type="checkbox"
                          name="prefersQuietEnvironment"
                          checked={formData.prefersQuietEnvironment === true}
                          onChange={handleInputChange}
                          label="I prefer a quiet environment"
                          className="mb-3"
                        />
                        <Form.Check
                          type="checkbox"
                          name="prefersActiveLifestyle"
                          checked={formData.prefersActiveLifestyle === true}
                          onChange={handleInputChange}
                          label="I prefer an active lifestyle"
                          className="mb-3"
                        />
                        <Form.Check
                          type="checkbox"
                          name="prefersCooking"
                          checked={formData.prefersCooking === true}
                          onChange={handleInputChange}
                          label="I enjoy cooking at home"
                          className="mb-3"
                        />
                        <Form.Check
                          type="checkbox"
                          name="prefersEatingOut"
                          checked={formData.prefersEatingOut === true}
                          onChange={handleInputChange}
                          label="I prefer eating out"
                          className="mb-3"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6} className="px-2">
                      <Form.Group className="mb-2">
                        <Form.Check
                          type="checkbox"
                          name="prefersGym"
                          checked={formData.prefersGym === true}
                          onChange={handleInputChange}
                          label="I go to the gym regularly"
                          className="mb-3"
                        />
                        <Form.Check
                          type="checkbox"
                          name="prefersParties"
                          checked={formData.prefersParties === true}
                          onChange={handleInputChange}
                          label="I enjoy hosting parties"
                          className="mb-3"
                        />
                        <Form.Check
                          type="checkbox"
                          name="prefersEarlyRiser"
                          checked={formData.prefersEarlyRiser === true}
                          onChange={handleInputChange}
                          label="I am an early riser"
                          className="mb-3"
                        />
                        <Form.Check
                          type="checkbox"
                          name="prefersNightOwl"
                          checked={formData.prefersNightOwl === true}
                          onChange={handleInputChange}
                          label="I am a night owl"
                          className="mb-3"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  </motion.div>
                </Form>
              </Card.Body>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default Preferences; 