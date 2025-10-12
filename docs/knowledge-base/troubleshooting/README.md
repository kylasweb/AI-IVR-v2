# 🛠️ Troubleshooting Guide

Common issues, debugging procedures, and solutions for AI IVR v2 platform problems. Get back up and running quickly with these proven solutions.

## 🚨 Quick Emergency Fixes

### **System Down**
1. **Check System Status**: Visit [Status Dashboard] or run `npm run health-check`
2. **Restart Services**: `npm run restart` or `docker-compose restart`
3. **Check Logs**: `npm run logs` for recent error messages
4. **Escalate**: Contact system administrator if not resolved in 5 minutes

### **Can't Login**
1. **Clear Browser Cache**: Ctrl+Shift+Delete
2. **Check Network**: Verify internet connection
3. **Try Incognito Mode**: Rule out browser extension conflicts
4. **Reset Password**: Use password recovery option

### **AI Agent Not Responding**
1. **Check Agent Status**: View agent dashboard for status
2. **Restart Agent**: Use "Restart Agent" button in console
3. **Check API Keys**: Verify OpenAI/Claude API credentials
4. **Review Logs**: Check agent-specific error logs

## 🔍 Common Issues & Solutions

### **Development Environment Issues**

#### **Problem**: `npm install` fails with dependency errors
```bash
# ❌ Error Message
npm ERR! peer dep missing: react@^18.0.0, required by @types/react@18.2.0

# ✅ Solution Steps
1. Clear npm cache:
   npm cache clean --force

2. Delete node_modules and package-lock.json:
   Remove-Item -Recurse -Force node_modules, package-lock.json

3. Use correct Node.js version:
   nvm use 18.17.0  # or latest LTS

4. Reinstall dependencies:
   npm install

5. If still failing, try:
   npm install --legacy-peer-deps
```

#### **Problem**: TypeScript compilation errors
```typescript
// ❌ Error: Property 'xyz' does not exist on type 'Agent'
const agentName = agent.xyz;

// ✅ Solution: Check type definitions
// 1. Update type imports
import { Agent, AgentConfig } from '@/types/agent';

// 2. Use proper typing
const agentName = agent.name; // Use correct property

// 3. Add type assertion if necessary (use carefully)
const agentName = (agent as any).xyz; // Last resort only
```

#### **Problem**: Hot reload not working
```bash
# ✅ Solution Steps
1. Check if port is available:
   netstat -ano | findstr :3000

2. Kill process if needed:
   taskkill /PID <PID_NUMBER> /F

3. Clear Next.js cache:
   Remove-Item -Recurse -Force .next

4. Restart development server:
   npm run dev

5. Check file watching limits:
   # Add to package.json scripts
   "dev": "next dev --turbo"
```

### **Database Issues**

#### **Problem**: Prisma connection errors
```bash
# ❌ Error Message
Error: P1001: Can't reach database server

# ✅ Solution Steps
1. Check database status:
   # For PostgreSQL
   pg_ctl status

   # For Docker
   docker ps | findstr postgres

2. Verify connection string:
   # Check .env file
   DATABASE_URL="postgresql://user:pass@localhost:5432/aiivr"

3. Test connection:
   npx prisma db push

4. Reset database if needed:
   npx prisma migrate reset

5. Generate Prisma client:
   npx prisma generate
```

#### **Problem**: Migration failures
```bash
# ❌ Error Message
Migration failed to apply cleanly to the shadow database

# ✅ Solution Steps
1. Check migration status:
   npx prisma migrate status

2. Reset and reapply migrations:
   npx prisma migrate reset
   npx prisma migrate deploy

3. If custom migrations, fix SQL syntax:
   # Review migration file in prisma/migrations/
   # Fix any SQL syntax errors

4. Mark migration as applied (if already manually applied):
   npx prisma migrate resolve --applied <migration_name>
```

### **AI Agent Issues**

#### **Problem**: Agent responses are slow or timeout
```typescript
// ❌ Common causes and solutions

// 1. Check API rate limits
const rateLimitStatus = await checkAPILimits();
if (rateLimitStatus.exceeded) {
  await waitForRateLimit();
}

// 2. Optimize prompt length
const optimizedPrompt = truncatePrompt(originalPrompt, 4000); // Max tokens

// 3. Add timeout handling
const response = await Promise.race([
  aiService.generateResponse(prompt),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 30000)
  )
]);

// 4. Implement retry logic
async function retryAICall(prompt: string, maxRetries = 3): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await aiService.generateResponse(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

#### **Problem**: Agent giving incorrect or inappropriate responses
```yaml
# ✅ Troubleshooting Steps

