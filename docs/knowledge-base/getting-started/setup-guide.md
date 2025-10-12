# ⚙️ Setup Guide

This guide will help you set up your development environment for AI IVR v2. Follow these steps carefully to ensure everything works correctly.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux Ubuntu 18.04+
- **RAM**: Minimum 8GB, Recommended 16GB+
- **Storage**: At least 5GB free space
- **Internet**: Stable broadband connection

### Required Software

#### 1. **Node.js** (Required)
```bash
# Download and install Node.js 18+ from https://nodejs.org
# Verify installation:
node --version  # Should show v18.0.0 or higher
npm --version   # Should show 8.0.0 or higher
```

#### 2. **Git** (Required)
```bash
# Download from https://git-scm.com
# Verify installation:
git --version
```

#### 3. **Code Editor** (Recommended)
- **VS Code**: Download from https://code.visualstudio.com
- **Required Extensions**:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Prisma
  - GitLens

#### 4. **Database** (Development)
Choose one option:
- **PostgreSQL**: Local installation (Recommended for development)
- **Docker**: Use containerized database
- **Cloud**: Use cloud database service

## 🔧 Environment Setup

### Step 1: Clone the Repository

```bash
# Clone the project repository
git clone https://github.com/kylasweb/AI-IVR-v2.git

# Navigate to project directory
cd AI-IVR-v2

# Check out the main branch
git checkout main
```

### Step 2: Install Dependencies

```bash
# Install project dependencies
npm install

# Verify installation
npm run --version
```

### Step 3: Environment Configuration

#### Create Environment Files

```bash
# Copy example environment file
cp .env.example .env.local
```

#### Configure Environment Variables

Edit `.env.local` with your settings:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ai_ivr_v2"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Services (Optional for development)
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_SPEECH_API_KEY="your-google-speech-key"

# Cloud Communication (Optional)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"

# Development Settings
NODE_ENV="development"
DEBUG_MODE="true"
```

### Step 4: Database Setup

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb ai_ivr_v2

# Run database migrations
npx prisma migrate dev
```

#### Option B: Docker Database

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name ai-ivr-postgres \
  -e POSTGRES_DB=ai_ivr_v2 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15

# Run database migrations
npx prisma migrate dev
```

### Step 5: Generate Prisma Client

```bash
# Generate Prisma client
npx prisma generate

# Seed the database (optional)
npx prisma db seed
```

## 🚀 First Run

### Start Development Server

```bash
# Start the development server
npm run dev
```

You should see output similar to:
```
> AI-IVR-v2@1.0.0 dev
> next dev

▲ Next.js 15.3.5
- Local:        http://localhost:3000
- Network:      http://192.168.1.100:3000

Ready in 2.3s
```

### Verify Installation

1. **Open Browser**: Navigate to http://localhost:3000
2. **Check Dashboard**: You should see the AI IVR v2 dashboard
3. **Test Database**: Navigate to http://localhost:3000/api/health
4. **Check Console**: No error messages in browser console

## 🛠️ Development Tools Setup

### VS Code Configuration

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Install Recommended Extensions

```bash
# Open VS Code in project directory
code .

# Install extensions (use VS Code command palette: Ctrl/Cmd + Shift + P)
# Type: "Extensions: Install Extensions" and install:
```

Required Extensions:
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense**
- **TypeScript Importer**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**
- **Prettier - Code formatter**
- **ESLint**

## 🧪 Testing Setup

### Run Tests

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Setup Test Database

```bash
# Create test environment file
cp .env.local .env.test

# Edit .env.test with test database URL
# DATABASE_URL="postgresql://username:password@localhost:5432/ai_ivr_v2_test"

# Run test migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

## 🔍 Verification Checklist

- [ ] Node.js 18+ installed and working
- [ ] Git installed and configured
- [ ] Project cloned successfully
- [ ] Dependencies installed without errors
- [ ] Environment variables configured
- [ ] Database connected and migrated
- [ ] Development server starts without errors
- [ ] Can access http://localhost:3000
- [ ] VS Code configured with extensions
- [ ] Tests run successfully

## ⚡ Optional Enhancements

### Docker Development Environment

```bash
# Build development container
docker-compose -f docker-compose.dev.yml up -d

# Access the application
# http://localhost:3000
```

### Database Management Tools

- **pgAdmin**: Web-based PostgreSQL administration
- **Prisma Studio**: Visual database browser
  ```bash
  npx prisma studio  # Opens at http://localhost:5555
  ```

### Performance Monitoring

```bash
# Install monitoring tools
npm install --save-dev @next/bundle-analyzer

# Analyze bundle size
npm run analyze
```

## 🆘 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
npm run dev -- -p 3001
```

#### Database Connection Issues
```bash
# Check database status
pg_isready -d ai_ivr_v2  # PostgreSQL

# Reset database
npx prisma migrate reset
```

#### Permission Issues
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Clear npm cache
npm cache clean --force
```

#### TypeScript Errors
```bash
# Regenerate TypeScript definitions
npx prisma generate
rm -rf .next
npm run dev
```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**: Look for error messages in terminal and browser console
2. **Search documentation**: Use the search function in this knowledge base
3. **Ask for help**: 
   - Slack: #ai-ivr-support
   - Email: support@ai-ivr-v2.com
   - Team Lead: Contact your assigned mentor

---

**Next Step**: Continue to [First Steps](./first-steps.md) for your initial orientation tasks.