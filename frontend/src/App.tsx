import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateRoom from './pages/CreateRoom';
import JoinRoom from './pages/JoinRoom';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/join" element={<JoinRoom />} />
          <Route path="/lobby/:roomCode" element={<Lobby />} />
          <Route path="/game/:roomCode" element={<Game />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}