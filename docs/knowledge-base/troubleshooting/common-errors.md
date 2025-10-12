# 🚧 Common Errors & Solutions

Detailed troubleshooting guide for the most frequently encountered errors in AI IVR v2 development and deployment.

## 🚨 Critical System Errors

### **Database Connection Issues**

#### **Error**: `P1001: Can't reach database server`
```bash
Error: P1001: Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

**🔧 Solution Steps:**
```bash
# 1. Check if PostgreSQL is running
Get-Service postgresql*  # Windows
# or
docker ps | findstr postgres  # Docker

# 2. Verify database URL in .env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# 3. Test connection manually
psql -h localhost -p 5432 -U username -d database_name

# 4. If using Docker, start PostgreSQL
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

# 5. Reset Prisma and reconnect
npx prisma generate
npx prisma db push
```

#### **Error**: Migration conflicts
```bash
Error: Migration `20231201120000_init` failed to apply cleanly to the shadow database
```

**🔧 Solution Steps:**
```bash
# 1. Check migration status
npx prisma migrate status

# 2. If shadow database is corrupted, reset it
npx prisma migrate reset

# 3. If you have data to preserve, resolve manually
npx prisma migrate resolve --applied 20231201120000_init

# 4. Create a new migration for any remaining changes
npx prisma migrate dev --name fix_schema_conflicts

# 5. Deploy to production
npx prisma migrate deploy
```

### **API Authentication Failures**

#### **Error**: OpenAI API Key Invalid
```bash
Error: 401 Unauthorized - Invalid API key provided
```

**🔧 Solution Steps:**
```bash
# 1. Check environment variables
echo $env:OPENAI_API_KEY  # Windows PowerShell
# Verify key starts with 'sk-'

# 2. Test API key directly
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# 3. Update .env file
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_ORG_ID=org-your-organization-id  # If applicable

# 4. Restart development server
npm run dev

# 5. Check API usage and billing
# Visit OpenAI dashboard to ensure account is active
```

#### **Error**: NextAuth Session Issues
```bash
Error: [next-auth][error][JWT_SESSION_ERROR] 
https://next-auth.js.org/errors#jwt_session_error 
Invalid JWT token
```

**🔧 Solution Steps:**
```typescript
// 1. Check environment configuration
// .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-here

// 2. Generate new secret
import crypto from 'crypto';
const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);

// 3. Clear browser cookies and restart
// Clear all localhost cookies in browser
// Restart development server

// 4. Check NextAuth configuration
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    // Your providers
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  }
});
```

## 💻 Development Environment Errors

### **Node.js & npm Issues**

#### **Error**: Node version incompatibility
```bash
Error: The engine "node" is incompatible with this module. 
Expected version ">=18.17.0". Got "16.14.0"
```

**🔧 Solution Steps:**
```bash
# 1. Check current Node version
node --version

# 2. Install Node Version Manager (if not installed)
# Download from: https://github.com/coreybutler/nvm-windows

# 3. Install and use correct Node version
nvm install 18.17.0
nvm use 18.17.0

# 4. Verify installation
node --version  # Should show v18.17.0

# 5. Reinstall dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# 6. Update .nvmrc file (optional)
echo "18.17.0" > .nvmrc
```

#### **Error**: Package installation conflicts
```bash
Error: npm ERR! peer dep missing: react@^18.0.0, required by @types/react@18.2.0
```

**🔧 Solution Steps:**
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 3. Check for conflicting versions in package.json
# Ensure all React packages use same version:
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}

# 4. Install with legacy peer deps if needed
npm install --legacy-peer-deps

# 5. Or force resolution (use with caution)
{
  "overrides": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### **TypeScript Compilation Errors**

#### **Error**: Module resolution failures
```typescript
// Error: Cannot find module '@/components/ui/button' or its corresponding type declarations
import { Button } from '@/components/ui/button';
```

**🔧 Solution Steps:**
```json
// 1. Check tsconfig.json paths configuration
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}

// 2. Verify file exists at correct path
// src/components/ui/button.tsx should exist

// 3. Check file exports
// button.tsx
export { Button } from './button';
export type { ButtonProps } from './button';

