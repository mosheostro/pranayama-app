<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
=======
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PremiumMeditationApp from './PremiumMeditationApp.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PremiumMeditationApp />
  </StrictMode>,
);
>>>>>>> 1343771 (sync local project with GitHub)