1. Review Agent Configuration:
   - Check system prompt for clarity
   - Verify conversation context
   - Review training examples

2. Check Input Processing:
   - Validate user input sanitization
   - Verify language detection
   - Check context window limits

3. Update Agent Settings:
   - Adjust temperature (lower = more focused)
   - Modify max tokens
   - Update safety filters

4. Test with Sample Inputs:
   - Use known good examples
   - Test edge cases
   - Verify multilingual support

5. Review Conversation Logs:
   - Check conversation history
   - Identify pattern in bad responses
   - Look for context drift
```

### **IVR Flow Issues**

#### **Problem**: Call flow getting stuck or looping
```yaml
# ✅ Debugging Steps

1. Check Flow Logic:
   - Verify all paths have exits
   - Check for infinite loops
   - Validate condition logic

2. Review Node Connections:
   - Ensure all nodes are connected
   - Check for orphaned nodes
   - Verify decision tree paths

3. Test Flow Simulation:
   - Use flow testing tool
   - Test all possible paths
   - Check timeout handling

4. Monitor Real Calls:
   - Check call logs
   - Identify stuck points
   - Review user input patterns

5. Flow Configuration:
   # Example fix for common loop issue
   nodes:
     - id: "greeting"
       type: "message"
       next: "get_input"
     - id: "get_input"  
       type: "input"
       timeout: 30
       no_input_action: "repeat" # Prevent infinite loop
       max_retries: 3
       fallback: "human_transfer"
```

### **Performance Issues**

#### **Problem**: Application is running slowly
```bash
# ✅ Performance Debugging

1. Check Resource Usage:
   # Windows Task Manager or:
   Get-Process -Name node | Select-Object CPU, WorkingSet

2. Profile the Application:
   # Enable Next.js profiling
   npm run build -- --profile
   npm run analyze

3. Check Database Performance:
   # Enable query logging
   # Review slow queries in logs
   
4. Monitor Memory Usage:
   # Check for memory leaks
   node --inspect server.js
   # Use Chrome DevTools for profiling

5. Optimize Images and Assets:
   # Use Next.js Image optimization
   import Image from 'next/image';
   
   # Compress assets
   npm run optimize-images
```

#### **Problem**: High server response times
```typescript
// ✅ Performance Optimization

// 1. Add response caching
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }
  
  const data = await fetchData();
  await redis.setex(cacheKey, 300, JSON.stringify(data)); // Cache for 5 minutes
  
  return NextResponse.json(data);
}

// 2. Optimize database queries
// Use indexes, limit results, avoid N+1 queries
const agents = await prisma.agent.findMany({
  select: { id: true, name: true, status: true }, // Only select needed fields
  where: { status: 'active' },
  take: 50, // Limit results
  include: {
    conversations: {
      take: 10,
      orderBy: { createdAt: 'desc' }
    }
  }
});

// 3. Implement pagination
const { page = 1, limit = 20 } = query;
const offset = (page - 1) * limit;
const results = await prisma.agent.findMany({
  skip: offset,
  take: limit
});
```

### **Deployment Issues**

#### **Problem**: Docker build failures
```dockerfile
# ❌ Common Docker issues and solutions

# Issue: Build context too large
# ✅ Solution: Add .dockerignore
# .dockerignore file content:
node_modules
.next
.git
*.md
.env*.local

# Issue: Dependency installation fails
# ✅ Solution: Multi-stage build with proper caching
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

#### **Problem**: Environment variable issues
```bash
# ✅ Environment Configuration

1. Check environment files:
   # Verify .env files exist and have correct values
   .env.local          # Local development
   .env.production     # Production settings
   .env.example        # Template file

2. Validate required variables:
   # Add validation in next.config.js
   const requiredEnvVars = [
     'DATABASE_URL',
     'NEXTAUTH_SECRET',
     'OPENAI_API_KEY'
   ];
   
   requiredEnvVars.forEach(envVar => {
     if (!process.env[envVar]) {
       throw new Error(`Missing required environment variable: ${envVar}`);
     }
   });

3. Check Docker environment:
   # Verify environment variables are passed to container
   docker run --env-file .env.production your-image

4. Debug environment loading:
   # Add temporary logging (remove in production)
   console.log('Environment check:', {
     NODE_ENV: process.env.NODE_ENV,
     DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Missing'
   });
```

## 🔧 Debug Tools & Commands

