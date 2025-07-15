// User types based on OpenAPI schema
export interface User {
  _id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}

export interface UserCreate {
  email: string;
  full_name: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UserLogin {
  email: string;
  password: string;
}

// Election types based on OpenAPI schema
export interface Election {
  _id: string;
  title: string;
  description?: string;
  candidates: Candidate[];
  status: 'draft' | 'active' | 'ended' | 'results_published';
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
  total_votes: number;
}

export interface ElectionCreate {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface ElectionUpdate {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  status?: 'draft' | 'active' | 'ended' | 'results_published';
}

// Candidate types based on OpenAPI schema
export interface Candidate {
  _id?: string;
  name: string;
  bio?: string;
  photo_url?: string;
  party?: string;
  position?: string;
}

export interface CandidateCreate {
  name: string;
  bio?: string;
  party?: string;
  position?: string;
  photo?: File;
}

export interface CandidateUpdate {
  name?: string;
  bio?: string;
  party?: string;
  position?: string;
  photo?: File;
}

// Vote types based on OpenAPI schema
export interface Vote {
  candidate_id: string;
}

export interface VoteResponse {
  message: string;
}

export interface ElectionResults {
  election_id: string;
  election_title: string;
  total_votes: number;
  candidates: unknown[];
  status: 'draft' | 'active' | 'ended' | 'results_published';
  end_time: string;
}

// Health check types
export interface HealthResponse {
  status: string;
  message?: string;
}

// Token type
export interface Token {
  access_token: string;
  token_type: string;
}

// Legacy interfaces for backward compatibility
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  role?: 'admin' | 'user';
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export interface CreateElectionRequest {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

export interface CreateCandidateRequest {
  name: string;
  bio?: string;
  party?: string;
  position?: string;
}

export interface CastVoteRequest {
  candidate_id: string;
}

// Student types based on OpenAPI schema
export interface Student {
  _id: string;
  student_id: string;
  full_name: string;
  email?: string;
  program?: string;
  year?: number;
  is_active: boolean;
  created_at: string;
}

export interface StudentCreate {
  student_id: string;
  full_name: string;
  email?: string;
  program?: string;
  year?: number;
}

export interface StudentUpdate {
  student_id?: string;
  full_name?: string;
  email?: string;
  program?: string;
  year?: number;
  is_active?: boolean;
}

export interface StudentResponse {
  _id: string;
  student_id: string;
  full_name: string;
  email?: string;
  program?: string;
  year?: number;
  is_active: boolean;
  created_at: string;
}

export interface BulkStudentCreate {
  students: StudentCreate[];
}

export interface StudentValidationResponse {
  is_valid: boolean;
  student?: StudentResponse;
  message: string;
}