// 4. Restart TypeScript server in VSCode
// Ctrl+Shift+P -> "TypeScript: Restart TS Server"

// 5. Clear Next.js cache
Remove-Item -Recurse -Force .next
npm run dev
```

#### **Error**: Type definition conflicts
```typescript
// Error: Type 'Agent' is not assignable to type 'Agent'
// Types have separate declarations of a property with the same name
```

**🔧 Solution Steps:**
```typescript
// 1. Check for duplicate type definitions
// Search for multiple Agent type definitions

// 2. Consolidate types in single file
// src/types/agent.ts
export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  // ... other properties
}

// 3. Use consistent imports
import type { Agent } from '@/types/agent';
// Don't mix with: import { Agent } from '@prisma/client';

// 4. Create type aliases if needed
import type { Agent as PrismaAgent } from '@prisma/client';
export interface Agent extends PrismaAgent {
  // Additional properties
}

// 5. Clear TypeScript cache
Remove-Item -Recurse -Force node_modules/.cache
npx tsc --build --clean
```

## 🌐 Frontend Component Errors

### **React Hook Errors**

#### **Error**: Rules of Hooks violations
```typescript
// Error: React Hook "useState" is called conditionally. 
// React Hooks must be called in the exact same order every time the component renders
```

**🔧 Solution Steps:**
```typescript
// ❌ Incorrect: Conditional hook usage
function MyComponent({ showState }: { showState: boolean }) {
  if (showState) {
    const [state, setState] = useState(''); // Wrong!
  }
  
  return <div>Content</div>;
}

// ✅ Correct: Always call hooks
function MyComponent({ showState }: { showState: boolean }) {
  const [state, setState] = useState('');
  
  if (!showState) {
    return <div>Content without state</div>;
  }
  
  return <div>Content with state: {state}</div>;
}

// ✅ Alternative: Conditional rendering after hooks
function MyComponent({ showState }: { showState: boolean }) {
  const [state, setState] = useState('');
  
  return (
    <div>
      {showState ? (
        <div>Content with state: {state}</div>
      ) : (
        <div>Content without state</div>
      )}
    </div>
  );
}
```

#### **Error**: Infinite re-render loops
```typescript
// Error: Too many re-renders. React limits the number of renders to prevent an infinite loop
```

**🔧 Solution Steps:**
```typescript
// ❌ Incorrect: Missing dependencies or improper effect
function MyComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  // This causes infinite loop!
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }); // Missing dependency array
  
  return <div>{user?.name}</div>;
}

// ✅ Correct: Proper dependency array
function MyComponent({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]); // Proper dependency
  
  return <div>{user?.name}</div>;
}

// ✅ Alternative: Use callback for function dependencies
function MyComponent({ userId, onUserLoaded }: Props) {
  const [user, setUser] = useState(null);
  
  const handleUserLoaded = useCallback((userData) => {
    setUser(userData);
    onUserLoaded?.(userData);
  }, [onUserLoaded]);
  
  useEffect(() => {
    fetchUser(userId).then(handleUserLoaded);
  }, [userId, handleUserLoaded]);
  
  return <div>{user?.name}</div>;
}
```

### **Styling and CSS Issues**

#### **Error**: Tailwind classes not applying
```jsx
// Classes appear in code but don't show in browser
<div className="bg-red-500 text-white p-4">Content</div>
```

**🔧 Solution Steps:**
```javascript
// 1. Check tailwind.config.js content paths
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... rest of config
}

// 2. Verify Tailwind is imported in globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

// 3. Check for CSS conflicts
// Look for conflicting CSS that might override Tailwind

// 4. Purge and rebuild
Remove-Item -Recurse -Force .next
npm run dev

// 5. Use JIT mode for dynamic classes
// If using dynamic classes, ensure they're in safelist
module.exports = {
  content: [...],
  safelist: [
    'bg-red-500',
    'bg-green-500',
    // Add dynamic classes here
  ]
}
```

#### **Error**: CSS Module conflicts
```typescript
// Error: Conflicting CSS classes or styles not applying correctly
```

**🔧 Solution Steps:**
```typescript
// 1. Check CSS module naming
// component.module.css
.button {
  background: blue;
}

