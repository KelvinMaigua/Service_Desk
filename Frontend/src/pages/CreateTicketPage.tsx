import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import '../styles/Dashboard.css';

interface Category {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  categoryId: number;
}

const CreateTicketPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [priorityId, setPriorityId] = useState('2');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryId) {
      loadServices(parseInt(categoryId));
    }
  }, [categoryId]);

  const loadCategories = async () => {
    try {
      const data = await apiService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError('Error al cargar categorías');
    }
  };

  const loadServices = async (catId: number) => {
    try {
      const data = await apiService.getServicesByCategory(catId);
      setServices(data);
      setServiceId('');
    } catch (err: any) {
      setError('Error al cargar servicios');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiService.createTicket({
        title,
        description,
        categoryId: parseInt(categoryId),
        serviceId: parseInt(serviceId),
        priorityId: parseInt(priorityId),
      });

      setSuccess('¡Ticket creado exitosamente!');
      setTitle('');
      setDescription('');
      setCategoryId('');
      setServiceId('');
      setPriorityId('2');

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear el ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    apiService.clearToken();
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>SERVICE DESK</h1>
        </div>
        <div className="header-user">
          <span>{user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className="btn-logout">Cerrar sesión</button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="sidebar">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/my-tickets">Mis Tickets</a></li>
            <li><a href="/create-ticket" className="active">Crear Ticket</a></li>
            {user?.role === 'Support' && <li><a href="/support">Ver Todos</a></li>}
          </ul>
        </nav>

        <main className="main-content">
          <div className="page-title">
            <h2>Crear Nuevo Ticket</h2>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form className="ticket-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Información del Ticket</h3>

              <div className="form-group">
                <label htmlFor="category">Categoría de Servicio *</label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="service">Servicio *</label>
                <select
                  id="service"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title">Título del Problema *</label>
                <input
                  id="title"
                  type="text"
                  placeholder="Ingresa el título del problema"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción *</label>
                <textarea
                  id="description"
                  placeholder="Describe el problema con el mayor detalle posible"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Prioridad *</label>
                <select
                  id="priority"
                  value={priorityId}
                  onChange={(e) => setPriorityId(e.target.value)}
                >
                  <option value="1">Baja</option>
                  <option value="2">Media</option>
                  <option value="3">Alta</option>
                  <option value="4">Crítica</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Ticket'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
                Cancelar
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default CreateTicketPage;
