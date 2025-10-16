import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Note: Sentry will be added in Module 1 of the workshop
// For now, keep it WITHOUT Sentry to show the "before" state

createRoot(document.getElementById('root')!).render(<App />);