// 2. Import correctly
import styles from './component.module.css';

// 3. Use className properly
<button className={styles.button}>Click me</button>

// 4. Combine with other classes using clsx
import clsx from 'clsx';

<button 
  className={clsx(
    styles.button,
    'text-white',
    isActive && styles.active
  )}
>
  Click me
</button>

// 5. Check CSS specificity conflicts
// Ensure module CSS doesn't conflict with global CSS
```

## 🔧 Build & Deployment Errors

### **Next.js Build Issues**

#### **Error**: Build optimization failures
```bash
Error: Failed to compile
./src/components/MyComponent.tsx
Module build failed: SyntaxError: Unexpected token '?'
```

**🔧 Solution Steps:**
```typescript
// 1. Check TypeScript version compatibility
npm list typescript
npm install typescript@latest

// 2. Update Next.js to latest version
npm install next@latest

// 3. Check for unsupported syntax
// ❌ Might not be supported in older versions
const result = data?.property?.nestedProperty;

// ✅ Use explicit checks if needed
const result = data && data.property && data.property.nestedProperty;

// 4. Update tsconfig.json target
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "module": "esnext"
  }
}

// 5. Clear cache and rebuild
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules/.cache
npm run build
```

#### **Error**: Memory issues during build
```bash
Error: JavaScript heap out of memory
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**🔧 Solution Steps:**
```bash
# 1. Increase Node.js memory limit
$env:NODE_OPTIONS="--max_old_space_size=4096"
npm run build

# 2. Or modify package.json scripts
{
  "scripts": {
    "build": "NODE_OPTIONS='--max_old_space_size=4096' next build"
  }
}

# 3. Optimize build process
# next.config.js
module.exports = {
  experimental: {
    workerThreads: false,
    cpus: 1
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244 * 1024, // 244KB
      }
    }
    return config;
  }
}

# 4. Check for memory leaks in components
# Use React DevTools Profiler to identify issues

# 5. Build with analysis
npm run build -- --profile
npm run analyze  # If you have bundle analyzer
```

### **Docker Deployment Issues**

#### **Error**: Docker build context too large
```bash
Error: Error response from daemon: maximum upload context size exceeded
```

**🔧 Solution Steps:**
```dockerfile
# 1. Create/update .dockerignore
node_modules
.next
.git
*.md
.env*.local
.nyc_output
coverage
.vscode
*.log

# 2. Multi-stage build to reduce size
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
CMD ["npm", "start"]

# 3. Check build context size
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum
# Should be under 100MB for efficient builds
```

#### **Error**: Environment variables not working in Docker
```bash
Error: Environment variable DATABASE_URL is not defined
```

**🔧 Solution Steps:**
```bash
# 1. Check Docker environment passing
docker run --env-file .env.production your-image

# 2. Verify .env.production file exists and has correct variables
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
OPENAI_API_KEY=...

# 3. Use docker-compose for complex environments
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    env_file:
      - .env.production

# 4. Check Next.js environment variable loading
# next.config.js
module.exports = {
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

# 5. Debug environment in container
docker exec -it container-name env | grep DATABASE_URL
```

## 📱 Runtime Performance Issues

### **Slow API Responses**

#### **Problem**: API endpoints taking >5 seconds
```typescript
// Slow database queries and N+1 problems
```

**🔧 Solution Steps:**
```typescript
// 1. Add database query logging
// Enable in development
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// 2. Identify slow queries
// Look for queries taking >100ms in logs

// 3. Optimize with proper includes/selects
// ❌ Fetches too much data
const agents = await prisma.agent.findMany({
  include: {
    conversations: {
      include: {
        messages: true // Loads ALL messages!
      }
    }
  }
});

// ✅ Optimized query
const agents = await prisma.agent.findMany({
  select: {
    id: true,
    name: true,
    status: true,
    _count: {
      select: { conversations: true }
    }
  },
  where: { status: 'active' }
});

// 4. Add caching for expensive operations
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
});

async function getCachedAgents(userId: string) {
  const cacheKey = `user:${userId}:agents`;
  const cached = await redis.get(cacheKey);
  
  if (cached) {
    return cached as Agent[];
  }
  
  const agents = await fetchAgents(userId);
  await redis.setex(cacheKey, 300, agents); // Cache for 5 minutes
  
  return agents;
}

// 5. Add database indexes
// In Prisma schema
model Agent {
  id        String   @id
  status    String   
  userId    String   
  createdAt DateTime @default(now())
  
  @@index([status, userId]) // Compound index for filtering
  @@index([createdAt])      // For sorting by date
}
```

