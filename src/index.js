import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './Decorations.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import ('bootstrap/dist/css/bootstrap.min.css');
import ('bootstrap/dist/js/bootstrap.min.js');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
