import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, Container, Row, Col, Button, Badge, Modal, Alert, Spinner, Form, Dropdown } from "react-bootstrap";
import { api } from "../services/api";
const PRICING_TIERS = {
  sd: { name: "SD", multiplier: 0.8, label: "Standard Definition" },
  hd: { name: "HD", multiplier: 1.0, label: "High Definition" },
  uhd: { name: "4K", multiplier: 1.5, label: "Ultra HD" },
};
export default function About() {
  const location = useLocation();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load cart from localStorage:", e);
      return [];
    }
  });
  const [showCart, setShowCart] = useState(false);
  const [buyMessage, setBuyMessage] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(null);
  const [purchaseNotification, setPurchaseNotification] = useState(null);
  // Show notification if navigated from purchase
  useEffect(() => {
    if (location.state?.justPurchased) {
      setPurchaseNotification({
        filmTitle: location.state.filmTitle,
        quantity: location.state.quantity,
        tierName: location.state.tierName,
        totalPrice: location.state.totalPrice,
      });
    }
  }, [location]);
  // Load films from SWAPI + mock
  useEffect(() => {
    loadFilms();
  }, []);
  const loadFilms = async () => {
    try {
      setLoading(true);
      const data = await api.getFilms();
      const allFilms = [...data.results, ...mockFilms];
      setFilms(allFilms);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  // Mock films to supplement the API data
  const mockFilms = [
    {
      episode_id: 7,
      title: "Inception",
      opening_crawl: "Dreams feel real while we're in them...",
      director: "Christopher Nolan",
      producer: "Emma Thomas, Christopher Nolan",
      release_date: "2010-07-16",
    },
    {
      episode_id: 8,
      title: "The Matrix",
      opening_crawl: "The Matrix is everywhere...",
      director: "The Wachowskis",
      producer: "Joel Silver",
      release_date: "1999-03-24",
    },
    {
      episode_id: 9,
      title: "Interstellar",
      opening_crawl: "Mankind was born on Earth...",
      director: "Christopher Nolan",
      producer: "Emma Thomas, Christopher Nolan",
      release_date: "2014-11-05",
    },
    {
      episode_id: 10,
      title: "The Grand Budapest Hotel",
      opening_crawl: "The world was a lot more fun when it was in black and white...",
      director: "Wes Anderson",
      producer: "Wes Anderson, Scott Rudin, Steven Rales",
      release_date: "2014-02-27",
    },
    {
      episode_id: 11,
      title: "Mad Max: Fury Road",
      opening_crawl: "The desert claims many things...",
      director: "George Miller",
      producer: "Doug Mitchell, George Miller",
      release_date: "2015-05-15",
    },
    {
      episode_id: 12,
      title: "Everything Everywhere All at Once",
      opening_crawl: "You are not special...",
      director: " Daniels",
      producer: "Anthony and Joe Russo, Jonathan Wang",
      release_date: "2022-03-25",
    },
    {
      episode_id: 13,
      title: "Parasite",
      opening_crawl: "Plan the dish on your own...",
      director: "Bong Joon-ho",
      producer: "Bong Joon-ho, Kwak Sin-ae, Moon Yang-kwon",
      release_date: "2019-05-30",
    },
    {
      episode_id: 14,
      title: "The Shawshank Redemption",
      opening_crawl: "I don't know if these words are for you or for me...",
      director: "Frank Darabont",
      producer: "Frank Darabont, Niki Marvin",
      release_date: "1994-09-23",
    },
    {
      episode_id: 15,
      title: "Pulp Fiction",
      opening_crawl: "You know how they say 'Everything's a copycat'?",
      director: "Quentin Tarantino",
      producer: "Lawrence Bender, Danny DeVito, Michael Shamberg, Stacey Sher, Richard N. Gladstein, Peter MacGregor-Scott",
      release_date: "1994-09-10",
    },
    {
      episode_id: 16,
      title: "The Godfather",
      opening_crawl: "I believe in America...",
      director: "Francis Ford Coppola",
      producer: "Albert S. Ruddy",
      release_date: "1972-03-24",
    },
    {
      episode_id: 17,
      title: "Blade Runner 2049",
      opening_crawl: "You newer models are happy to be the one that's free...",
      director: "Denis Villeneuve",
      producer: "Ridley Scott, Andrew A. Kosove, Broderick Johnson, Cynthia Sikes Yorkin",
      release_date: "2017-10-06",
    },
    {
      episode_id: 18,
      title: "Get Out",
      opening_crawl: "Just because you're invited somewhere doesn't mean you're wanted...",
      director: "Jordan Peele",
      producer: "Jason Blum, Sean McKittrick, Edward H. Hamm Jr., Jordan Peele, Win Rosenfeld",
      release_date: "2017-02-24",
    },
  ];
  // Generate base price for film
  const getBasePrice = (filmId) => {
    return (filmId * 12.99).toFixed(2);
  };
  // Add to cart with tier selection
  const addToCart = (film, tier = "hd", quantity = 1) => {
    setCart((prev) => {
      try {
        const existing = prev.find((item) => item.episode_id === film.episode_id && item.tier === tier);
        let newCart;
        if (existing) {
          newCart = prev.map((item) => (item.episode_id === film.episode_id && item.tier === tier ? { ...item, quantity: item.quantity + quantity } : item));
        } else {
          newCart = [
            ...prev,
            {
              ...film,
              quantity,
              tier,
              tierName: PRICING_TIERS[tier].name,
              price: (parseFloat(getBasePrice(film.episode_id)) * PRICING_TIERS[tier].multiplier).toFixed(2),
            },
          ];
        }
        localStorage.setItem("cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("storage"));
        return newCart;
      } catch (e) {
        console.error("Error in addToCart:", e);
        alert("Failed to add to cart");
        return prev;
      }
    });
  };
  // Remove from cart
  const removeFromCart = (index) => {
    setCart((prev) => {
      const newCart = prev.filter((_, i) => i !== index);
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("storage"));
      return newCart;
    });
  };
  // Update quantity
  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const newCart = prev.map((item, i) => {
        if (i === index) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      localStorage.setItem("cart", JSON.stringify(newCart));
      window.dispatchEvent(new Event("storage"));
      return newCart;
    });
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
    setDiscountError("");
    const codes = {
      SW10: 10,
      MASTER: 25,
      FORCE: 15,
      JEDI: 20,
    };
    const code = discountCode.toUpperCase().trim();
    if (codes[code]) {
      setDiscountApplied({ code, discount: codes[code] });
    } else {
      setDiscountError("Invalid discount code");
    }
  };
  return (
    <Container fluid className="about px-0">
      {/* Header */}
      <div className="hero-section text-center py-5">
        <Alert variant="primary" className="welcome-banner mb-4 border-0">
          <div className="d-flex align-items-center justify-content-center">
            <Alert.Heading className="mb-0">🎬 Shop</Alert.Heading>
          </div>
        </Alert>
        <p className="hero-subtitle text-muted">Own the Star Wars saga on digital!</p>
      </div>
      <Container className="my-4">
        {/* Purchase Success Notification */}
        {purchaseNotification && (
          <Alert variant="success" dismissible onClose={() => setPurchaseNotification(null)} className="mb-3">
            <Alert.Heading>Purchase Successful!</Alert.Heading>
            <p>
              You've purchased {purchaseNotification.quantity}x "{purchaseNotification.filmTitle}" ({purchaseNotification.tierName}) for ${purchaseNotification.totalPrice}. It's in your cart!
            </p>
          </Alert>
        )}
        {/* Cart Button */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <strong>Available Films:</strong> {films.length}
          </div>
          <Button variant="outline-primary" onClick={() => setShowCart(true)} className="position-relative">
            🛒 Cart
            {getTotalItems() > 0 && (
              <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        </div>
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading films...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <Row xs={1} md={2} lg={3} xl={4} className="g-4">
            {films.map((film) => (
              <Col key={film.episode_id}>
                <Card className="h-100 film-card shadow-sm">
                  <Link to={`/film/${film.episode_id}`} className="text-decoration-none">
                    <Card.Img variant="top" src={`https://picsum.photos/seed/starwars${film.episode_id}/300/400`} alt={film.title} style={{ height: "300px", objectFit: "cover", cursor: "pointer" }} />
                  </Link>
                  <Card.Body className="d-flex flex-column">
                    <div className="flex-grow-1">
                      <Link to={`/film/${film.episode_id}`} className="text-decoration-none text-dark">
                        <Card.Title className="text-truncate" title={film.title} style={{ cursor: "pointer" }}>
                          Episode {film.episode_id}: {film.title}
                        </Card.Title>
                      </Link>
                      <Card.Text className="small text-muted mb-1">
                        <strong>Director:</strong> {film.director}
                      </Card.Text>
                      <Card.Text className="small text-muted mb-2">
                        <strong>Released:</strong> {film.release_date}
                      </Card.Text>
                      {/* Quality Selector Dropdown */}
                      <div className="mb-2">
                        <small className="text-muted">Select Quality:</small>
                        <Dropdown className="w-100">
                          <Dropdown.Toggle variant="outline-secondary" size="sm" className="w-100 text-start">
                            <span id="selected-quality">HD - ${(parseFloat(getBasePrice(film.episode_id)) * PRICING_TIERS.hd.multiplier).toFixed(2)}</span>
                          </Dropdown.Toggle>
                          <Dropdown.Menu className="w-100">
                            {Object.entries(PRICING_TIERS).map(([key, tier]) => (
                              <Dropdown.Item
                                key={key}
                                onClick={() => addToCart(film, key, 1)}
                              >
                                <div className="d-flex justify-content-between align-items-center">
                                  <span>{tier.name}</span>
                                  <span className="text-muted">${(parseFloat(getBasePrice(film.episode_id)) * tier.multiplier).toFixed(2)}</span>
                                </div>
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
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
                        onClick={() => {
                          // Direct purchase: add default HD quantity 1, then direct to details to customize
                          addToCart(film, "hd", 1);
                          alert(`Added "${film.title}" to cart!`);
                        }}
                      >
                        💳 Quick Add to Cart
                      </Button>
                      <Link to={`/film/${film.episode_id}`} className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center">
                        📄 View Details
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
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
                    setDiscountError("");
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
                      <Button
                        variant="link"
                        size="sm"
                        className="text-white ms-2 p-0"
                        onClick={() => {
                          setDiscountApplied(null);
                          setDiscountCode("");
                        }}
                      >
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
                  {discountApplied && <small className="text-success">You saved: ${(parseFloat(getTotal()) / (1 - discountApplied.discount / 100) - parseFloat(getTotal())).toFixed(2)}</small>}
                </div>
              </div>
              <div className="cart-items" style={{ maxHeight: "400px", overflowY: "auto" }}>
                {cart.map((item, index) => (
                  <div key={`${item.episode_id}-${item.tier}`} className="border-bottom py-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">
                          <Link to={`/film/${item.episode_id}`} className="text-start text-dark" onClick={() => setShowCart(false)} style={{ textDecoration: "none" }}>
                            Episode {item.episode_id}: {item.title}
                          </Link>
                        </h6>
                        <p className="small text-muted mb-1">
                          Quality: <Badge bg="secondary">{item.tierName}</Badge> | ${item.price} each
                        </p>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={() => updateQuantity(index, -1)} disabled={item.quantity <= 1}>
                          −
                        </Button>
                        <span className="mx-2">{item.quantity}</span>
                        <Button variant="outline-secondary" size="sm" onClick={() => updateQuantity(index, 1)}>
                          +
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => removeFromCart(index)} className="ms-2">
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
                localStorage.removeItem("cart");
                setCart([]);
                setDiscountApplied(null);
                setDiscountCode("");
                setShowCart(false);
                window.dispatchEvent(new Event("storage"));
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
