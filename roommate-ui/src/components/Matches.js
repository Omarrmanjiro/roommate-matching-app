import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Row, Col, Alert, Spinner, Nav } from 'react-bootstrap';
import { FaUserPlus, FaUser, FaCheck, FaTimes, FaClock, FaInfoCircle, FaCog } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [tab, setTab] = useState('suggestions');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPreferences, setUserPreferences] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const navigate = useNavigate();

  const fetchMatches = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // First, try to get existing suggestions
      const suggestionsResponse = await axios.get('http://localhost:8080/api/matches/suggestions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let matches = suggestionsResponse.data;
      
      // If no suggestions exist, generate some
      if (matches.length === 0) {
        console.log('No existing suggestions found. Generating new matches...');
        const topMatchesResponse = await axios.get('http://localhost:8080/api/matches/top?topN=10', {
          headers: { Authorization: `Bearer ${token}` }
        });
        matches = topMatchesResponse.data;
      }
      
      setMatches(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMatches = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/matches/top?topN=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(response.data);
    } catch (error) {
      console.error('Error generating matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleAccept = async (matchId) => {
    setAccepting(matchId);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8080/api/matches/accept', 
        { matchId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMatches(); // Refresh matches
    } catch (error) {
      console.error('Error accepting match:', error);
    } finally {
      setAccepting(null);
    }
  };

  const handleUserClick = async (match) => {
    setSelectedUser(match);
    setShowUserModal(true);
    setLoadingPreferences(true);
    
    try {
      const response = await axios.get(`http://localhost:8080/users/preferences/${match.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUserPreferences(response.data);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      setUserPreferences(null);
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handleCancelMatch = async () => {
    if (!selectedUser) return;
    
    try {
      await axios.delete(`http://localhost:8080/api/matches/${selectedUser.matchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove the match from the list
      setMatches(matches.filter(match => match.matchId !== selectedUser.matchId));
      setShowUserModal(false);
      setSelectedUser(null);
      setUserPreferences(null);
    } catch (error) {
      console.error('Error canceling match:', error);
      alert('Failed to cancel match. Please try again.');
    }
  };

  const handleStartMessage = async (match) => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:8080/api/matches/room/${match.id}`;
      console.log('Calling room ID endpoint:', url);
      console.log('Match data:', match);
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Room ID response:', response.data);
      
      if (response.data.exists) {
        navigate(`/chat/${response.data.roomId}`);
      } else {
        alert('No chat room found for this match. Both users must accept the match first.');
      }
    } catch (error) {
      console.error('Error getting room ID:', error);
      console.error('Error details:', error.response?.data);
      alert('Error getting chat room. Please try again.');
    }
  };

  const handleReject = async (matchId) => {
    setRejecting(matchId);
    try {
      await axios.delete(`http://localhost:8080/api/matches/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove the match from the list
      setMatches(matches.filter(match => match.matchId !== matchId));
    } catch (error) {
      console.error('Error rejecting match:', error);
      alert('Failed to reject match. Please try again.');
    } finally {
      setRejecting(null);
    }
  };

  const getImportanceText = (importance) => {
    switch (importance) {
      case 'VERY_IMPORTANT': return 'Very Important';
      case 'IMPORTANT': return 'Important';
      case 'SOMEWHAT_IMPORTANT': return 'Somewhat Important';
      case 'NOT_IMPORTANT': return 'Not Important';
      default: return importance;
    }
  };

  const getPreferenceText = (preference) => {
    if (preference === null || preference === undefined) return 'Not specified';
    if (typeof preference === 'boolean') return preference ? 'Yes' : 'No';
    return preference.toString();
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}><Spinner animation="border" /></div>;
  }

  // Filtering - Updated to handle bidirectional matches correctly
  // For the current user's perspective:
  // - Suggestions: matches where current user hasn't accepted yet
  // - Waiting: matches where current user accepted but other user hasn't accepted the reverse match
  // - Accepted: matches where both users have accepted each other
  
  const suggestions = matches.filter(m => !m.acceptedByUser);
  const waiting = matches.filter(m => m.acceptedByUser && !m.acceptedBySuggested);
  const accepted = matches.filter(m => m.acceptedByUser && m.acceptedBySuggested);

  const renderMatchCard = (match, type) => {
    const isAccepted = type === 'accepted';
    const isWaiting = type === 'waiting';
    const isSuggestion = type === 'suggestion';
    
    return (
      <Col key={match.matchId} md={6} lg={4} className="mb-3">
        <Card 
          className={`h-100 modern-card ${isAccepted ? 'border-success' : isWaiting ? 'border-warning' : 'border-primary'}`}
          style={{ cursor: isAccepted ? 'pointer' : 'default' }}
          onClick={isAccepted ? () => handleUserClick(match) : undefined}
        >
          <Card.Body className="d-flex flex-column">
            <div className="d-flex align-items-center mb-3">
              <div className="avatar-placeholder me-3">
                <FaUser size={24} />
              </div>
              <div>
                <h6 className="mb-1">{match.firstName}</h6>
                <Badge 
                  bg={isAccepted ? 'success' : isWaiting ? 'warning' : 'primary'}
                  className="text-white"
                >
                  {isAccepted ? 'Accepted' : isWaiting ? 'Waiting' : `${Math.round(match.score)}% Match`}
                </Badge>
              </div>
            </div>
            
            <div className="mt-auto">
              {isAccepted && (
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="flex-fill"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartMessage(match);
                    }}
                  >
                    Start Message
                  </Button>
                </div>
              )}
              
              {isWaiting && (
                <div className="d-flex gap-2">
                  <Button 
                    variant="success" 
                    size="sm" 
                    className="flex-fill"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccept(match.matchId);
                    }}
                    disabled={accepting === match.matchId}
                  >
                    {accepting === match.matchId ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <FaCheck className="me-2" />
                        Accept
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReject(match.matchId);
                    }}
                    disabled={rejecting === match.matchId}
                  >
                    {rejecting === match.matchId ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Rejecting...
                      </>
                    ) : (
                      <>
                        <FaTimes className="me-2" />
                        Reject
                      </>
                    )}
                  </Button>
                </div>
              )}

              {isSuggestion && (
                <Button 
                  variant="success" 
                  size="sm" 
                  className="w-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept(match.matchId);
                  }}
                  disabled={accepting === match.matchId}
                >
                  {accepting === match.matchId ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Accepting...
                    </>
                  ) : (
                    <>
                      <FaCheck className="me-2" />
                      Accept Match
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Matches</h2>
        <Button variant="primary" onClick={generateMatches} disabled={loading}>
          {loading ? <Spinner size="sm" /> : <FaUserPlus />} Generate New Matches
        </Button>
      </div>
      <Nav variant="tabs" activeKey={tab} onSelect={setTab} className="mb-4">
        <Nav.Item>
          <Nav.Link eventKey="suggestions">Suggestions</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="waiting">Waiting</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="accepted">Accepted</Nav.Link>
        </Nav.Item>
      </Nav>
      {tab === 'suggestions' && (
        suggestions.length === 0 ? <Alert variant="info">No suggestions at the moment. <Button variant="info" onClick={generateMatches} className="ms-2">Generate New Suggestions</Button></Alert> :
        <Row>{suggestions.map(m => renderMatchCard(m, 'suggestion'))}</Row>
      )}
      {tab === 'waiting' && (
        waiting.length === 0 ? <Alert variant="info">No pending matches.</Alert> :
        <Row>{waiting.map(m => renderMatchCard(m, 'waiting'))}</Row>
      )}
      {tab === 'accepted' && (
        accepted.length === 0 ? <Alert variant="info">No accepted matches yet.</Alert> :
        <Row>{accepted.map(m => renderMatchCard(m, 'accepted'))}</Row>
      )}

      <Modal show={showUserModal} onHide={() => setShowUserModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaUser className="me-2" />
            {selectedUser?.firstName}'s Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6><FaInfoCircle className="me-2" />Basic Information</h6>
              <p><strong>Name:</strong> {selectedUser?.firstName}</p>
              <p><strong>Match Score:</strong> <Badge bg="success">{selectedUser?.score}%</Badge></p>
              
              <h6 className="mt-3"><FaCog className="me-2" />Preferences</h6>
              {loadingPreferences ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                  <p className="mt-2">Loading preferences...</p>
                </div>
              ) : userPreferences ? (
                <div>
                  <p><strong>Cleanliness:</strong> {getPreferenceText(userPreferences.cleanliness)}</p>
                  <p><strong>Sleep Schedule:</strong> {getPreferenceText(userPreferences.sleepSchedule)}</p>
                  <p><strong>Noise Tolerance:</strong> {getPreferenceText(userPreferences.noiseTolerance)}</p>
                  <p><strong>Study Preference:</strong> {getPreferenceText(userPreferences.studyPreference)}</p>
                  <p><strong>Visitor Policy:</strong> {getPreferenceText(userPreferences.visitorPolicy)}</p>
                  <p><strong>Has Pets:</strong> {getPreferenceText(userPreferences.hasPets)}</p>
                  <p><strong>Accepts Pets:</strong> {getPreferenceText(userPreferences.acceptsPets)}</p>
                  <p><strong>Is Smoker:</strong> {getPreferenceText(userPreferences.isSmoker)}</p>
                  <p><strong>Accepts Smokers:</strong> {getPreferenceText(userPreferences.acceptsSmokers)}</p>
                  <p><strong>Social Preference:</strong> {getPreferenceText(userPreferences.socialPreference)}</p>
                  <p><strong>Work Schedule:</strong> {getPreferenceText(userPreferences.workSchedule)}</p>
                  <p><strong>Budget Range:</strong> ${userPreferences.minBudget || 'N/A'} - ${userPreferences.maxBudget || 'N/A'}</p>
                  <p><strong>Gender Preference:</strong> {getPreferenceText(userPreferences.genderPreference)}</p>
                  <p><strong>Age Preference:</strong> {getPreferenceText(userPreferences.agePreference)}</p>
                </div>
              ) : (
                <p className="text-muted">No preferences available for this user.</p>
              )}
            </Col>
            
            <Col md={6}>
              <h6><FaCheck className="me-2" />Lifestyle Preferences</h6>
              {userPreferences && (
                <div>
                  <p><strong>Prefers Quiet Environment:</strong> {getPreferenceText(userPreferences.prefersQuietEnvironment)}</p>
                  <p><strong>Prefers Active Lifestyle:</strong> {getPreferenceText(userPreferences.prefersActiveLifestyle)}</p>
                  <p><strong>Prefers Cooking:</strong> {getPreferenceText(userPreferences.prefersCooking)}</p>
                  <p><strong>Prefers Eating Out:</strong> {getPreferenceText(userPreferences.prefersEatingOut)}</p>
                  <p><strong>Prefers Gym:</strong> {getPreferenceText(userPreferences.prefersGym)}</p>
                  <p><strong>Prefers Parties:</strong> {getPreferenceText(userPreferences.prefersParties)}</p>
                  <p><strong>Prefers Early Riser:</strong> {getPreferenceText(userPreferences.prefersEarlyRiser)}</p>
                  <p><strong>Prefers Night Owl:</strong> {getPreferenceText(userPreferences.prefersNightOwl)}</p>
                </div>
              )}
              
              <h6 className="mt-3"><FaClock className="me-2" />Importance Levels</h6>
              {userPreferences && (
                <div>
                  <p><strong>Cleanliness:</strong> {getImportanceText(userPreferences.cleanlinessImportance)}</p>
                  <p><strong>Sleep Schedule:</strong> {getImportanceText(userPreferences.sleepScheduleImportance)}</p>
                  <p><strong>Noise Tolerance:</strong> {getImportanceText(userPreferences.noiseToleranceImportance)}</p>
                  <p><strong>Study Preference:</strong> {getImportanceText(userPreferences.studyPreferenceImportance)}</p>
                  <p><strong>Visitor Policy:</strong> {getImportanceText(userPreferences.visitorPolicyImportance)}</p>
                  <p><strong>Budget:</strong> {getImportanceText(userPreferences.budgetImportance)}</p>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleCancelMatch}>
            <FaTimes className="me-2" />
            Cancel Match
          </Button>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Matches; 