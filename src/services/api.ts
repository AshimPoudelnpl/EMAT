/**
 * API service for FastAPI backend integration
 * Base URL: http://localhost:8000/api/v1/
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage if it exists
    this.token = localStorage.getItem('election_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('election_token', token);
    } else {
      localStorage.removeItem('election_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    console.log(`Making ${options.method || 'GET'} request to:`, url);
    console.log('Request options:', options);
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('Using auth token:', this.token.substring(0, 20) + '...');
    } else {
      console.log('No auth token available');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers));

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        const error = data.message || data.detail || 'An error occurred';
        console.error('API Error:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Network error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }

  // File upload with multipart/form-data
  async uploadFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || data.detail || 'Upload failed',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Upload error',
      };
    }
  }

  // PUT request with multipart/form-data
  async putFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: formData,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.message || data.detail || 'Update failed',
        };
      }

      return { data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Update error',
      };
    }
  }
}

export const apiService = new ApiService(API_BASE_URL);

// API endpoint helpers based on OpenAPI specification
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    me: '/auth/me',
    user: (userId: string) => `/auth/users/${userId}`,
  },
  // Elections
  elections: {
    list: '/elections/',
    active: '/elections/active',
    create: '/elections/',
    get: (id: string) => `/elections/${id}`,
    update: (id: string) => `/elections/${id}`,
    activate: (id: string) => `/elections/${id}/activate`,
    end: (id: string) => `/elections/${id}/end`,
    publishResults: (id: string) => `/elections/${id}/publish-results`,
    results: (id: string) => `/elections/${id}/results`,
    votes: (id: string) => `/elections/${id}/votes`,
    vote: (id: string) => `/elections/${id}/vote`,
  },
  // Candidates
  candidates: {
    add: (electionId: string) => `/elections/${electionId}/candidates`,
    update: (electionId: string, candidateId: string) => `/elections/${electionId}/candidates/${candidateId}`,
  },
  // Health checks
  health: '/health',
  root: '/',
  // Students
  students: {
    list: '/students/',
    create: '/students/',
    bulk: '/students/bulk',
    uploadCsv: '/students/upload-csv',
    count: '/students/count',
    get: (id: string) => `/students/${id}`,
    update: (id: string) => `/students/${id}`,
    delete: (id: string) => `/students/${id}`,
    validate: (studentId: string) => `/students/validate/${studentId}`,
  },
} as const;