### **Development Debugging**
```bash
# Check application health
npm run health-check

# View detailed logs
npm run logs:dev          # Development logs
npm run logs:error        # Error logs only
npm run logs:database     # Database query logs

# Database debugging
npx prisma studio         # Visual database browser
npx prisma db seed        # Reseed database
npx prisma migrate status # Check migration status

# Performance profiling
npm run build -- --profile
npm run analyze           # Bundle analyzer

# Clean and reset
npm run clean            # Clean build files
npm run reset:dev        # Full development reset
npm run reset:db         # Reset database only
```

### **Production Debugging**
```bash
# Health checks
curl https://your-domain.com/api/health
curl https://your-domain.com/api/health/database

# Check server logs
docker logs ai-ivr-container --tail=100 --follow

# Database connection test
docker exec -it postgres-container psql -U user -d aiivr -c "SELECT 1;"

# Monitor resource usage
docker stats ai-ivr-container

# Check environment variables
docker exec ai-ivr-container env | grep -E "(DATABASE|OPENAI|AUTH)"
```

## 📞 Getting Help

### **Internal Support Channels**

#### **🆘 Immediate Help (Critical Issues)**
- **Slack**: `#ai-ivr-emergency`
- **Phone**: Internal support hotline
- **Email**: `support@company.com`
- **On-Call**: Escalate to on-call engineer

#### **📋 General Support (Non-Critical)**
- **Slack**: `#ai-ivr-support`
- **Tickets**: Internal ticketing system
- **Office Hours**: Daily 9-11 AM, 3-5 PM
- **Documentation**: Check knowledge base first

#### **💡 Development Questions**
- **Slack**: `#ai-ivr-dev`
- **Code Reviews**: GitHub PR reviews
- **Architecture**: Weekly architecture reviews
- **Training**: Monthly lunch-and-learns

### **External Support Resources**

#### **📚 Official Documentation**
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [prisma.io/docs](https://prisma.io/docs)
- **TypeScript**: [typescriptlang.org/docs](https://typescriptlang.org/docs)
- **OpenAI**: [platform.openai.com/docs](https://platform.openai.com/docs)

#### **🏗️ Community Support**
- **Stack Overflow**: Tag questions appropriately
- **GitHub Discussions**: For open-source components
- **Reddit**: r/nextjs, r/typescript communities
- **Discord**: Official framework Discord servers

### **📝 Reporting Issues**

#### **Bug Report Template**
```markdown
## Bug Report

### Environment
- OS: Windows 11
- Node.js: 18.17.0
- Browser: Chrome 118.0.0.0
- Deployment: Local/Staging/Production

### Steps to Reproduce
1. Go to...
2. Click on...
3. See error...

### Expected Behavior
What should happen...

### Actual Behavior
What actually happens...

### Screenshots/Logs
[Attach screenshots or paste logs here]

### Additional Context
Any other relevant information...
```

#### **Feature Request Template**
```markdown
## Feature Request

### Problem Statement
What problem does this solve?

### Proposed Solution
How should this work?

### Alternative Solutions
What other approaches did you consider?

### User Impact
Who benefits and how?

### Technical Considerations
Any technical constraints or requirements?
```

## 📊 Monitoring & Alerting

### **Key Metrics to Monitor**
```yaml
Application Health:
  - Response Time: < 200ms average
  - Error Rate: < 1%
  - Uptime: > 99.9%
  - Memory Usage: < 80%

AI Agent Performance:
  - Response Time: < 500ms
  - Success Rate: > 95%
  - Token Usage: Monitor costs
  - Queue Length: < 10 pending

Database Performance:
  - Connection Pool: < 80% utilization
  - Query Time: < 100ms average
  - Deadlocks: 0 per hour
  - Disk Usage: < 85%

User Experience:
  - Page Load Time: < 2s
  - Session Duration: Track engagement
  - Conversion Rate: Monitor success
  - User Satisfaction: > 4.0/5
```

### **Alert Thresholds**
```yaml
Critical Alerts (Immediate Response):
  - System Down: 0% availability
  - High Error Rate: > 5% errors
  - Database Down: Connection failures
  - Security Breach: Unauthorized access

Warning Alerts (30min Response):
  - High Response Time: > 1s average
  - Memory Usage: > 85%
  - Disk Space: > 90%
  - API Rate Limits: Approaching limits

Info Alerts (Next Business Day):
  - Performance Degradation: > 500ms average
  - Resource Usage: > 70%
  - Deployment Status: Success/failure notifications
  - User Feedback: Low satisfaction ratings
```

---

**Remember**: When in doubt, don't hesitate to ask for help. The team is here to support you, and it's better to ask questions than to struggle alone or risk breaking something.