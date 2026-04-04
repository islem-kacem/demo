import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext.jsx';
import { userService } from '../services/user';

export default function Profile() {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authUser) {
      navigate('/users');
      return;
    }
    loadProfile();
  }, [authUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getProfile();
      setUser(data.user);
      setName(data.user.name || '');
      setBio(data.user.profile?.bio || '');
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await userService.updateProfile({ name, bio });
      setUser(data.user);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setBio(user?.profile?.bio || '');
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/users');
    } catch (err) {
      setError(err.message || 'Logout failed');
    }
  };

  if (loading) {
    return (
      <Container fluid className="profile px-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="profile px-0">
      <div className="profile-container py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg">
              <Card.Body className="text-center">
                {/* Avatar */}
                <div className="mb-4 position-relative">
                  {user?.profile?.avatarUrl ? (
                    <img
                      src={user.profile.avatarUrl}
                      alt={user.name || user.email}
                      className="rounded-circle"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary text-white"
                      style={{ width: '120px', height: '120px', fontSize: '3rem' }}
                    >
                      {(user?.name || user?.email || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <Form onSubmit={handleSave}>
                    <div className="mb-3 text-start">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3 text-start">
                      <label htmlFor="bio" className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        id="bio"
                        rows="3"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    </div>
                    <div className="d-flex gap-2 justify-content-center mb-3">
                      <Button type="submit" variant="primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button type="button" variant="secondary" onClick={handleCancel} disabled={saving}>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                ) : (
                  <>
                    <Card.Title className="mb-2">{user?.name || 'No name set'}</Card.Title>
                    <Card.Subtitle className="mb-3 text-muted">{user?.email}</Card.Subtitle>
                    {user?.profile?.bio && (
                      <Card.Text className="mb-4">{user.profile.bio}</Card.Text>
                    )}
                    <div className="d-flex gap-2 justify-content-center mb-3">
                      <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
                        ✏️ Edit Profile
                      </Button>
                    </div>
                  </>
                )}

                {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
}
