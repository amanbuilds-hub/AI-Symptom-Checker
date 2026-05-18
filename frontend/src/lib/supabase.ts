// API configuration for custom backend
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem("auth_token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || "Request failed" };
      }

      return { data, message: data.message };
    } catch (error) {
      console.error("API request failed:", error);
      return { error: "Network error" };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Auth API functions
export const authAPI = {
  signUp: async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    age?: number;
    gender?: string;
    language?: string;
    location?: string;
    role?: string;
  }) => {
    const response = await apiClient.post("/auth/signup", userData);
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  signIn: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/signin", { email, password });
    if (response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    return response;
  },

  signOut: async () => {
    const response = await apiClient.post("/auth/signout");
    apiClient.setToken(null);
    return response;
  },

  getCurrentUser: async () => {
    return apiClient.get("/auth/me");
  },

  updateProfile: async (userData: any) => {
    return apiClient.put("/auth/profile", userData);
  },
};

// Appointments API functions
export const appointmentsAPI = {
  create: async (appointmentData: {
    doctor_id: string;
    scheduled_at: string;
    notes?: string;
    symptoms?: string[];
    customer_id?: string;
  }) => {
    return apiClient.post("/appointments", appointmentData);
  },

  getAll: async () => {
    return apiClient.get("/appointments");
  },

  getById: async (id: string) => {
    return apiClient.get(`/appointments/${id}`);
  },

  update: async (id: string, data: { status?: string; notes?: string }) => {
    return apiClient.put(`/appointments/${id}`, data);
  },

  cancel: async (id: string) => {
    return apiClient.delete(`/appointments/${id}`);
  },
};

// Doctors API functions
export const doctorsAPI = {
  getAll: async (params?: { available?: boolean; specialization?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.available !== undefined) {
      queryParams.append("available", String(params.available));
    }
    if (params?.specialization) {
      queryParams.append("specialization", params.specialization);
    }
    const queryString = queryParams.toString();
    return apiClient.get(
      `/doctors${queryString ? `?${queryString}` : ""}`
    );
  },

  getById: async (id: string) => {
    return apiClient.get(`/doctors/${id}`);
  },

  create: async (doctorData: {
    name: string;
    specialization: string;
    experience?: string;
    languages?: string[];
    consultation_fee?: number;
  }) => {
    return apiClient.post("/doctors", doctorData);
  },

  update: async (id: string, data: { available?: boolean; rating?: number }) => {
    return apiClient.put(`/doctors/${id}`, data);
  },

  delete: async (id: string) => {
    return apiClient.delete(`/doctors/${id}`);
  },
};

// Health Records API functions
export const healthRecordsAPI = {
  getAll: async () => {
    return apiClient.get("/health-records");
  },

  create: async (recordData: {
    title: string;
    type: 'consultation' | 'symptom_check' | 'prescription' | 'lab_report';
    description?: string;
    data?: any;
    attachments?: string[];
  }) => {
    return apiClient.post("/health-records", recordData);
  },

  getMetrics: async () => {
    return apiClient.get("/health-records/metrics");
  },

  getPatientMetrics: async (patientId: string) => {
    return apiClient.get(`/health-records/metrics/${patientId}`);
  },

  updatePatientMetrics: async (patientId: string, metricsData: {
    blood_pressure?: string;
    heart_rate?: string;
    weight?: string;
    last_checkup?: string;
  }) => {
    return apiClient.post(`/health-records/metrics/${patientId}`, metricsData);
  },

  getPatientHealthRecords: async (patientId: string) => {
    return apiClient.get(`/health-records/patient/${patientId}`);
  },

  createPatientHealthRecord: async (patientId: string, recordData: {
    title: string;
    type: 'consultation' | 'symptom_check' | 'prescription' | 'lab_report';
    description?: string;
    data?: any;
    attachments?: string[];
  }) => {
    return apiClient.post(`/health-records/patient/${patientId}`, recordData);
  }
};

// Messages API functions
export const messagesAPI = {
  getConversations: async () => {
    return apiClient.get("/messages/conversations");
  },

  getMessages: async (consultationId: string) => {
    return apiClient.get(`/messages/consultation/${consultationId}`);
  },

  sendMessage: async (consultationId: string, content: string, messageType: 'text' | 'image' | 'file' = 'text') => {
    return apiClient.post(`/messages/consultation/${consultationId}`, { content, message_type: messageType });
  }
};

// Utility functions for backward compatibility
export const getCurrentUser = async () => {
  const response = await authAPI.getCurrentUser();
  return response.data?.user || null;
};

export const getCurrentSession = async () => {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  const user = await getCurrentUser();
  return user ? { user, access_token: token } : null;
};

// Initialize token from localStorage on app start
const storedToken = localStorage.getItem("auth_token");
if (storedToken) {
  apiClient.setToken(storedToken);
}
