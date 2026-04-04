import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext.jsx';


export default function Users() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, login, signup } = useAuth();
  const navigate = useNavigate();

  // Redirect when user becomes available (after login/signup)
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/profile', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted', { isSignUp, formData });
    setError('');
    setSuccess('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (isSignUp && !formData.name) {
      setError('Please enter your name');
      return;
    }

    try {
      setLoading(true);

      if (isSignUp) {
        console.log('Attempting signup...');
        await signup(formData.name, formData.email, formData.password);
        console.log('Signup successful, switching to login');
        setSuccess('Account created successfully! Please log in.');
        setIsSignUp(false);
        setFormData({ name: '', email: '', password: '' });
      } else {
        console.log('Attempting login...');
        await login(formData.email, formData.password);
        console.log('Login successful, redirecting...');
        // Navigation will happen automatically when user state updates
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Container fluid className="users px-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  // Show auth form if not logged in
  return (
    <Container fluid className="users px-0">
      <div className="auth-container py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg">
              <Card.Body>
                <Card.Title className="text-center mb-4">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Card.Title>

                <Alert variant={success ? 'success' : 'danger'} show={!!(error || success)} className="mb-3">
                  {error || success}
                </Alert>

                <form onSubmit={handleSubmit}>
                  {isSignUp && (
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={6}
                    />
                    <small className="form-text text-muted">Min 6 characters</small>
                  </div>

                  {isSignUp && (
                    <div className="mb-3 form-check">
                      <input type="checkbox" className="form-check-input" id="terms" required />
                      <label className="form-check-label" htmlFor="terms">
                        I agree to the terms and conditions
                      </label>
                    </div>
                  )}

                  <div className="d-grid mb-3">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          {isSignUp ? 'Creating...' : 'Signing in...'}
                        </>
                      ) : (
                        isSignUp ? 'Sign Up' : 'Sign In'
                      )}
                    </Button>
                  </div>
                </form>

                {/* Social Login Buttons */}
                <div className="d-flex flex-column align-items-center mt-4">
                  {isSignUp && (
                    <Button variant="outline-primary" className="mb-2 d-flex align-items-center justify-content-center w-100">
                      <svg className="me-2" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </Button>
                  )}
                  <Button variant="outline-primary" className="mb-2 d-flex align-items-center justify-content-center w-100">
                    <svg className="me-2" width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                      <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" clipRule="evenodd"/>
                    </svg>
                    Continue with GitHub
                  </Button>
                </div>

                <div className="text-center mt-4">
                  {isSignUp ? (
                    <p className="mb-0">
                      Already have an account?{' '}
                      <Button
                        variant="link"
                        p={0}
                        onClick={() => {
                          setIsSignUp(false);
                          setError('');
                          setSuccess('');
                        }}
                      >
                        Sign In
                      </Button>
                    </p>
                  ) : (
                    <p className="mb-0">
                      Don't have an account?{' '}
                      <Button
                        variant="link"
                        p={0}
                        onClick={() => {
                          setIsSignUp(true);
                          setError('');
                          setSuccess('');
                        }}
                      >
                        Sign Up
                      </Button>
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
