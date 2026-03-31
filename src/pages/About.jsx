import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Container, Row, Col, Button, Badge, Modal, Alert, Spinner, Form } from 'react-bootstrap';
import { api } from '../services/api';

const PRICING_TIERS = {
  sd: { name: 'SD', multiplier: 0.8, label: 'Standard Definition' },
  hd: { name: 'HD', multiplier: 1.0, label: 'High Definition' },
  uhd: { name: '4K', multiplier: 1.5, label: 'Ultra HD' }
};

export default function About() {
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [buyMessage, setBuyMessage] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);

  // Load films from SWAPI
  useEffect(() => {
    loadFilms();
  }, []);

  const loadFilms = async () => {
    try {
      setLoading(true);
      const data = await api.getFilms();
      setFilms(data.results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate base price for film
  const getBasePrice = (filmId) => {
    return (filmId * 12.99).toFixed(2);
  };

  // Add to cart with tier selection
  const addToCart = (film, tier = 'hd', quantity = 1) => {
    const existing = cart.find(item => item.episode_id === film.episode_id && item.tier === tier);
    if (existing) {
      setCart(prev =>
        prev.map(item =>
          item.episode_id === film.episode_id && item.tier === tier
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      );
    } else {
      setCart(prev => [...prev, {
        ...film,
        quantity,
        tier,
        tierName: PRICING_TIERS[tier].name,
        price: (parseFloat(getBasePrice(film.episode_id)) * PRICING_TIERS[tier].multiplier).toFixed(2)
      }]);
    }
  };

  // Remove from cart
  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // Update quantity
  const updateQuantity = (index, delta) => {
    setCart(prev =>
      prev.map((item, i) => {
        if (i === index) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Get total
  const getTotal = () => {
    let total = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    if (discountApplied) {
      total = total * (1 - discountApplied.discount / 100);
    }
    return total.toFixed(2);
  };

  // Get total items
  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Apply discount code
  const handleApplyDiscount = () => {
    setDiscountError('');
    const codes = {
      'SW10': 10,
      'MASTER': 25,
      'FORCE': 15,
      'JEDI': 20
    };

    const code = discountCode.toUpperCase().trim();
    if (codes[code]) {
      setDiscountApplied({ code, discount: codes[code] });
    } else {
      setDiscountError('Invalid discount code');
    }
  };

  // Buy now (direct purchase)
  const handleBuyNow = (film, tier = 'hd', quantity = 1) => {
    alert(`Purchasing "${film.title}" in ${PRICING_TIERS[tier].name} quality (x{quantity}) - $${(parseFloat(getBasePrice(film.episode_id)) * PRICING_TIERS[tier].multiplier * quantity).toFixed(2)}`);
  };

  return (
    <Container fluid className="about px-0">
      {/* Header */}
      <div className="hero-section text-center py-5">
        <Alert variant="primary" className="welcome-banner mb-4 border-0">
          <div className="d-flex align-items-center justify-content-center">
            <Alert.Heading className="mb-0">
              🎬 Shop
            </Alert.Heading>
          </div>
        </Alert>
        <p className="hero-subtitle text-muted">
          Own the Star Wars saga on digital!
        </p>
      </div>

      <Container className="my-4">
        {/* Cart Button */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>Available Films:</strong> {films.length}
          </div>
          <Button
            variant="outline-primary"
            onClick={() => setShowCart(true)}
            className="position-relative"
          >
            🛒 Cart
            {getTotalItems() > 0 && (
              <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>

        {/* Films Grid */}
        <Row xs={1} md={2} lg={3} xl={4} className="g-4">
          {films.map((film) => (
            <Col key={film.episode_id}>
              <Card className="h-100 film-card shadow-sm">
                {/* Poster with link to details */}
                <Link to={`/film/${film.episode_id}`} className="text-decoration-none">
                  <Card.Img
                    variant="top"
                    src={`https://picsum.photos/seed/starwars${film.episode_id}/300/400`}
                    alt={film.title}
                    style={{ height: '300px', objectFit: 'cover', cursor: 'pointer' }}
                  />
                </Link>
                <Card.Body className="d-flex flex-column">
                  <div className="flex-grow-1">
                    <Link to={`/film/${film.episode_id}`} className="text-decoration-none text-dark">
                      <Card.Title className="text-truncate" title={film.title} style={{ cursor: 'pointer' }}>
                        Episode {film.episode_id}: {film.title}
                      </Card.Title>
                    </Link>
                    <Card.Text className="small text-muted mb-1">
                      <strong>Director:</strong> {film.director}
                    </Card.Text>
                    <Card.Text className="small text-muted mb-2">
                      <strong>Released:</strong> {film.release_date}
                    </Card.Text>

                    {/* Pricing Tiers */}
                    <div className="mb-2">
                      <small className="text-muted">Select Quality:</small>
                      <div className="d-flex gap-1 flex-wrap">
                        {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                          <Button
                            key={key}
                            variant={key === 'hd' ? 'primary' : 'outline-secondary'}
                            size="sm"
                            className="px-2 py-1"
                            onClick={() => addToCart(film, key, 1)}
                            title={`Add ${tier.name} to cart - $${(parseFloat(getBasePrice(film.episode_id)) * tier.multiplier).toFixed(2)}`}
                          >
                            {tier.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Base Price */}
                    <Card.Text className="mt-2">
                      <small className="text-muted">From:</small>
                      <h6 className="text-primary fw-bold mb-0">${getBasePrice(film.episode_id)} (HD)</h6>
                    </Card.Text>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-grid gap-2 mt-2">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleBuyNow(film, 'hd', 1)}
                    >
                      💳 Buy Now
                    </Button>
                    <Link
                      to={`/film/${film.episode_id}`}
                      className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                      onClick={(e) => {
                        console.log('Navigating to film:', film.episode_id, 'title:', film.title);
                      }}
                    >
                      📄 View Details
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Cart Modal */}
      <Modal show={showCart} onHide={() => setShowCart(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🛒 Your Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cart.length === 0 ? (
            <p className="text-center text-muted py-4">Your cart is empty</p>
          ) : (
            <>
              {/* Discount Code */}
              <div className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter discount code (try: SW10, MASTER, FORCE, JEDI)"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError('');
                  }}
                  isInvalid={!!discountError}
                  className="mb-1"
                />
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={handleApplyDiscount} disabled={!discountCode.trim()}>
                    Apply Code
                  </Button>
                  {discountApplied && (
                    <Badge bg="success" className="align-self-center">
                      {discountApplied.code} (-{discountApplied.discount}%)
                      <Button variant="link" size="sm" className="text-white ms-2 p-0" onClick={() => { setDiscountApplied(null); setDiscountCode(''); }}>
                        ✕
                      </Button>
                    </Badge>
                  )}
                </div>
                {discountError && <div className="text-danger small mt-1">{discountError}</div>}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>{getTotalItems()} item(s)</h5>
                <div className="text-end">
                  <h5 className="text-primary mb-0">Total: ${getTotal()}</h5>
                  {discountApplied && (
                    <small className="text-success">
                      You saved: ${(parseFloat(getTotal()) / (1 - discountApplied.discount / 100) - parseFloat(getTotal())).toFixed(2)}
                    </small>
                  )}
                </div>
              </div>

              <div className="cart-items" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {cart.map((item, index) => (
                  <div key={`${item.episode_id}-${item.tier}`} className="border-bottom py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">
                          <Link
                            to={`/film/${item.episode_id}`}
                            className="text-start text-dark"
                            onClick={() => setShowCart(false)}
                            style={{ textDecoration: 'none' }}
                          >
                            Episode {item.episode_id}: {item.title}
                          </Link>
                        </h6>
                        <p className="small text-muted mb-1">
                          Quality: <Badge bg="secondary">{item.tierName}</Badge> | ${item.price} each
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateQuantity(index, -1)}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => updateQuantity(index, 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeFromCart(index)}
                          className="ms-2"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCart(false)}>
            Continue Shopping
          </Button>
          {cart.length > 0 && (
            <Button
              variant="primary"
              onClick={() => {
                alert(`Thank you for your order! Total: $${getTotal()}`);
                setCart([]);
                setDiscountApplied(null);
                setDiscountCode('');
                setShowCart(false);
              }}
            >
              Checkout
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
