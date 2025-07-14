import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FaFlask, FaUser, FaCog } from 'react-icons/fa';
import axios from 'axios';

const TestAuth = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (endpoint, success, message) => {
    setResults(prev => [...prev, { endpoint, success, message, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testEndpoint = async (endpoint, method = 'GET', data = null) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        method,
        url: `http://localhost:8080${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      addResult(endpoint, true, `Success: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      const errorMessage = error.response 
        ? `Error ${error.response.status}: ${error.response.data || error.response.statusText}`
        : `Network Error: ${error.message}`;
      addResult(endpoint, false, errorMessage);
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setResults([]);
    
    // Test authentication
    await testEndpoint('/Auth/test');
    
    // Test profile endpoint
    await testEndpoint('/Auth/profile');
    
    // Test preferences endpoint
    await testEndpoint('/users/preferences');
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="modern-card">
            <Card.Header>
              <h3 className="mb-0">
                <FaFlask className="me-2" />
                Authentication Test
              </h3>
              <p className="text-muted mb-0">Test API endpoints and authentication</p>
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col>
                  <Button 
                    variant="primary" 
                    onClick={runAllTests}
                    disabled={loading}
                    className="btn-modern me-2"
                  >
                    <FaFlask className="me-2" />
                    {loading ? 'Testing...' : 'Run All Tests'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={clearResults}
                    className="btn-modern"
                  >
                    Clear Results
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col>
                  <h5>Test Results:</h5>
                  {results.length === 0 ? (
                    <p className="text-muted">No tests run yet. Click "Run All Tests" to start.</p>
                  ) : (
                    <div>
                      {results.map((result, index) => (
                        <Alert 
                          key={index} 
                          variant={result.success ? 'success' : 'danger'}
                          className="mb-2"
                        >
                          <strong>{result.endpoint}</strong> - {result.timestamp}
                          <br />
                          {result.message}
                        </Alert>
                      ))}
                    </div>
                  )}
                </Col>
              </Row>

              <Row className="mt-4">
                <Col>
                  <h5>Individual Tests:</h5>
                  <div className="d-grid gap-2 d-md-block">
                    <Button 
                      variant="outline-primary" 
                      onClick={() => testEndpoint('/Auth/test')}
                      disabled={loading}
                      className="btn-modern me-2"
                    >
                      <FaUser className="me-2" />
                      Test Auth
                    </Button>
                    <Button 
                      variant="outline-success" 
                      onClick={() => testEndpoint('/Auth/profile')}
                      disabled={loading}
                      className="btn-modern me-2"
                    >
                      <FaUser className="me-2" />
                      Test Profile
                    </Button>
                    <Button 
                      variant="outline-info" 
                      onClick={() => testEndpoint('/users/preferences')}
                      disabled={loading}
                      className="btn-modern"
                    >
                      <FaCog className="me-2" />
                      Test Preferences
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default TestAuth; 