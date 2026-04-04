import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Container, Button, Badge, Row, Col, ListGroup, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { api } from '../services/api';

const PRICING_TIERS = {
  sd: { name: 'SD', multiplier: 0.8, label: 'Standard Definition' },
  hd: { name: 'HD', multiplier: 1.0, label: 'High Definition' },
  uhd: { name: '4K', multiplier: 1.5, label: 'Ultra HD' }
};

export default function FilmDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTier, setSelectedTier] = useState('hd');
  const [quantity, setQuantity] = useState(1);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Mock films to supplement the API data
  const mockFilms = [
    {
      episode_id: 7,
      title: "Inception",
      opening_crawl: "Dreams feel real while we're in them...",
      director: "Christopher Nolan",
      producer: "Emma Thomas, Christopher Nolan",
      release_date: "2010-07-16"
    },
    {
      episode_id: 8,
      title: "The Matrix",
      opening_crawl: "The Matrix is everywhere...",
      director: "The Wachowskis",
      producer: "Joel Silver",
      release_date: "1999-03-24"
    },
    {
      episode_id: 9,
      title: "Interstellar",
      opening_crawl: "Mankind was born on Earth...",
      director: "Christopher Nolan",
      producer: "Emma Thomas, Christopher Nolan",
      release_date: "2014-11-05"
    },
    {
      episode_id: 10,
      title: "The Grand Budapest Hotel",
      opening_crawl: "The world was a lot more fun when it was in black and white...",
      director: "Wes Anderson",
      producer: "Wes Anderson, Scott Rudin, Steven Rales",
      release_date: "2014-02-27"
    },
    {
      episode_id: 11,
      title: "Mad Max: Fury Road",
      opening_crawl: "The desert claims many things...",
      director: "George Miller",
      producer: "Doug Mitchell, George Miller",
      release_date: "2015-05-15"
    },
    {
      episode_id: 12,
      title: "Everything Everywhere All at Once",
      opening_crawl: "You are not special...",
      director: " Daniels",
      producer: "Anthony and Joe Russo, Jonathan Wang",
      release_date: "2022-03-25"
    },
    {
      episode_id: 13,
      title: "Parasite",
      opening_crawl: "Plan the dish on your own...",
      director: "Bong Joon-ho",
      producer: "Bong Joon-ho, Kwak Sin-ae, Moon Yang-kwon",
      release_date: "2019-05-30"
    },
    {
      episode_id: 14,
      title: "The Shawshank Redemption",
      opening_crawl: "I don't know if these words are for you or for me...",
      director: "Frank Darabont",
      producer: "Frank Darabont, Niki Marvin",
      release_date: "1994-09-23"
    },
    {
      episode_id: 15,
      title: "Pulp Fiction",
      opening_crawl: "You know how they say 'Everything's a copycat'?",
      director: "Quentin Tarantino",
      producer: "Lawrence Bender, Danny DeVito, Michael Shamberg, Stacey Sher, Richard N. Gladstein, Peter MacGregor-Scott",
      release_date: "1994-09-10"
    },
    {
      episode_id: 16,
      title: "The Godfather",
      opening_crawl: "I believe in America...",
      director: "Francis Ford Coppola",
      producer: "Albert S. Ruddy",
      release_date: "1972-03-24"
    },
    {
      episode_id: 17,
      title: "Blade Runner 2049",
      opening_crawl: "You newer models are happy to be the one that's free...",
      director: "Denis Villeneuve",
      producer: "Ridley Scott, Andrew A. Kosove, Broderick Johnson, Cynthia Sikes Yorkin",
      release_date: "2017-10-06"
    },
    {
      episode_id: 18,
      title: "Get Out",
      opening_crawl: "Just because you're invited somewhere doesn't mean you're wanted...",
      director: "Jordan Peele",
      producer: "Jason Blum, Sean McKittrick, Edward H. Hamm Jr., Jordan Peele, Win Rosenfeld",
      release_date: "2017-02-24"
    }
  ];

  // Debug logging
  console.log('FilmDetails mounted with id:', id);

  useEffect(() => {
    loadFilm();
  }, [id]);

  const loadFilm = async () => {
    try {
      console.log('Loading film with id:', id);
      setLoading(true);
      const films = await api.getFilms();
      console.log('Available films from API:', films.results.map(f => f.episode_id));
      // Combine API films with mock films
      const allFilms = [...films.results, ...mockFilms];
      console.log('Total films available:', allFilms.length);
      const found = allFilms.find(f => f.episode_id === parseInt(id));
      console.log('Found film:', found);
      if (found) {
        setFilm(found);
      } else {
        setError('Film not found');
      }
    } catch (err) {
      console.error('Error loading film:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBasePrice = () => {
    if (!film) return 0;
    return (film.episode_id * 12.99).toFixed(2);
  };

  const getFinalPrice = () => {
    const base = parseFloat(getBasePrice());
    const tierMultiplier = PRICING_TIERS[selectedTier].multiplier;
    let price = base * tierMultiplier * quantity;

    if (discountApplied) {
      price = price * (1 - discountApplied.discount / 100);
    }

    return price.toFixed(2);
  };

  const applyDiscount = () => {
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

  const removeDiscount = () => {
    setDiscountApplied(null);
    setDiscountCode('');
  };

  // Add item to cart
  const addToCart = (film, tier, quantity) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find(item => item.episode_id === film.episode_id && item.tier === tier);
      if (existing) {
        existing.quantity += quantity;
      } else {
        const basePrice = (film.episode_id * 12.99).toFixed(2);
        cart.push({
          ...film,
          quantity,
          tier,
          tierName: PRICING_TIERS[tier].name,
          price: (parseFloat(basePrice) * PRICING_TIERS[tier].multiplier).toFixed(2)
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      console.log('Cart updated:', cart);
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Error adding to cart:', e);
      alert('Failed to add to cart. Please try again.');
    }
  };

  const handlePurchase = () => {
    setShowPurchaseModal(true);
  };

  const confirmPurchase = () => {
    addToCart(film, selectedTier, quantity);
    setShowPurchaseModal(false);
    const finalPrice = getFinalPrice();
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setQuantity(1);
      setDiscountApplied(null);
      setDiscountCode('');
      navigate('/about', {
        state: {
          justPurchased: true,
          filmTitle: film.title,
          quantity,
          tierName: PRICING_TIERS[selectedTier].name,
          totalPrice: finalPrice
        }
      });
    }, 2000);
  };

  if (loading) {
    return (
      <Container fluid className="film-details px-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      </Container>
    );
  }

  if (error || !film) {
    return (
      <Container fluid className="film-details px-0">
        <Alert variant="danger" className="m-3">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error || 'Film not found'}</p>
          <Button variant="primary" onClick={() => navigate('/about')}>
            Back to Shop
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="film-details px-0">
      {/* Back Button */}
      <div className="py-3 px-3">
        <Button variant="outline-secondary" onClick={() => navigate('/about')}>
          ← Back to Shop
        </Button>
      </div>

      {/* Success Message */}
      {purchaseSuccess && (
        <Container className="mb-3">
          <Alert variant="success" dismissible onClose={() => setPurchaseSuccess(false)}>
            <Alert.Heading>Purchase Successful!</Alert.Heading>
            <p>Thank you for purchasing "{film.title}"!</p>
          </Alert>
        </Container>
      )}

      <Container>
        <Row className="g-4">
          {/* Film Poster */}
          <Col md={4}>
            <Card className="shadow">
              <Card.Img
                variant="top"
                src={`https://picsum.photos/seed/starwars${film.episode_id}/400/600`}
                alt={film.title}
                style={{ height: '500px', objectFit: 'cover' }}
              />
            </Card>
          </Col>

          {/* Film Details */}
          <Col md={8}>
            <Card className="shadow h-100">
              <Card.Body className="d-flex flex-column">
                <Badge bg="primary" className="mb-2" style={{ width: 'fit-content' }}>
                  Episode {film.episode_id}
                </Badge>
                <Card.Title as="h1" className="mb-3">
                  {film.title}
                </Card.Title>

                <Card.Text as="div" className="mb-3">
                  <strong>Opening Craw:</strong>
                  <p className="text-muted fst-italic">{film.opening_crawl}</p>
                </Card.Text>

                <Row className="mb-3">
                  <Col xs={6}>
                    <strong>Director:</strong>
                    <p className="text-muted">{film.director}</p>
                  </Col>
                  <Col xs={6}>
                    <strong>Producer:</strong>
                    <p className="text-muted">{film.producer}</p>
                  </Col>
                  <Col xs={6}>
                    <strong>Release Date:</strong>
                    <p className="text-muted">{film.release_date}</p>
                  </Col>
                  <Col xs={6}>
                    <strong>Rating:</strong>
                    <p className="text-muted">
                      <Badge bg="warning" text="dark">{film.rt_score || 'N/A'}</Badge>
                    </p>
                  </Col>
                </Row>

                <hr />

                {/* Pricing Tiers */}
                <div className="mb-3">
                  <h5>Select Quality</h5>
                  <div className="d-flex gap-2 flex-wrap">
                    {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                      <Button
                        key={key}
                        variant={selectedTier === key ? 'primary' : 'outline-primary'}
                        onClick={() => {
                          setSelectedTier(key);
                          setDiscountApplied(null);
                        }}
                      >
                        {tier.name} - ${(parseFloat(getBasePrice()) * tier.multiplier).toFixed(2)}
                      </Button>
                    ))}
                  </div>
                  <small className="text-muted mt-1 d-block">
                    {PRICING_TIERS[selectedTier].label}
                  </small>
                </div>

                {/* Quantity */}
                <div className="mb-3">
                  <h5>Quantity</h5>
                  <div className="d-flex align-items-center gap-2" style={{ width: 'fit-content' }}>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      −
                    </Button>
                    <Badge bg="secondary" style={{ fontSize: '1.2rem', padding: '0.5rem 1rem' }}>
                      {quantity}
                    </Badge>
                    <Button
                      variant="outline-secondary"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Price Summary */}
                <Card className="bg-light mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Base Price:</span>
                      <span>${getBasePrice()}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Quality ({PRICING_TIERS[selectedTier].name}):</span>
                      <span>x{PRICING_TIERS[selectedTier].multiplier}</span>
                    </div>
                    {discountApplied && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount ({discountApplied.code}):</span>
                        <span>-{discountApplied.discount}%</span>
                      </div>
                    )}
                    <hr />
                    <div className="d-flex justify-content-between fw-bold fs-5">
                      <span>Total:</span>
                      <span className="text-primary">${getFinalPrice()}</span>
                    </div>
                  </Card.Body>
                </Card>

                {/* Discount Code */}
                <div className="mb-3">
                  <h6>Have a discount code?</h6>
                  <div className="input-group" style={{ maxWidth: '400px' }}>
                    <Form.Control
                      type="text"
                      placeholder="Enter code (try: SW10, MASTER, FORCE, JEDI)"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        setDiscountError('');
                      }}
                      isInvalid={!!discountError}
                    />
                    <Button
                      variant="outline-primary"
                      onClick={applyDiscount}
                      disabled={!discountCode.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {discountError && (
                    <div className="text-danger small mt-1">{discountError}</div>
                  )}
                  {discountApplied && (
                    <Alert variant="success" className="py-1 mt-1 mb-0">
                      Code <strong>{discountApplied.code}</strong> applied!{' '}
                      <Button variant="link" size="sm" className="p-0" onClick={removeDiscount}>
                        Remove
                      </Button>
                    </Alert>
                  )}
                </div>

                <div className="mt-auto">
                  <Button
                    variant="success"
                    size="lg"
                    className="w-100"
                    onClick={handlePurchase}
                  >
                    💳 Buy Now - ${getFinalPrice()}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Purchase Confirmation Modal */}
      <Modal show={showPurchaseModal} onHide={() => setShowPurchaseModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to purchase:</p>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Episode {film.episode_id}: {film.title}</Card.Title>
              <div className="d-flex justify-content-between mt-3">
                <div>
                  <small className="text-muted">Quality:</small>
                  <p className="mb-0 fw-bold">{PRICING_TIERS[selectedTier].name}</p>
                </div>
                <div>
                  <small className="text-muted">Quantity:</small>
                  <p className="mb-0 fw-bold">{quantity}</p>
                </div>
                <div>
                  <small className="text-muted">Total:</small>
                  <p className="mb-0 fw-bold text-primary">${getFinalPrice()}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
          {discountApplied && (
            <Alert variant="success" className="mb-0">
              Discount code <strong>{discountApplied.code}</strong> applied ({discountApplied.discount}% off)
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPurchaseModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={confirmPurchase}>
            Confirm Purchase
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
