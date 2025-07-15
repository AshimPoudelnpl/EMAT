import { apiService, endpoints } from './api';
import type {
  User,
  UserCreate,
  UserLogin,
  Token,
  Election,
  ElectionCreate,
  ElectionUpdate,
  ElectionResults,
  Candidate,
  CandidateCreate,
  CandidateUpdate,
  Vote,
  VoteResponse,
  HealthResponse,
  Student,
  StudentCreate,
  StudentUpdate,
  StudentResponse,
  BulkStudentCreate,
  StudentValidationResponse,
} from '../types';

// Authentication API functions
export const authApi = {
  async signup(userData: UserCreate) {
    return apiService.post<User>(endpoints.auth.signup, userData);
  },

  async login(credentials: UserLogin) {
    return apiService.post<Token>(endpoints.auth.login, credentials);
  },

  async getMe() {
    return apiService.get<User>(endpoints.auth.me);
  },

  async getUser(userId: string) {
    return apiService.get<User>(endpoints.auth.user(userId));
  },
};

// Elections API functions
export const electionsApi = {
  async getAllElections() {
    return apiService.get<Election[]>(endpoints.elections.list);
  },

  async getActiveElections() {
    return apiService.get<Election[]>(endpoints.elections.active);
  },

  async getElection(electionId: string) {
    return apiService.get<Election>(endpoints.elections.get(electionId));
  },

  async createElection(electionData: ElectionCreate) {
    console.log('Creating election with endpoint:', endpoints.elections.create);
    console.log('Full endpoint URL will be:', apiService['baseURL'] + endpoints.elections.create);
    return apiService.post<Election>(endpoints.elections.create, electionData);
  },

  async updateElection(electionId: string, updateData: ElectionUpdate) {
    return apiService.put<Election>(endpoints.elections.update(electionId), updateData);
  },

  async activateElection(electionId: string) {
    return apiService.post<Election>(endpoints.elections.activate(electionId));
  },

  async endElection(electionId: string) {
    return apiService.post<Election>(endpoints.elections.end(electionId));
  },

  async publishResults(electionId: string) {
    return apiService.post<Election>(endpoints.elections.publishResults(electionId));
  },

  async getResults(electionId: string) {
    return apiService.get<ElectionResults>(endpoints.elections.results(electionId));
  },

  async getVotes(electionId: string) {
    return apiService.get<unknown[]>(endpoints.elections.votes(electionId));
  },

  async castVote(electionId: string, voteData: Vote) {
    return apiService.post<VoteResponse>(endpoints.elections.vote(electionId), voteData);
  },

  async addCandidate(electionId: string, candidateData: CandidateCreate) {
    const formData = new FormData();
    
    formData.append('name', candidateData.name);
    if (candidateData.bio) formData.append('bio', candidateData.bio);
    if (candidateData.party) formData.append('party', candidateData.party);
    if (candidateData.position) formData.append('position', candidateData.position);
    if (candidateData.photo) formData.append('photo', candidateData.photo);

    return apiService.uploadFormData<Election>(
      endpoints.candidates.add(electionId),
      formData
    );
  },

  async updateCandidate(
    electionId: string,
    candidateId: string,
    updateData: CandidateUpdate
  ) {
    const formData = new FormData();
    
    if (updateData.name) formData.append('name', updateData.name);
    if (updateData.bio) formData.append('bio', updateData.bio);
    if (updateData.party) formData.append('party', updateData.party);
    if (updateData.position) formData.append('position', updateData.position);
    if (updateData.photo) formData.append('photo', updateData.photo);

    return apiService.putFormData<Election>(
      endpoints.candidates.update(electionId, candidateId),
      formData
    );
  },
};

// Health check functions
export const healthApi = {
  async checkHealth() {
    return apiService.get<HealthResponse>(endpoints.health);
  },

  async getRoot() {
    return apiService.get<HealthResponse>(endpoints.root);
  },
};

// Students API functions
export const studentsApi = {
  async getAllStudents(skip: number = 0, limit: number = 100, search?: string) {
    let endpoint = `${endpoints.students.list}?skip=${skip}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    return apiService.get<StudentResponse[]>(endpoint);
  },

  async getStudent(studentId: string) {
    return apiService.get<StudentResponse>(endpoints.students.get(studentId));
  },

  async createStudent(studentData: StudentCreate) {
    return apiService.post<StudentResponse>(endpoints.students.create, studentData);
  },

  async updateStudent(studentId: string, updateData: StudentUpdate) {
    return apiService.put<StudentResponse>(endpoints.students.update(studentId), updateData);
  },

  async deleteStudent(studentId: string) {
    return apiService.delete<{ message: string }>(endpoints.students.delete(studentId));
  },

  async bulkCreateStudents(studentsData: BulkStudentCreate) {
    return apiService.post<{ message: string; created: number; errors: string[] }>(
      endpoints.students.bulk,
      studentsData
    );
  },

  async uploadStudentsCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiService.uploadFormData<{ 
      message: string; 
      created: number; 
      errors: string[] 
    }>(endpoints.students.uploadCsv, formData);
  },

  async getStudentsCount() {
    return apiService.get<{ count: number }>(endpoints.students.count);
  },

  async validateStudentId(studentId: string) {
    return apiService.get<StudentValidationResponse>(endpoints.students.validate(studentId));
  },
};

// Export all APIs
export const api = {
  auth: authApi,
  elections: electionsApi,
  health: healthApi,
  students: studentsApi,
};

export default api;
