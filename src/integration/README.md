# API Integration Structure

This directory contains the client-side API integration code. All API calls go through Next.js API routes (`src/app/api`) which act as a secure proxy layer.

## Structure

```
src/integration/
├── config.ts              # Axios instances and API configuration
├── utils.ts               # API utility functions
├── auth/
│   ├── doctor/           # Doctor authentication module
│   │   ├── types.ts      # TypeScript types
│   │   ├── endpoints.ts  # Endpoint constants
│   │   ├── api-functions.ts  # API call functions
│   │   ├── mutations.ts  # React Query mutations
│   │   ├── queries/      # Individual query hooks
│   │   └── index.ts      # Barrel exports
│   ├── health-assistant/ # Health assistant module (same structure)
│   └── patient/          # Patient module (same structure)
└── index.ts              # Main barrel export
```

## Usage Examples

### Using Mutations (Write Operations)

```typescript
import { useLoginDoctor } from '@/integration/auth/doctor';

function LoginForm() {
  const loginMutation = useLoginDoctor({
    onSuccess: (data) => {
      console.log('Logged in:', data.user);
      // Redirect or update UI
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });

  const handleSubmit = (data: DoctorLoginRequest) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
```

### Using Queries (Read Operations)

```typescript
import { useDoctorSession } from '@/integration/auth/doctor';

function Dashboard() {
  const { data, isLoading, error } = useDoctorSession();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No session</div>;

  return <div>Welcome, {data.user.firstName}!</div>;
}
```

### Using API Functions Directly

```typescript
import { loginDoctor } from '@/integration/auth/doctor';
import { extractResponseData, getErrorMessage } from '@/integration/utils';

async function handleLogin(email: string, password: string) {
  try {
    const response = await loginDoctor({ email, password });
    const data = extractResponseData(response);
    console.log('Login successful:', data.user);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Login failed:', message);
  }
}
```

### Using Constants

```typescript
import { DOCTOR_ENDPOINTS } from '@/integration/auth/doctor';

// All endpoints are constants - no string literals!
const loginUrl = DOCTOR_ENDPOINTS.LOGIN; // '/api/auth/doctor/login'
```

## Key Features

### Type Safety

- All API calls are fully typed with TypeScript
- Branded types for IDs prevent mixing different ID types
- Const assertions ensure endpoint strings are never mistyped

### Security

- All backend API calls go through Next.js API routes
- Tokens stored in httpOnly cookies (never exposed to client)
- API base URL never exposed to client-side code

### React Query Integration

- Mutations for write operations (login, register, etc.)
- Queries for read operations (session, etc.)
- Automatic caching and refetching
- Optimistic updates support

### Error Handling

- Centralized error handling utilities
- Type-safe error responses
- Validation error extraction

## Constants Usage

**Always import constants instead of typing strings:**

```typescript
// ✅ Good
import { DOCTOR_ENDPOINTS } from '@/integration/auth/doctor';
const url = DOCTOR_ENDPOINTS.LOGIN;

// ❌ Bad
const url = '/api/auth/doctor/login'; // Don't do this!
```

## Module Organization

Each module (doctor, health-assistant, patient) follows the same structure:

1. **types.ts** - All TypeScript types and interfaces
2. **endpoints.ts** - Endpoint path constants
3. **api-functions.ts** - Functions that call Next.js API routes
4. **mutations.ts** - React Query mutation hooks
5. **queries/** - Individual query hook files (one per query)

## Next.js API Routes

The API routes in `src/app/api` act as a secure proxy:

- Receive requests from client
- Forward to backend API with proper authentication
- Handle httpOnly cookie management
- Return responses to client

Never call the backend API directly from client code - always use the integration functions!
