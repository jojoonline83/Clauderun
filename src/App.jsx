import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import BottomNav from './components/BottomNav';
import XPNotification from './components/XPNotification';
import Home from './pages/Home';
import Oral from './pages/Oral';
import Composition from './pages/Composition';
import Listening from './pages/Listening';
import Profile from './pages/Profile';

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="relative">
          <XPNotification />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/oral" element={<Oral />} />
            <Route path="/composition" element={<Composition />} />
            <Route path="/listening" element={<Listening />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </GameProvider>
  );
}
