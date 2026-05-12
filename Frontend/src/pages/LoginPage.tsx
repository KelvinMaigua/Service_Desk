import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import '../styles/LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        login(response.user, response.token);
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en el login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.register(email, password, firstName, lastName);
      if (response.success) {
        login(response.user, response.token);
        navigate('/dashboard');
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>SERVICE DESK</h1>
          <p>Gestión de Incidentes de Seguridad</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Correo institucional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Procesando...' : isLogin ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="login-footer">
          {isLogin ? (
            <p>
              ¿No tienes cuenta?{' '}
              <button type="button" onClick={() => setIsLogin(false)}>
                Regístrate aquí
              </button>
            </p>
          ) : (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button type="button" onClick={() => setIsLogin(true)}>
                Inicia sesión aquí
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
