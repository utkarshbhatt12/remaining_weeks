import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize dark mode based on system preference
const prefersDarkMode =
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;
if (prefersDarkMode) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

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
