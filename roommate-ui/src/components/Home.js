import React from 'react';
import { Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaUsers, FaHandshake, FaRocket, FaHeart, FaStar, FaHome, FaMapMarkerAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import TestConnection from './TestConnection';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const features = [
    {
      icon: FaSearch,
      title: "Smart Matching",
      description: "Our advanced algorithm finds roommates based on your lifestyle, preferences, and compatibility.",
      color: "primary"
    },
    {
      icon: FaUsers,
      title: "Verified Profiles",
      description: "All users are verified to ensure a safe and trustworthy roommate matching experience.",
      color: "success"
    },
    {
      icon: FaHandshake,
      title: "Easy Communication",
      description: "Built-in messaging system to connect and get to know potential roommates before meeting.",
      color: "warning"
    }
  ];

  const upcomingFeatures = [
    {
      icon: FaHome,
      title: "Property Listings",
      description: "Find available apartments and houses with roommates already looking for housemates.",
      comingSoon: true
    },
    {
      icon: FaMapMarkerAlt,
      title: "Location-Based Search",
      description: "Search for roommates in your preferred neighborhoods and areas.",
      comingSoon: true
    },
    {
      icon: FaStar,
      title: "Reviews & Ratings",
      description: "Read reviews and ratings from previous roommates to make informed decisions.",
      comingSoon: true
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="home-container"
    >
      {/* Hero Section */}
      <motion.div 
        className="hero-section"
        variants={itemVariants}
      >
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content text-center">
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Find Your Perfect
            <span className="gradient-text"> Roommate</span>
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Connect with people who share your lifestyle, preferences, and living habits.
            Start your journey to finding the ideal roommate today.
          </motion.p>
          
          <motion.div 
            className="hero-buttons"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Button as={Link} to="/register" className="btn-modern btn-hero me-3">
              <FaRocket className="me-2" />
              Get Started
            </Button>
            <Button as={Link} to="/login" className="btn-modern btn-outline-hero">
              <FaHeart className="me-2" />
              Sign In
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        className="features-section"
        variants={itemVariants}
      >
        <div className="text-center mb-5">
          <h2 className="section-title">Why Choose Roommate Matcher?</h2>
          <p className="section-subtitle">Discover the features that make us the best choice for finding your perfect roommate</p>
        </div>

        <Row className="g-4">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Col lg={4} md={6} key={index}>
                <motion.div
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card className="modern-card feature-card h-100">
                    <Card.Body className="text-center p-4">
                      <motion.div
                        className={`feature-icon ${feature.color}`}
                        whileHover={{ 
                          rotate: 360,
                          transition: { duration: 0.6 }
                        }}
                      >
                        <IconComponent size={40} />
                      </motion.div>
                      <Card.Title className="mt-3 mb-3">{feature.title}</Card.Title>
                      <Card.Text>{feature.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      </motion.div>

      {/* Coming Soon Section */}
      <motion.div 
        className="features-section"
        variants={itemVariants}
      >
        <div className="text-center mb-5">
          <h2 className="section-title">Coming Soon</h2>
          <p className="section-subtitle">Exciting new features to enhance your roommate finding experience</p>
        </div>

        <Row className="g-4">
          {upcomingFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Col lg={4} md={6} key={index}>
                <motion.div
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="modern-card feature-card h-100 coming-soon-card">
                    <Card.Body className="text-center p-4">
                      <div className="coming-soon-badge">Coming Soon</div>
                      <motion.div
                        className="feature-icon muted"
                        whileHover={{ 
                          rotate: 360,
                          transition: { duration: 0.6 }
                        }}
                      >
                        <IconComponent size={40} />
                      </motion.div>
                      <Card.Title className="mt-3 mb-3">{feature.title}</Card.Title>
                      <Card.Text>{feature.description}</Card.Text>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            );
          })}
        </Row>
      </motion.div>

      {/* Community Section */}
      <motion.div 
        className="stats-section"
        variants={itemVariants}
      >
        <Card className="modern-card stats-card">
          <Card.Body className="text-center p-5">
            <h3 className="mb-4">Join Our Growing Community</h3>
            <p className="mb-4">Be part of a community that's changing how people find roommates</p>
            <Row className="g-4">
              <Col md={4} sm={6}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-item">
                    <FaUsers size={30} className="text-primary mb-2" />
                    <h3 className="stat-number">Join Today</h3>
                    <p className="stat-label">Start Your Journey</p>
                  </div>
                </motion.div>
              </Col>
              <Col md={4} sm={6}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-item">
                    <FaHandshake size={30} className="text-success mb-2" />
                    <h3 className="stat-number">Connect</h3>
                    <p className="stat-label">Find Your Match</p>
                  </div>
                </motion.div>
              </Col>
              <Col md={4} sm={6}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-item">
                    <FaHome size={30} className="text-warning mb-2" />
                    <h3 className="stat-number">Move In</h3>
                    <p className="stat-label">Start Living Together</p>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>

      {/* Test Connection Component - Remove this after testing */}
      <motion.div variants={itemVariants}>
        <TestConnection />
      </motion.div>
    </motion.div>
  );
};

export default Home; 