import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';

xit('renders without crashing', () => {
  const div = document.createElement('div');
  createRoot(div).render(<App />);
});
