import { useState, useEffect } from "react";
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
  const [films, setFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilm, setSelectedFilm] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api
      .getFilms()
      .then((data) => setFilms(data.results))
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
