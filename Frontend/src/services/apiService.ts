import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://localhost:5182/api';

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar token a cada request
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Restaurar token del localStorage si existe
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      this.token = savedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async register(email: string, password: string, firstName: string, lastName: string) {
    const response = await this.api.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    if (response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  // Tickets endpoints
  async getMyTickets() {
    const response = await this.api.get('/tickets/me');
    return response.data;
  }

  async getAllTickets() {
    const response = await this.api.get('/tickets/all');
    return response.data;
  }

  async getTicketDetail(id: number) {
    const response = await this.api.get(`/tickets/${id}`);
    return response.data;
  }

  async createTicket(data: {
    title: string;
    description: string;
    categoryId: number;
    serviceId: number;
    priorityId: number;
  }) {
    const response = await this.api.post('/tickets', data);
    return response.data;
  }

  async updateTicketStatus(id: number, statusId: number) {
    const response = await this.api.patch(`/tickets/${id}/status`, { statusId });
    return response.data;
  }

  // Categories endpoint
  async getCategories() {
    const response = await this.api.get('/categories');
    return response.data;
  }

  // Services endpoints
  async getServices() {
    const response = await this.api.get('/services');
    return response.data;
  }

  async getServicesByCategory(categoryId: number) {
    const response = await this.api.get(`/services/by-category/${categoryId}`);
    return response.data;
  }
}

export default new ApiService();
