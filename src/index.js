import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { SpotifyProvider } from './SpotifyContext';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1DB954', // Spotify green
    },
    secondary: {
      main: '#191414', // Spotify black
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SpotifyProvider>
        <App />
      </SpotifyProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
