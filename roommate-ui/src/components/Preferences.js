import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaCog, FaSave, FaPaw, FaBed, FaVolumeUp, FaGraduationCap, FaHeart, FaUsers } from 'react-icons/fa';
import axios from 'axios';

const Preferences = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/users/preferences', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setFormData(response.data);
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
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8080/users/preferences', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSuccess('Preferences updated successfully!');
      setSaving(false);
    } catch (err) {
      setError('Failed to update preferences. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4 px-3">
        <Row className="justify-content-center">
        <Col lg={8} xl={7}>
          <Card className="mb-4">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0"><FaCog className="me-2" /> Roommate Preferences</h3>
                <Button variant="success" onClick={handleSave} disabled={saving}>
                  {saving ? <Spinner size="sm" /> : <FaSave />} {saving ? ' Saving...' : 'Save Preferences'}
                  </Button>
                </div>
              </Card.Header>
            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <Form>
                {/* Cleanliness */}
                <Row className="mb-3">
                    <Col md={6}>
                    <Form.Group>
                      <Form.Label><FaHeart className="me-2" />Cleanliness Level</Form.Label>
                        <Form.Select
                          name="cleanliness"
                          value={formData.cleanliness ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Cleanliness Level</option>
                        <option value="VERY_TIDY">Very Tidy</option>
                        <option value="TIDY">Tidy</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="MESSY">Messy</option>
                        <option value="VERY_MESSY">Very Messy</option>
                        </Form.Select>
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Cleanliness Importance</Form.Label>
                        <Form.Select
                          name="cleanlinessImportance"
                          value={formData.cleanlinessImportance ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Importance Level</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="PREFERRED">Preferred</option>
                        <option value="MUST_HAVE">Must Have</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                </Row>
                {/* Sleep Schedule */}
                <Row className="mb-3">
                    <Col md={6}>
                    <Form.Group>
                      <Form.Label><FaBed className="me-2" />Sleep Schedule</Form.Label>
                        <Form.Select
                          name="sleepSchedule"
                          value={formData.sleepSchedule ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Sleep Schedule</option>
                        <option value="EARLY_BIRD">Early Bird</option>
                        <option value="DAY_ORIENTED">Day Oriented</option>
                        <option value="NIGHT_OWL">Night Owl</option>
                        <option value="FLEXIBLE">Flexible</option>
                        </Form.Select>
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Sleep Schedule Importance</Form.Label>
                        <Form.Select
                          name="sleepScheduleImportance"
                          value={formData.sleepScheduleImportance ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Importance Level</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="PREFERRED">Preferred</option>
                        <option value="MUST_HAVE">Must Have</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                {/* Noise Tolerance */}
                <Row className="mb-3">
                    <Col md={6}>
                    <Form.Group>
                      <Form.Label><FaVolumeUp className="me-2" />Noise Tolerance</Form.Label>
                        <Form.Select
                          name="noiseTolerance"
                          value={formData.noiseTolerance ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Noise Tolerance</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        </Form.Select>
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Noise Tolerance Importance</Form.Label>
                        <Form.Select
                          name="noiseToleranceImportance"
                          value={formData.noiseToleranceImportance ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Importance Level</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="PREFERRED">Preferred</option>
                        <option value="MUST_HAVE">Must Have</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                </Row>
                {/* Study Preference */}
                <Row className="mb-3">
                    <Col md={6}>
                    <Form.Group>
                      <Form.Label><FaGraduationCap className="me-2" />Study Preference</Form.Label>
                        <Form.Select
                          name="studyPreference"
                          value={formData.studyPreference ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Study Preference</option>
                        <option value="SOLO">Solo Study</option>
                        <option value="GROUP">Group Study</option>
                        </Form.Select>
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Study Preference Importance</Form.Label>
                        <Form.Select
                          name="studyPreferenceImportance"
                          value={formData.studyPreferenceImportance ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Importance Level</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="PREFERRED">Preferred</option>
                        <option value="MUST_HAVE">Must Have</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                {/* Visitor Policy */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label><FaUsers className="me-2" />Visitor Policy</Form.Label>
                      <Form.Select
                        name="visitorPolicy"
                        value={formData.visitorPolicy ?? ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Visitor Policy</option>
                        <option value="NO_GUESTS">No Guests</option>
                        <option value="NOTIFY_FIRST">Notify Me First</option>
                        <option value="PARTY_FRIENDLY">Party Friendly</option>
                      </Form.Select>
                    </Form.Group>
                    </Col>
                    <Col md={6}>
                    <Form.Group>
                      <Form.Label>Visitor Policy Importance</Form.Label>
                      <Form.Select
                        name="visitorPolicyImportance"
                        value={formData.visitorPolicyImportance ?? ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Importance Level</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="PREFERRED">Preferred</option>
                        <option value="MUST_HAVE">Must Have</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                {/* Pet Preferences */}
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                        <Form.Check
                          type="checkbox"
                          name="hasPets"
                          checked={formData.hasPets === true}
                          onChange={handleInputChange}
                        label={<span><FaPaw className="me-2" />I have pets</span>}
                        />
                      <Form.Label>Has Pets Importance</Form.Label>
                        <Form.Select
                          name="hasPetsImportance"
                          value={formData.hasPetsImportance ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Importance Level</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="PREFERRED">Preferred</option>
                        <option value="MUST_HAVE">Must Have</option>
                        </Form.Select>
                      </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                        <Form.Check
                          type="checkbox"
                          name="acceptsPets"
                          checked={formData.acceptsPets === true}
                          onChange={handleInputChange}
                        label={<span><FaPaw className="me-2" />I accept pets</span>}
                        />
                      <Form.Label>Accepts Pets Importance</Form.Label>
                        <Form.Select
                          name="acceptsPetsImportance"
                          value={formData.acceptsPetsImportance ?? ''}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Importance Level</option>
                        <option value="NEUTRAL">Neutral</option>
                        <option value="PREFERRED">Preferred</option>
                        <option value="MUST_HAVE">Must Have</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
          </Card>
          </Col>
        </Row>
    </Container>
  );
};

export default Preferences; 