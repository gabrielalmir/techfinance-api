# TechFinance Development Guidelines

This document provides essential information for developers working on the TechFinance project. It covers build/configuration instructions, testing procedures, and development best practices.

## Project Overview

TechFinance is a multi-component application consisting of:

1. **API Backend** - A Bun.js/TypeScript API using Elysia.js and Drizzle ORM
2. **Web Frontend** - A React/TypeScript application using Vite and TailwindCSS
3. **Mobile App** - A React Native/Expo application

## Build and Configuration Instructions

### API Backend

#### Prerequisites
- **Bun.js** (latest version)
- PostgreSQL database
- Environment variables configured in `.env`

#### Setup and Installation
```bash
# Navigate to API directory
cd api

# Install dependencies
bun install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials and other settings

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

#### Environment Variables
Key environment variables for the API:
- `PORT` - Server port (default: 3000)
- `DATABASE_URL` - PostgreSQL connection string
- `AUTHORIZATION` - API authorization token
- `OPENAI_API_KEY` - OpenAI API key (if using AI features)

### Web Frontend

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Setup and Installation
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Mobile App

#### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

#### Setup and Installation
```bash
# Navigate to app directory
cd app

# Install dependencies
npm install

# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios
```

#### Environment Configuration
Mobile app environment variables are configured in `app.config.ts` and can be overridden with a `.env` file.

## Testing Information

### API Testing

The API uses Vitest for testing. Tests are located in files with the pattern `*.test.ts` in the same directory as the files they test.

#### Running Tests
```bash
# Navigate to API directory
cd api

# Run all tests
bun test

# Run specific tests
bun test customer

# Run tests with coverage
bun test:coverage

# Run tests in watch mode
bun test:watch
```

#### Creating New Tests

1. Create a test file with the naming pattern `[filename].test.ts` in the same directory as the file you're testing.
2. Use the Vitest testing framework with `describe`, `it`, and `expect` functions.
3. For API route tests, create an instance of Elysia and register your routes.
4. Mock dependencies using `vi.spyOn()`.

Example test for an API route:

```typescript
import { Elysia } from 'elysia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { exampleRoutes } from './example.route';
import { exampleService } from '../config/deps';

// Mock the service method
vi.spyOn(exampleService, 'getData').mockImplementation(vi.fn());

describe('Example Routes', () => {
  let app: Elysia;

  beforeEach(() => {
    app = new Elysia();
    exampleRoutes(app);
    vi.clearAllMocks();
  });

  it('should return data with default parameters', async () => {
    // Mock the service response
    const mockData = [{ id: 1, name: 'Test Example' }];
    exampleService.getData.mockResolvedValue(mockData);

    // Make request to the endpoint
    const response = await app.handle(
      new Request('http://localhost/example')
    );

    // Assert response
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockData);
  });
});
```

### Web Testing

The web frontend doesn't have a testing framework configured yet. Consider adding Jest or Vitest for component testing.

### Mobile Testing

The mobile app doesn't have a testing framework configured yet. Consider adding Jest with React Native Testing Library.

## Development Guidelines

### API Development

#### Adding New Endpoints

1. **Create a Service** in `api/src/services/`
2. **Create a Route** in `api/src/routes/`
3. **Register the Service** in `api/src/config/deps.ts`
4. **Create Tests** for your new endpoint

#### Error Handling

Use the `resulta` library for consistent error handling:

```typescript
import { tryCatchAsync } from 'resulta';

const result = await tryCatchAsync(() => 
  someOperationThatMightFail()
);

if (!result.ok) {
  return { status: 500, message: 'User-friendly error message' };
}

return result.value;
```

#### Database Operations

Use Drizzle ORM for database operations:

```typescript
import { db } from '../db';
import { products } from '../db/schema';
import { eq, like } from 'drizzle-orm';

// Query with filters
const results = await db
  .select()
  .from(products)
  .where(like(products.name, `%${searchTerm}%`))
  .limit(limit)
  .offset(offset);
```

### Web Development

#### Component Structure

- Use functional components with hooks
- Organize components in the `src/components` directory
- Use TailwindCSS for styling

#### State Management

- Use React Query for server state
- Use Zustand for client state

### Mobile Development

#### Screen Structure

- Use the Expo Router for navigation
- Organize screens in the `src/app` directory
- Use NativeWind (TailwindCSS) for styling

#### State Management

- Use Zustand for state management
- Use AsyncStorage for persistence

## Code Style and Best Practices

### TypeScript

- Use strict TypeScript typing
- Define interfaces for all data structures
- Use type guards for runtime type checking

### API Architecture

- Follow the layered architecture: Routes → Services → Repositories → Database
- Keep business logic in services
- Keep data access in repositories
- Use dependency injection via the deps.ts file

### Testing Best Practices

- Write tests for all new features
- Mock external dependencies
- Test edge cases and error scenarios
- Keep tests focused and isolated

### Git Workflow

- Use feature branches
- Follow conventional commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `test:` for tests
  - `refactor:` for refactoring
  - `chore:` for maintenance tasks

## Troubleshooting

### Common API Issues

- **Database connection errors**: Check DATABASE_URL in .env
- **Authorization errors**: Verify the AUTHORIZATION token
- **Dependency issues**: Run `bun install` to update dependencies

### Common Web Issues

- **Build errors**: Check for TypeScript errors
- **API connection issues**: Verify API URL in environment config

### Common Mobile Issues

- **Expo errors**: Clear cache with `npm start -- --clear`
- **Build failures**: Check native dependencies and Expo SDK version