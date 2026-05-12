import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import '../styles/Dashboard.css';

interface TicketDetail {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  statusId: number;
  priorityId: number;
  categoryId: number;
  serviceId: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: { firstName: string; lastName: string; email: string };
  status?: { name: string };
  priority?: { name: string };
  category?: { name: string };
  service?: { name: string };
}

const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTicketDetail(parseInt(id!));
      setTicket(data);
      setNewStatus(data.statusId.toString());
    } catch (err: any) {
      setError('Error al cargar ticket: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccessMessage('');
      await apiService.updateTicketStatus(parseInt(id!), parseInt(newStatus));
      setSuccessMessage('Estado actualizado exitosamente');
      setTimeout(() => loadTicket(), 1000);
    } catch (err: any) {
      setError('Error al actualizar estado: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
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

  const getStatusColor = (statusId: number) => {
    const colors: { [key: number]: string } = {
      1: '#FFA500',
      2: '#4169E1',
      3: '#32CD32',
      4: '#808080',
    };
    return colors[statusId] || '#000';
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

  const getPriorityColor = (priorityId: number) => {
    const colors: { [key: number]: string } = {
      1: '#90EE90',
      2: '#FFD700',
      3: '#FF6347',
      4: '#DC143C',
    };
    return colors[priorityId] || '#000';
  };

  const isSupport = user?.role === 'Support' || user?.role === 'Admin';

  if (loading) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="dashboard-container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Ticket no encontrado</p>
          <button onClick={() => navigate('/dashboard')} className="btn-logout">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>SERVICE DESK</h1>
        </div>
        <div className="header-user">
          <span>{user?.firstName} {user?.lastName}</span>
          <button onClick={() => navigate('/dashboard')} className="btn-logout">
            ← Volver
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <nav className="sidebar">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/dashboard" className="active">Mis Tickets</a></li>
            <li><a href="/create-ticket">Crear Ticket</a></li>
            {isSupport && <li><a href="/dashboard">Ver Todos</a></li>}
          </ul>
        </nav>

        <main className="main-content" style={{ padding: '20px' }}>
          <div className="page-title" style={{ marginBottom: '30px' }}>
            <h2>Detalle del Ticket: {ticket.ticketNumber}</h2>
          </div>

          {error && (
            <div style={{
              background: '#ffebee',
              color: '#c62828',
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '4px',
              border: '1px solid #ef5350'
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              background: '#e8f5e9',
              color: '#2e7d32',
              padding: '12px',
              marginBottom: '20px',
              borderRadius: '4px',
              border: '1px solid #66bb6a'
            }}>
              {successMessage}
            </div>
          )}

          <div style={{
            background: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{ticket.title}</h3>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                {ticket.description}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginTop: '20px'
            }}>
              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  Estado:
                </label>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: getStatusColor(ticket.statusId),
                  margin: '5px 0'
                }}>
                  {getStatusLabel(ticket.statusId)}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  Prioridad:
                </label>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: getPriorityColor(ticket.priorityId),
                  margin: '5px 0'
                }}>
                  {getPriorityLabel(ticket.priorityId)}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  Categoría:
                </label>
                <p style={{ margin: '5px 0', color: '#555' }}>
                  {ticket.category?.name || 'No especificada'}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  Servicio:
                </label>
                <p style={{ margin: '5px 0', color: '#555' }}>
                  {ticket.service?.name || 'No especificado'}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  Creado por:
                </label>
                <p style={{ margin: '5px 0', color: '#555' }}>
                  {ticket.createdBy?.firstName} {ticket.createdBy?.lastName}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  Fecha de creación:
                </label>
                <p style={{ margin: '5px 0', color: '#555' }}>
                  {new Date(ticket.createdAt).toLocaleDateString('es-ES')}
                </p>
              </div>

              <div>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                  Última actualización:
                </label>
                <p style={{ margin: '5px 0', color: '#555' }}>
                  {new Date(ticket.updatedAt).toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>

            {isSupport && (
              <div style={{
                marginTop: '30px',
                padding: '20px',
                background: '#fff',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}>
                <h4 style={{ marginTop: '0' }}>Cambiar Estado (Solo Soporte)</h4>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '5px' }}>
                      Nuevo Estado:
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '14px'
                      }}
                      disabled={updating}
                    >
                      <option value="1">Abierto</option>
                      <option value="2">En Proceso</option>
                      <option value="3">Resuelto</option>
                      <option value="4">Cerrado</option>
                    </select>
                  </div>
                  <button
                    onClick={handleStatusChange}
                    disabled={updating || newStatus === ticket.statusId.toString()}
                    style={{
                      padding: '8px 20px',
                      background: updating ? '#ccc' : '#1e3a8a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: updating ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    {updating ? 'Actualizando...' : 'Actualizar Estado'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TicketDetailPage;
