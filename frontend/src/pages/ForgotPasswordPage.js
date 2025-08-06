// src/pages/ForgotPasswordPage.js

import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', {
        email,
      });
      setMessage(response.data.message);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un error inesperado. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="auth-container"> {/* <--- CAMBIO REALIZADO AQUÍ --- */}
      <h2>Restablecer Contraseña</h2>
      <p>Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Enviar Enlace</button>
      </form>
      {message && <p style={{ color: 'green', marginTop: '15px' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      <div style={{ marginTop: '20px' }}>
        <Link to="/login">Volver a Iniciar Sesión</Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;