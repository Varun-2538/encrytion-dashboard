# Secrets Store

A secure secrets management application where users can store encrypted sensitive information (passwords, API keys, notes). All secrets are encrypted using AES-256-GCM before being stored in the database.

## Features

- ✅ User authentication (Email/Password) via Supabase
- ✅ Encrypted secret storage using AES-256-GCM
- ✅ Create, read, update, and delete secrets
- ✅ Row-level security to ensure users only see their own secrets
- ✅ Clean, minimal UI with reveal/hide functionality
- ✅ Real-time secret management

## Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **HTTP Client**: Axios

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: Supabase Auth (JWT verification)
- **Encryption**: Node.js crypto (AES-256-GCM)
- **Database**: Supabase (PostgreSQL)

## Project Structure

```
secrets-store/
├── frontend/                 # Next.js application
│   ├── app/
│   │   ├── page.tsx          # Login/Register page
│   │   ├── dashboard/
│   │   │   └── page.tsx      # Secrets vault dashboard
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForm.tsx
│   │   ├── dashboard/
│   │   │   ├── Header.tsx
│   │   │   ├── SecretsList.tsx
│   │   │   ├── SecretRow.tsx
│   │   │   └── SecretModal.tsx
│   │   └── ui/               # Reusable UI components
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   └── api.ts            # Backend API client
│   └── types/
│       └── index.ts
│
└── backend/                  # Express.js API (TypeScript)
    ├── src/
    │   ├── controllers/
    │   │   └── secretsController.ts
    │   ├── middleware/
    │   │   ├── auth.ts
    │   │   └── validation.ts
    │   ├── routes/
    │   │   └── secrets.ts
    │   ├── services/
    │   │   ├── encryptionService.ts
    │   │   └── supabaseClient.ts
    │   ├── types/
    │   │   └── index.ts
    │   ├── utils/
    │   │   ├── logger.ts
    │   │   └── generateKey.ts
    │   └── server.ts
    ├── tsconfig.json
    └── .env.example
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

### 1. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Enable Email authentication in Supabase Dashboard:
   - Go to Authentication → Settings
   - Enable Email provider
3. Create the secrets table:

```sql
-- Create secrets table
CREATE TABLE secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  encrypted_content TEXT NOT NULL,
  iv VARCHAR(255) NOT NULL,
  auth_tag VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_secrets_user_id ON secrets(user_id);
CREATE INDEX idx_secrets_created_at ON secrets(created_at DESC);

-- Enable Row Level Security
ALTER TABLE secrets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own secrets" ON secrets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own secrets" ON secrets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own secrets" ON secrets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own secrets" ON secrets
  FOR DELETE USING (auth.uid() = user_id);
```

4. Get your Supabase credentials:
   - **SUPABASE_URL**: Project Settings → API → Project URL
   - **SUPABASE_ANON_KEY**: Project Settings → API → anon/public key
   - **SUPABASE_SERVICE_KEY**: Project Settings → API → service_role key

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Generate an encryption key:
```bash
npx ts-node src/utils/generateKey.ts
```

5. Update `.env` with your values:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
ENCRYPTION_KEY=your_generated_64_char_hex_key
```

6. Start the backend server:
```bash
npm run dev
```

The backend should now be running on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your values:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The frontend should now be running on `http://localhost:3000`

## Usage

1. Open `http://localhost:3000` in your browser
2. Create an account by clicking "Sign Up"
3. Verify your email (check spam folder if needed)
4. Sign in with your credentials
5. You'll be redirected to the dashboard
6. Click "Add Secret" to create a new encrypted secret
7. Use the eye icon to reveal/hide secret content
8. Edit or delete secrets as needed
9. Logout when done

## API Endpoints

All endpoints require a valid Supabase access token in the `Authorization` header.

### Authentication
```
Authorization: Bearer <supabase_access_token>
```

### Endpoints

- `GET /api/secrets` - Get all secrets for authenticated user
- `POST /api/secrets` - Create a new secret
  - Body: `{ "content": "secret text" }`
- `PUT /api/secrets/:id` - Update a secret
  - Body: `{ "content": "updated text" }`
- `DELETE /api/secrets/:id` - Delete a secret

## Security Features

- ✅ AES-256-GCM encryption for all secrets
- ✅ Unique initialization vectors (IV) for each encryption
- ✅ Authentication tags to prevent tampering
- ✅ Row-level security in database
- ✅ JWT token verification on all API requests
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Environment variable protection

## Code Architecture Principles

This project follows enterprise-level coding standards:

- **DRY (Don't Repeat Yourself)**: Common functionality is extracted into reusable components and utilities
- **Modular Design**: Components are small, focused, and under 200 lines of code
- **Layered Architecture**: Clear separation between presentation, business logic, and data layers
- **Type Safety**: Full TypeScript support with proper type definitions
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging**: Structured logging for debugging and monitoring
- **Consistent Naming**: Human-readable, self-documenting variable and function names
- **Validation**: Input validation at both frontend and backend levels

## Important Notes

⚠️ **Critical Security Information**:

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Never share your encryption key** - If lost, all secrets become unrecoverable
3. **Use HTTPS in production** - Never transmit secrets over unencrypted connections
4. **Keep dependencies updated** - Regularly update packages for security patches
5. **Backup your encryption key** - Store it securely in a password manager

## Troubleshooting

### Backend won't start
- Ensure all environment variables are set correctly
- Check that the encryption key is exactly 64 hexadecimal characters
- Verify Supabase credentials are correct

### Frontend authentication fails
- Verify Supabase URL and anon key are correct
- Check that email authentication is enabled in Supabase
- Ensure the user's email is verified

### Secrets won't decrypt
- The encryption key must remain the same
- Check that the IV and auth tag are stored correctly
- Verify no data corruption in the database

## License

MIT

## Support

For issues or questions, please refer to the [plan.md](plan.md) file for detailed architecture information.
