export interface SetupPasswordRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  admin: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
}