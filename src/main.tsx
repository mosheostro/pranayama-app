import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PremiumMeditationApp from './PremiumMeditationApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PremiumMeditationApp />
  </StrictMode>,
);
