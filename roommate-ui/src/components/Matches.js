import React, { useEffect, useState } from 'react';
import { Card, Button, Spinner, Alert, Row, Col, ProgressBar, Nav } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserCheck, FaUserPlus, FaCog, FaHourglassHalf, FaHandshake } from 'react-icons/fa';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const [preferencesComplete, setPreferencesComplete] = useState(true);
  const [tab, setTab] = useState('suggestions');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // First, check if preferences are complete
        const prefRes = await axios.get('http://localhost:8080/users/preferences', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const prefs = prefRes.data;
        const hasBasicPreferences = prefs.cleanliness || prefs.sleepSchedule || prefs.noiseTolerance || prefs.socialPreference || prefs.minBudget || prefs.maxBudget;
        setPreferencesComplete(!!hasBasicPreferences);
        if (!hasBasicPreferences) {
          setMatches([]);
          setLoading(false);
          return;
        }
        
        // First, generate fresh suggestions using /top
        await axios.get('http://localhost:8080/api/matches/top?topN=10', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Then fetch all suggestions (with acceptance status)
        const res = await axios.get('http://localhost:8080/api/matches/suggestions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setMatches(res.data);
      } catch (err) {
        setError('Failed to load matches.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const handleAccept = async (matchId) => {
    setAccepting(matchId);
    try {
      const token = localStorage.getItem('token');
      console.log('Accepting match:', matchId);
      
      const acceptResponse = await axios.post('http://localhost:8080/api/matches/accept', { matchId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Accept response:', acceptResponse.data);
      
      // Refresh the matches list to get updated status
      const res = await axios.get('http://localhost:8080/api/matches/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Updated matches:', res.data);
      setMatches(res.data);
      
    } catch (err) {
      console.error('Accept error:', err);
      alert('Failed to accept match.');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '40vh' }}><Spinner animation="border" /></div>;
  }

  if (!preferencesComplete) {
    return (
      <Alert variant="warning" className="mt-4">
        <div className="d-flex align-items-center">
          <FaCog className="me-2" size={24} />
          <div>
            <h5 className="mb-1">Complete Your Preferences</h5>
            <p className="mb-2">To see your best roommate matches, please complete your preferences first.</p>
            <Button variant="primary" onClick={() => navigate('/preferences')}>Complete Preferences</Button>
          </div>
        </div>
      </Alert>
    );
  }

  // Filtering - Updated to handle bidirectional matches correctly
  // For the current user's perspective:
  // - Suggestions: matches where current user hasn't accepted yet
  // - Waiting: matches where current user accepted but other user hasn't accepted the reverse match
  // - Accepted: matches where both users have accepted each other
  
  const suggestions = matches.filter(m => !m.acceptedByUser);
  const waiting = matches.filter(m => m.acceptedByUser && !m.acceptedBySuggested);
  const accepted = matches.filter(m => m.acceptedByUser && m.acceptedBySuggested);

  const renderMatchCard = (match, type) => (
    <Col md={6} lg={4} key={match.matchId} className="mb-4">
      <Card className="modern-card h-100">
        <Card.Body>
          <div className="d-flex align-items-center mb-3">
            {type === 'suggestion' && <FaUserPlus size={32} className="me-3 text-primary" />}
            {type === 'waiting' && <FaHourglassHalf size={32} className="me-3 text-warning" />}
            {type === 'accepted' && <FaHandshake size={32} className="me-3 text-success" />}
            <div>
              <h5 className="mb-0">{match.firstName}</h5>
              <small className="text-muted">Match Score:</small>
              <ProgressBar now={match.score} label={`${Math.round(match.score)}%`} className="mt-1" style={{height: '1.2rem'}}/>
            </div>
          </div>
          {type === 'suggestion' && (
            <Button 
              variant="success" 
              className="w-100 mt-2"
              onClick={() => handleAccept(match.matchId)}
              disabled={accepting === match.matchId}
            >
              {accepting === match.matchId ? <Spinner size="sm" /> : <FaUserCheck className="me-2" />} Accept Match
            </Button>
          )}
          {type === 'waiting' && (
            <Alert variant="warning" className="mt-2 mb-0 py-1 text-center">Waiting for the other user to accept...</Alert>
          )}
          {type === 'accepted' && (
            <Alert variant="success" className="mt-2 mb-0 py-1 text-center">You are matched! 🎉</Alert>
          )}
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Your Matches</h2>
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
        suggestions.length === 0 ? <Alert variant="info">No suggestions at the moment.</Alert> :
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
    </div>
  );
};

export default Matches; 