### **Memory Leaks**

#### **Problem**: Memory usage continuously increasing
```typescript
// Memory not being freed properly
```

**🔧 Solution Steps:**
```typescript
// 1. Check for event listener leaks
// ❌ Missing cleanup
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  
  // Missing return cleanup function!
}, []);

// ✅ Proper cleanup
useEffect(() => {
  const handleResize = () => { /* ... */ };
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// 2. Clear intervals and timeouts
useEffect(() => {
  const interval = setInterval(() => {
    // Some recurring task
  }, 1000);
  
  return () => clearInterval(interval);
}, []);

// 3. Cancel pending requests
useEffect(() => {
  const abortController = new AbortController();
  
  fetch('/api/data', { 
    signal: abortController.signal 
  }).then(response => {
    // Handle response
  }).catch(error => {
    if (error.name !== 'AbortError') {
      console.error('Fetch error:', error);
    }
  });
  
  return () => abortController.abort();
}, []);

// 4. Monitor memory usage
// Add to development environment
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const used = process.memoryUsage();
    console.log('Memory usage:', {
      rss: Math.round(used.rss / 1024 / 1024) + 'MB',
      heapTotal: Math.round(used.heapTotal / 1024 / 1024) + 'MB',
      heapUsed: Math.round(used.heapUsed / 1024 / 1024) + 'MB',
    });
  }, 30000); // Every 30 seconds
}
```

## 🔐 Security Vulnerabilities

### **Common Security Issues**

#### **Problem**: XSS vulnerabilities
```typescript
// Dangerous direct HTML injection
```

**🔧 Solution Steps:**
```typescript
// ❌ Vulnerable to XSS
function DisplayUserMessage({ message }: { message: string }) {
  return <div dangerouslySetInnerHTML={{ __html: message }} />;
}

// ✅ Safe HTML rendering
import DOMPurify from 'dompurify';

function DisplayUserMessage({ message }: { message: string }) {
  const sanitizedHTML = DOMPurify.sanitize(message);
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
}

// ✅ Even better: Use text content
function DisplayUserMessage({ message }: { message: string }) {
  return <div>{message}</div>; // React automatically escapes
}

// 2. Validate all inputs
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().max(1000).trim(),
  authorId: z.string().uuid(),
});

function validateMessage(data: unknown) {
  return messageSchema.parse(data);
}

// 3. Use CSP headers
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
          }
        ],
      },
    ]
  },
}
```

#### **Problem**: SQL Injection (if using raw queries)
```typescript
// Dangerous raw SQL construction
```

**🔧 Solution Steps:**
```typescript
// ❌ Vulnerable to SQL injection
const getUserByName = async (name: string) => {
  const query = `SELECT * FROM users WHERE name = '${name}'`;
  return await db.raw(query); // DON'T DO THIS!
};

// ✅ Use Prisma (automatically safe)
const getUserByName = async (name: string) => {
  return await prisma.user.findFirst({
    where: { name }
  });
};

// ✅ If you must use raw queries, use parameters
const getUserByName = async (name: string) => {
  return await db.raw('SELECT * FROM users WHERE name = ?', [name]);
};

// 2. Always validate inputs
import { z } from 'zod';

const userQuerySchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s]+$/),
});

const getUserByName = async (name: string) => {
  const validated = userQuerySchema.parse({ name });
  return await prisma.user.findFirst({
    where: { name: validated.name }
  });
};
```

---

**Need more help?** 
- Check the [troubleshooting main page](./README.md) for additional resources
- Visit our internal support channels
- Review the [development guidelines](../best-practices/development-guidelines.md) for preventing these issues