# API Integration Documentation

## Environment Configuration

The application is configured to work with the Election Management System API at `http://localhost:8000/api/v1/`.

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user information
- `GET /auth/users/{user_id}` - Get user by ID

### Elections
- `GET /elections/` - Get all elections
- `GET /elections/active` - Get active elections
- `POST /elections/` - Create election (Admin only)
- `GET /elections/{election_id}` - Get election by ID
- `PUT /elections/{election_id}` - Update election (Admin only)
- `POST /elections/{election_id}/activate` - Activate election (Admin only)
- `POST /elections/{election_id}/end` - End election (Admin only)
- `POST /elections/{election_id}/publish-results` - Publish results (Admin only)
- `GET /elections/{election_id}/results` - Get election results
- `GET /elections/{election_id}/votes` - Get election votes (Admin only)
- `POST /elections/{election_id}/vote` - Cast vote

### Candidates
- `POST /elections/{election_id}/candidates` - Add candidate (Admin only)
- `PUT /elections/{election_id}/candidates/{candidate_id}` - Update candidate (Admin only)

## Data Models

### User
```typescript
interface User {
  _id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user';
  is_active: boolean;
  created_at: string;
}
```

### Election
```typescript
interface Election {
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
```

### Candidate
```typescript
interface Candidate {
  _id?: string;
  name: string;
  bio?: string;
  photo_url?: string;
  party?: string;
  position?: string;
}
```

## Usage Examples

### Authentication
```typescript
import { api } from '@/services/apiHelpers';

// Signup
const signupData = {
  email: 'user@example.com',
  full_name: 'John Doe',
  password: 'password123',
  role: 'user'
};
const response = await api.auth.signup(signupData);

// Login
const loginData = {
  email: 'user@example.com',
  password: 'password123'
};
const loginResponse = await api.auth.login(loginData);
```

### Elections
```typescript
// Get all elections
const elections = await api.elections.getAllElections();

// Create election (Admin only)
const electionData = {
  title: 'Student Council Election',
  description: 'Annual student council election',
  start_time: '2024-01-01T00:00:00Z',
  end_time: '2024-01-07T23:59:59Z'
};
const newElection = await api.elections.createElection(electionData);

// Cast vote
const voteData = { candidate_id: 'candidate-id-here' };
const voteResponse = await api.elections.castVote('election-id', voteData);
```

### Candidates
```typescript
// Add candidate with photo
const candidateData = {
  name: 'Jane Smith',
  bio: 'Experienced leader',
  party: 'Student Party',
  position: 'President',
  photo: fileObject // File object from input
};
const response = await api.elections.addCandidate('election-id', candidateData);
```

## Error Handling

All API functions return a response object with the following structure:

```typescript
interface ApiResponse<T> {
  data?: T;
  error?: string;
}
```

Example error handling:
```typescript
const response = await api.elections.getAllElections();
if (response.error) {
  console.error('API Error:', response.error);
  // Handle error
} else {
  console.log('Elections:', response.data);
  // Use data
}
```

## Authentication Flow

1. User signs up or logs in
2. API returns access token
3. Token is stored in localStorage
4. Token is automatically included in subsequent requests
5. Token is validated on app startup
6. User is redirected to login if token is invalid

## File Uploads

For endpoints that accept file uploads (candidate photos), use FormData:

```typescript
const formData = new FormData();
formData.append('name', 'Candidate Name');
formData.append('photo', fileObject);

const response = await api.elections.addCandidate('election-id', {
  name: 'Candidate Name',
  photo: fileObject
});
```

## Status Values

Election status can be one of:
- `draft` - Election is being prepared
- `active` - Election is currently running
- `ended` - Election has ended
- `results_published` - Results have been published

## Backend Requirements

Make sure your backend API server is running on `http://localhost:8000` with the correct CORS configuration to allow requests from the frontend.
