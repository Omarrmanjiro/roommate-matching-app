import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Button, Form, Card, Spinner, Alert } from 'react-bootstrap';

const API_BASE = 'http://localhost:8080';

const Chat = () => {
  const { roomId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const stompClient = useRef(null);
  const chatEndRef = useRef(null);
  const [userEmail, setUserEmail] = useState('');

  const loadChatHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/chat/${roomId}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const history = await response.json();
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const connectWebSocket = useCallback(() => {
    const socket = new SockJS(`${API_BASE}/ws`);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      onConnect: () => {
        console.log('Connected to WebSocket');
        setConnected(true);
        
        // Subscribe to chat room
        stompClient.current.subscribe(`/topic/chat/${roomId}`, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages(prev => [...prev, receivedMessage]);
        });
      },
      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setConnected(false);
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
      }
    });

    stompClient.current.activate();
  }, [roomId]);

  useEffect(() => {
    // Get user email from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.sub);
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }

    // Load chat history
    loadChatHistory();
    
    // Connect to WebSocket
    connectWebSocket();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [roomId, loadChatHistory, connectWebSocket]);

  const sendMessage = () => {
    if (!input.trim() || !connected || !stompClient.current) return;
    
    try {
      const message = {
        roomId: roomId,
        content: input.trim(),
        senderEmail: userEmail
      };
      
      stompClient.current.publish({
        destination: '/app/chat',
        body: JSON.stringify(message)
      });
      
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Chat Room {roomId}</h5>
              <div>
                {connected ? (
                  <span className="badge bg-success">Connected</span>
                ) : (
                  <span className="badge bg-warning">Connecting...</span>
                )}
              </div>
            </Card.Header>
            <Card.Body style={{ height: '400px', overflowY: 'auto' }}>
              {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
              
              <div className="messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.senderEmail === userEmail ? 'text-end' : 'text-start'}`}>
                    <div className={`d-inline-block p-2 rounded ${msg.senderEmail === userEmail ? 'bg-primary text-white' : 'bg-light'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  disabled={!connected}
                />
                <Button 
                  variant="primary" 
                  onClick={sendMessage}
                  disabled={!connected || !input.trim()}
                  className="ms-2"
                >
                  Send
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Chat; 