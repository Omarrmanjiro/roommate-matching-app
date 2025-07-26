import React, { useState } from 'react';
import { Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const TestConnection = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setStatus('');

    try {
      // Test a simple GET request to the backend
      await axios.get('http://localhost:8080/');
      setStatus('✅ Connection successful! Backend is running.');
      
      Swal.fire({
        icon: 'success',
        title: 'Connection Test Successful!',
        text: 'Your React app can now communicate with the Spring Boot backend.',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      setStatus('❌ Connection failed: ' + error.message);
      
      Swal.fire({
        icon: 'error',
        title: 'Connection Test Failed',
        text: 'Unable to connect to the backend. Please check if the Spring Boot app is running.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Header>
        <h5>Backend Connection Test</h5>
      </Card.Header>
      <Card.Body>
        <p>Click the button below to test the connection to your Spring Boot backend:</p>
        
        <Button 
          onClick={testConnection} 
          disabled={loading}
          variant="info"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </Button>

        {status && (
          <Alert variant={status.includes('✅') ? 'success' : 'danger'} className="mt-3">
            {status}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default TestConnection; 