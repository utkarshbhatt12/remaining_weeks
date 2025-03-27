import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Force dark mode
document.documentElement.classList.add('dark');
document.body.classList.add('dark');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root');

  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } else {
    console.error('Root element not found');
  }
});
