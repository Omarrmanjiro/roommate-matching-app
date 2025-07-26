import React, { useState, useEffect, useRef } from 'react';
import { Dropdown, Badge, ListGroup, Button } from 'react-bootstrap';
import { FaBell, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      
      // Refresh unread count
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read first
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setShow(false);

    // Navigate based on notification type
    switch (notification.type) {
      case 'MESSAGE':
        // Find roomId using senderId
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8080/api/matches/room/${notification.senderId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.exists) {
            navigate(`/chat/${response.data.roomId}`);
          } else {
            // Fallback to matches page if room not found
            navigate('/matches');
          }
        } catch (error) {
          console.error('Error finding room for message:', error);
          navigate('/matches');
        }
        break;
      case 'MATCH_REQUEST':
        // Navigate to matches page to see the new match
        navigate('/matches');
        break;
      case 'PREFERENCE_UPDATE':
        // Navigate to matches page to see the updated user's profile
        navigate('/matches');
        break;
      case 'SYSTEM_ALERT':
        // Navigate to dashboard for system alerts
        navigate('/dashboard');
        break;
      default:
        // Default to matches page
        navigate('/matches');
        break;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MESSAGE':
        return '💬';
      case 'MATCH_REQUEST':
        return '👥';
      case 'SYSTEM_ALERT':
        return '🔔';
      case 'PREFERENCE_UPDATE':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const clearAllNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:8080/api/notifications/clear', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const clearOldNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('http://localhost:8080/api/notifications/clear-old', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh notifications
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error clearing old notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDropdownToggle = (isOpen) => {
    setShow(isOpen);
    if (isOpen) {
      fetchNotifications();
    }
  };

  return (
    <div ref={dropdownRef}>
      <Dropdown onToggle={handleDropdownToggle} show={show}>
        <Dropdown.Toggle 
          variant="link" 
          className="nav-link-modern text-decoration-none position-relative"
        >
          <FaBell className="me-1" />
          {unreadCount > 0 && (
            <Badge 
              bg="danger" 
              className="position-absolute top-0 start-100 translate-middle"
              style={{ fontSize: '0.6rem', transform: 'translate(-50%, -50%)' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="modern-card" style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            <div className="d-flex align-items-center gap-2">
              {unreadCount > 0 && (
                <Badge bg="primary">{unreadCount} new</Badge>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="p-1"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('Clear all notifications?')) {
                      await clearAllNotifications();
                      // Refetch notifications after clearing
                      fetchNotifications();
                    }
                  }}
                  title="Clear all notifications"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center p-3 text-muted">
              <FaBell className="mb-2" size={24} />
              <p className="mb-0">No notifications yet</p>
            </div>
          ) : (
            <ListGroup variant="flush">
              <AnimatePresence>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListGroup.Item 
                      className={`d-flex align-items-start p-3 ${!notification.isRead ? 'bg-light' : ''} notification-item`}
                      style={{ 
                        border: 'none', 
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleNotificationClick(notification)}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = notification.isRead ? 'transparent' : '#f8f9fa'}
                    >
                      <div className="me-2 mt-1">
                        <span style={{ fontSize: '1.2rem' }}>
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="mb-1" style={{ fontSize: '0.9rem' }}>
                              {notification.content}
                            </p>
                            <small className="text-muted">
                              {formatTime(notification.createdAt)}
                            </small>
                          </div>
                          
                          {!notification.isRead && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              title="Mark as read"
                            >
                              <FaCheck size={12} />
                            </Button>
                          )}
                        </div>
                      </div>
                    </ListGroup.Item>
                  </motion.div>
                ))}
              </AnimatePresence>
            </ListGroup>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default NotificationDropdown; 