import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaSignInAlt, FaUserPlus, FaUser, FaCog, FaSignOutAlt, FaUserCircle, FaFlask } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import NotificationDropdown from './NotificationDropdown';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:8080/Auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const user = response.data;
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setUserName(fullName || user.email);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If we can't get the name, just use the email from token
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.sub);
      } catch (e) {
        setUserName('User');
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const authenticated = !!token;
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        fetchUserProfile();
      } else {
        setUserName('');
      }
    };

    // Custom event for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('authChange', handleAuthChange);
    checkAuth(); // Initial check
    
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserName('');
    navigate('/');
  };

  const publicNavItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/login', label: 'Login', icon: FaSignInAlt },
    { path: '/register', label: 'Register', icon: FaUserPlus },
  ];

  const privateNavItems = [
    { path: '/', label: 'Home', icon: FaHome },
    { path: '/dashboard', label: 'Dashboard', icon: FaUser },
    { path: '/matches', label: 'Matches', icon: FaUserPlus },
    { path: '/preferences', label: 'Preferences', icon: FaCog },
    { path: '/test', label: 'Test Auth', icon: FaFlask },
  ];

  const navItems = isAuthenticated ? privateNavItems : publicNavItems;

  return (
    <Navbar 
      expand="lg" 
      className={`navbar-modern ${scrolled ? 'scrolled' : ''}`}
      fixed="top"
    >
      <Container>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Navbar.Brand as={Link} to="/" className="navbar-brand-modern">
            <FaHome className="me-2" />
            Roommate Matcher
          </Navbar.Brand>
        </motion.div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {navItems.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Nav.Link 
                    as={Link} 
                    to={item.path}
                    className={`nav-link-modern ${isActive ? 'active' : ''}`}
                  >
                    <IconComponent className="me-1" />
                    {item.label}
                    {isActive && (
                      <motion.div
                        className="nav-indicator"
                        layoutId="nav-indicator"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Nav.Link>
                </motion.div>
              );
            })}

            {/* Notifications for authenticated users */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <NotificationDropdown />
              </motion.div>
            )}

            {/* User Menu for authenticated users */}
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Dropdown>
                  <Dropdown.Toggle 
                    variant="link" 
                    className="nav-link-modern text-decoration-none"
                  >
                    <FaUserCircle className="me-1" />
                    {userName || 'Profile'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="modern-card">
                    <Dropdown.Item as={Link} to="/profile">
                      <FaUser className="me-2" />
                      My Profile
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/preferences">
                      <FaCog className="me-2" />
                      Preferences
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </motion.div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation; 