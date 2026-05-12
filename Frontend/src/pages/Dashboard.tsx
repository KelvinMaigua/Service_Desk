import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import '../styles/Dashboard.css';

interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  statusId: number;
  priorityId: number;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyTickets();
      setTickets(data);
      calculateStats(data);
    } catch (err: any) {
      setError('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (ticketsList: Ticket[]) => {
    const stats = {
      total: ticketsList.length,
      open: ticketsList.filter((t) => t.statusId === 1).length,
      inProgress: ticketsList.filter((t) => t.statusId === 2).length,
      resolved: ticketsList.filter((t) => t.statusId === 3).length,
      closed: ticketsList.filter((t) => t.statusId === 4).length,
    };
    setStats(stats);
  };

  const handleLogout = () => {
    logout();
    apiService.clearToken();
    navigate('/');
  };

  const getStatusLabel = (statusId: number) => {
    const statuses: { [key: number]: string } = {
      1: 'Abierto',
      2: 'En Proceso',
      3: 'Resuelto',
      4: 'Cerrado',
    };
    return statuses[statusId] || 'Desconocido';
  };

  const getPriorityLabel = (priorityId: number) => {
    const priorities: { [key: number]: string } = {
      1: 'Baja',
      2: 'Media',
      3: 'Alta',
      4: 'Crítica',
    };
    return priorities[priorityId] || 'Desconocida';
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
            <li><a href="/dashboard" className="active">Dashboard</a></li>
            <li><a href="/my-tickets">Mis Tickets</a></li>
            <li><a href="/create-ticket">Crear Ticket</a></li>
            {user?.role === 'Support' && <li><a href="/support">Ver Todos</a></li>}
          </ul>
        </nav>

        <main className="main-content">
          <div className="page-title">
            <h2>Dashboard</h2>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Mis Tickets</h3>
              <p className="stat-number">{stats.total}</p>
              <a href="/my-tickets">Ver detalles</a>
            </div>
            <div className="stat-card">
              <h3>Abiertos</h3>
              <p className="stat-number">{stats.open}</p>
            </div>
            <div className="stat-card">
              <h3>En Proceso</h3>
              <p className="stat-number">{stats.inProgress}</p>
            </div>
            <div className="stat-card">
              <h3>Resueltos</h3>
              <p className="stat-number">{stats.resolved}</p>
            </div>
          </div>

          <div className="recent-tickets">
            <h3>Tickets Recientes</h3>
            {loading && <p>Cargando...</p>}
            {error && <div className="error-message">{error}</div>}
            {!loading && tickets.length === 0 && <p>No tienes tickets aún</p>}
            {!loading && tickets.length > 0 && (
              <table className="tickets-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Estado</th>
                    <th>Prioridad</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.slice(0, 5).map((ticket) => (
                    <tr key={ticket.id}>
                      <td>{ticket.ticketNumber}</td>
                      <td>{ticket.title}</td>
                      <td>{getStatusLabel(ticket.statusId)}</td>
                      <td>{getPriorityLabel(ticket.priorityId)}</td>
                      <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button onClick={() => navigate(`/tickets/${ticket.id}`)} className="btn-view">
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <button onClick={() => navigate('/create-ticket')} className="btn-create">
            + Crear Nuevo Ticket
          </button>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
