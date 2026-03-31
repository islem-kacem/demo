import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import FilmDetails from './pages/FilmDetails';
import Users from './pages/Users';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <main className="main-content pt-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/film/:id" element={<FilmDetails />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </main>
    </>
  );
}

export default App;