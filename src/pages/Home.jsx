import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Container,
  Row,
  Col,
  Button,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import { api } from "../services/api";

export default function Home() {
  const navigate = useNavigate();
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Add film to cart and navigate to About
  const quickAddToCart = (film) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const basePrice = (film.episode_id * 12.99).toFixed(2);
      const newItem = {
        ...film,
        quantity: 1,
        tier: 'hd',
        tierName: 'HD',
        price: basePrice
      };
      cart.push(newItem);
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('storage'));
      // Navigate to About page
      navigate('/about');
    } catch (e) {
      console.error('Error adding to cart:', e);
      alert('Failed to add to cart');
    }
  };

  // Mock films to supplement the API data
  const mockFilms = [
    {
      episode_id: 7,
      title: "The Force Awakens",
      opening_crawl: "The galaxy is in turmoil...",
      director: "J.J. Abrams",
      producer: "Kathleen Kennedy, J.J. Abrams, Bryan Burk",
      release_date: "2015-12-18"
    },
    {
      episode_id: 8,
      title: "The Last Jedi",
      opening_crawl: "The FIRST ORDER...",
      director: "Rian Johnson",
      producer: "Ram Bergman, Kathleen Kennedy",
      release_date: "2017-12-15"
    },
    {
      episode_id: 9,
      title: "The Rise of Skywalker",
      opening_crawl: "The dead speak!...",
      director: "J.J. Abrams",
      producer: "Kathleen Kennedy, J.J. Abrams, Michelle Rejwan",
      release_date: "2019-12-20"
    },
    {
      episode_id: 10,
      title: "Rogue One: A Star Wars Story",
      opening_crawl: "War. Rebellion. Hope...",
      director: "Gareth Edwards",
      producer: "Kathleen Kennedy, Allison Shearmur, Simon Emanuel",
      release_date: "2016-12-16"
    },
    {
      episode_id: 11,
      title: "Solo: A Star Wars Story",
      opening_crawl: "In a galaxy where...",
      director: "Ron Howard",
      producer: "Kathleen Kennedy, Allison Shearmur, Simon Emanuel",
      release_date: "2018-05-25"
    },
    {
      episode_id: 12,
      title: "Untitled Star Wars Film",
      opening_crawl: "A new adventure...",
      director: "TBD",
      producer: "Kathleen Kennedy",
      release_date: "Coming Soon"
    }
  ];

  useEffect(() => {
    api
      .getFilms()
      .then((data) => {
        const allFilms = [...data.results, ...mockFilms];
        setFilms(allFilms);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Container fluid className="home px-0">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <Spinner animation="border" variant="primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );

  if (error)
    return (
      <Container fluid className="home px-0">
        <Alert variant="danger" className="m-3">
          <Alert.Heading>Error Loading Films</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );

  return (
    <Container fluid className="home px-0">
      <div className="hero-section text-center py-5">
        <Alert variant="primary" className="welcome-banner mb-4 border-0">
          <div className="d-flex align-items-center justify-content-center">
            <Alert.Heading className="mb-0">
              🎬 Welcome to FilmApp!
            </Alert.Heading>
          </div>
        </Alert>

        <p className="hero-subtitle text-muted">
          Explore the Star Wars universe through iconic films, episode details,
          and behind-the-scenes information
        </p>
      </div>
      <Row>
        {films.map((film, index) => (
          <Col key={film.episode_id} sm={6} md={4} lg={3} className="mb-4">
            <Card className="h-100 film-card">
              <Card.Img
                variant="top"
                src={`https://picsum.photos/seed/film${index + 1}/300/400`}
                alt={film.title}
                className="film-image"
              />
              <Card.Body>
                <Card.Title className="film-name">{film.title}</Card.Title>
                <p className="film-episode">Episode {film.episode_id}</p>
                <Button
                  variant="primary"
                  className="mt-2 w-100"
                  onClick={() => {
                    setSelectedFilm(film);
                    setShowModal(true);
                  }}
                >
                  View Details
                </Button>
                <Button
                  variant="success"
                  className="mt-2 w-100"
                  onClick={() => quickAddToCart(film)}
                >
                  🛒 Add to Cart & Shop
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedFilm?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFilm && (
            <>
              <p>
                <strong>Episode ID:</strong> {selectedFilm.episode_id}
              </p>
              <p>
                <strong>Opening Craw:</strong> {selectedFilm.opening_crawl}
              </p>
              <p>
                <strong>Director:</strong> {selectedFilm.director}
              </p>
              <p>
                <strong>Producer:</strong> {selectedFilm.producer}
              </p>
              <p>
                <strong>Release Date:</strong> {selectedFilm.release_date}
              </p>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
