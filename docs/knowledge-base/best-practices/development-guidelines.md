# 🎯 Development Guidelines

Comprehensive development standards and practices for building maintainable, scalable, and high-quality AI IVR v2 applications.

## 📋 Core Development Principles

### **1. Code Quality Standards**
```typescript
// ✅ Good: Clean, readable, well-documented code
/**
 * Creates a new AI agent with specified configuration
 * @param config - Agent configuration including name, model, and behavior settings
 * @param userId - ID of the user creating the agent
 * @returns Promise resolving to the created agent
 * @throws AgentCreationError if configuration is invalid
 */
async function createAIAgent(
  config: AgentConfiguration, 
  userId: string
): Promise<Agent> {
  // Validate input parameters
  if (!config.name || config.name.trim().length === 0) {
    throw new AgentCreationError('Agent name is required');
  }
  
  // Sanitize and validate configuration
  const sanitizedConfig = await validateAndSanitizeConfig(config);
  
  // Create agent with proper error handling
  try {
    const agent = await agentService.create({
      ...sanitizedConfig,
      createdBy: userId,
      createdAt: new Date(),
      status: 'inactive' // Start inactive for safety
    });
    
    // Log successful creation
    logger.info('Agent created successfully', { 
      agentId: agent.id, 
      userId,
      agentName: agent.name 
    });
    
    return agent;
  } catch (error) {
    logger.error('Failed to create agent', { error, config, userId });
    throw new AgentCreationError(`Failed to create agent: ${error.message}`);
  }
}

// ❌ Avoid: Unclear, undocumented code
async function makeAgent(cfg: any, user: string): Promise<any> {
  const agent = await agentService.create(cfg);
  return agent;
}
```

### **2. TypeScript Best Practices**
```typescript
// ✅ Good: Proper type definitions and usage

// Define comprehensive interfaces
interface AgentConfiguration {
  readonly name: string;
  readonly description?: string;
  readonly model: AIModel;
  readonly systemPrompt: string;
  readonly maxTokens?: number;
  readonly temperature?: number;
  readonly language: SupportedLanguage;
  readonly capabilities: readonly AgentCapability[];
}

// Use discriminated unions for type safety
type AIModel = 
  | { provider: 'openai'; model: 'gpt-4' | 'gpt-3.5-turbo' }
  | { provider: 'anthropic'; model: 'claude-3-opus' | 'claude-3-sonnet' }
  | { provider: 'local'; model: string; endpoint: string };

// Implement type guards
function isValidAIModel(model: unknown): model is AIModel {
  return (
    typeof model === 'object' &&
    model !== null &&
    'provider' in model &&
    'model' in model &&
    ['openai', 'anthropic', 'local'].includes((model as any).provider)
  );
}

// Use generics for reusable types
interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: string;
  readonly timestamp: Date;
}

// ❌ Avoid: Weak typing and any usage
interface Config {
  name: string;
  other: any; // Don't use any
}

function processData(data: any): any {
  return data.something;
}
```

### **3. Error Handling Standards**
```typescript
// ✅ Good: Comprehensive error handling

// Define custom error classes
export class AgentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class ValidationError extends AgentError {
  constructor(field: string, value: unknown) {
    super(
      `Validation failed for field "${field}"`,
      'VALIDATION_ERROR',
      { field, value }
    );
  }
}

// Implement proper error handling
async function processUserInput(input: string): Promise<ProcessedInput> {
  try {
    // Validate input
    if (!input || typeof input !== 'string') {
      throw new ValidationError('input', input);
    }
    
    // Sanitize input
    const sanitized = sanitizeInput(input);
    if (sanitized.length === 0) {
      throw new ValidationError('input', 'Input cannot be empty after sanitization');
    }
    
    // Process with timeout
    const result = await Promise.race([
      nlpService.process(sanitized),
      timeoutPromise(5000) // 5 second timeout
    ]);
    
    return result;
    
  } catch (error) {
    // Log error with context
    logger.error('Failed to process user input', {
      error: error.message,
      input: input?.substring(0, 100), // Truncate for logging
      stack: error.stack
    });
    
    // Re-throw with appropriate error type
    if (error instanceof ValidationError) {
      throw error;
    } else if (error instanceof TimeoutError) {
      throw new AgentError('Input processing timeout', 'TIMEOUT_ERROR');
    } else {
      throw new AgentError('Input processing failed', 'PROCESSING_ERROR');
    }
  }
}

// ❌ Avoid: Generic error handling
async function processInput(input: string) {
  try {
    return await nlpService.process(input);
  } catch (error) {
    console.log('Error:', error);
    throw error;
  }
}
```

### **4. Security Implementation**
```typescript
// ✅ Good: Security-first approach

import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

// Input validation middleware
export const validateAgentCreation = [
  body('name')
    .isLength({ min: 1, max: 100 })
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .trim()
    .escape(),
  body('systemPrompt')
    .isLength({ min: 10, max: 5000 })
    .trim(),
  body('model.provider')
    .isIn(['openai', 'anthropic', 'local']),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

// Rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Secure data encryption
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  
  async encrypt(text: string, key: string): Promise<string> {
    const iv = crypto.randomBytes(this.ivLength);
    const derivedKey = crypto.scryptSync(key, 'salt', this.keyLength);
    
    const cipher = crypto.createCipher(this.algorithm, derivedKey);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }
  
  async decrypt(encryptedData: string, key: string): Promise<string> {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const derivedKey = crypto.scryptSync(key, 'salt', this.keyLength);
    
    const decipher = crypto.createDecipher(this.algorithm, derivedKey);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// ❌ Avoid: Weak security practices
// No input validation
app.post('/agent', (req, res) => {
  const agent = agentService.create(req.body); // Direct use without validation
  res.json(agent);
});

// Weak encryption
function simpleEncrypt(text: string): string {
  return Buffer.from(text).toString('base64'); // Not secure!
}
```

## 🏗️ Architecture Guidelines

### **Component Organization**
```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── dialog.tsx
│   ├── features/           # Feature-specific components
│   │   ├── ai-agents/
│   │   ├── ivr-flows/
│   │   └── analytics/
│   └── layout/            # Layout components
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
├── features/              # Feature modules
│   ├── auth/
│   ├── agents/
│   └── flows/
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # API services
├── types/                 # TypeScript definitions
└── utils/                 # Helper functions
```

### **Component Design Patterns**
```tsx
// ✅ Good: Well-structured React component

interface AgentCardProps {
  readonly agent: Agent;
  readonly onEdit?: (agent: Agent) => void;
  readonly onDelete?: (agentId: string) => void;
  readonly className?: string;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onEdit,
  onDelete,
  className
}) => {
  // Local state management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom hooks for business logic
  const { updateAgentStatus } = useAgentOperations();
  const { formatLastActivity } = useDateFormatting();
  
  // Event handlers
  const handleStatusToggle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await updateAgentStatus(agent.id, agent.status === 'active' ? 'inactive' : 'active');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [agent.id, agent.status, updateAgentStatus]);
  
  const handleEdit = useCallback(() => {
    onEdit?.(agent);
  }, [agent, onEdit]);
  
  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${agent.name}"?`)) {
      onDelete?.(agent.id);
    }
  }, [agent.id, agent.name, onDelete]);
  
  // Render with proper accessibility
  return (
    <Card className={cn('agent-card', className)} data-testid="agent-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {agent.name}
          </CardTitle>
          <Badge 
            variant={agent.status === 'active' ? 'success' : 'secondary'}
            aria-label={`Agent status: ${agent.status}`}
          >
            {agent.status}
          </Badge>
        </div>
        {agent.description && (
          <CardDescription className="mt-2">
            {agent.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Model:</span> {agent.model.provider} - {agent.model.model}
          </div>
          <div>
            <span className="font-medium">Language:</span> {agent.language}
          </div>
          <div>
            <span className="font-medium">Last Activity:</span> {formatLastActivity(agent.lastActivity)}
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleStatusToggle}
          disabled={isLoading}
          aria-label={`${agent.status === 'active' ? 'Deactivate' : 'Activate'} agent`}
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {agent.status === 'active' ? 'Deactivate' : 'Activate'}
        </Button>
        
        {onEdit && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            aria-label="Edit agent"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
        
        {onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            aria-label="Delete agent"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

// ❌ Avoid: Poorly structured component
export const AgentCard = ({ agent, onEdit, onDelete }) => {
  const [loading, setLoading] = useState(false);
  
  return (
    <div className="card">
      <h3>{agent.name}</h3>
      <p>{agent.description}</p>
      <button onClick={() => onEdit(agent)}>Edit</button>
      <button onClick={() => onDelete(agent.id)}>Delete</button>
    </div>
  );
};
```

### **API Design Patterns**
```typescript
// ✅ Good: Well-structured API routes

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

// Request validation schema
const createAgentSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional(),
  model: z.object({
    provider: z.enum(['openai', 'anthropic', 'local']),
    model: z.string().min(1)
  }),
  systemPrompt: z.string().min(10).max(5000),
  language: z.enum(['en', 'ml', 'hi']),
  capabilities: z.array(z.string()).max(10)
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = request.ip ?? 'anonymous';
    const rateLimitResult = await rateLimit(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
    
    // Authentication
    const session = await auth(request);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Authorization
    if (!session.user.permissions.includes('create:agents')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
    
    // Request parsing and validation
    const body = await request.json();
    const validatedData = createAgentSchema.parse(body);
    
    // Business logic
    const agent = await agentService.create({
      ...validatedData,
      createdBy: session.user.id,
      organizationId: session.user.organizationId
    });
    
    // Response
    return NextResponse.json({
      success: true,
      data: agent,
      message: 'Agent created successfully'
    }, { status: 201 });
    
  } catch (error) {
    // Error handling
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 });
    }
    
    if (error instanceof AgentCreationError) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }
    
    // Log unexpected errors
    logger.error('Unexpected error in POST /api/agents', {
      error: error.message,
      stack: error.stack,
      userId: session?.user?.id
    });
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// ❌ Avoid: Poorly structured API
export async function POST(request: NextRequest) {
  const body = await request.json();
  const agent = await agentService.create(body);
  return NextResponse.json(agent);
}
```

## 📊 Performance Guidelines

### **Database Optimization**
```typescript
// ✅ Good: Optimized database queries

// Use proper indexing
model Agent {
  id          String   @id @default(cuid())
  name        String   
  status      String   @default("inactive")
  createdBy   String
  createdAt   DateTime @default(now())
  
  // Indexes for common queries
  @@index([status, createdBy]) // Compound index
  @@index([createdAt])         // Temporal queries
  @@index([name])              // Search queries
}

// Efficient querying with proper selection
async function getActiveAgents(userId: string, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  
  return await prisma.agent.findMany({
    where: {
      status: 'active',
      createdBy: userId
    },
    select: {
      id: true,
      name: true,
      status: true,
      lastActivity: true,
      _count: {
        select: {
          conversations: true
        }
      }
    },
    orderBy: {
      lastActivity: 'desc'
    },
    skip: offset,
    take: limit
  });
}

// Batch operations for efficiency
async function updateMultipleAgents(agentIds: string[], updates: Partial<Agent>) {
  return await prisma.$transaction([
    prisma.agent.updateMany({
      where: { id: { in: agentIds } },
      data: updates
    }),
    prisma.auditLog.create({
      data: {
        action: 'bulk_update',
        resourceType: 'agent',
        resourceIds: agentIds,
        changes: updates
      }
    })
  ]);
}

// ❌ Avoid: Inefficient queries
// N+1 problem
const agents = await prisma.agent.findMany();
for (const agent of agents) {
  const conversations = await prisma.conversation.findMany({
    where: { agentId: agent.id }
  });
  // Process conversations...
}

// Missing indexes and unnecessary data
const agents = await prisma.agent.findMany({
  include: {
    conversations: {
      include: {
        messages: true // Too much data
      }
    }
  }
});
```

### **Frontend Optimization**
```tsx
// ✅ Good: Optimized React components

import { memo, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface AgentListProps {
  agents: Agent[];
  onSelect: (agent: Agent) => void;
}

// Memoized component to prevent unnecessary re-renders
export const AgentList = memo<AgentListProps>(({ agents, onSelect }) => {
  // Memoize filtered and sorted data
  const processedAgents = useMemo(() => {
    return agents
      .filter(agent => agent.status === 'active')
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }, [agents]);
  
  // Stable callback reference
  const handleSelect = useCallback((agent: Agent) => {
    onSelect(agent);
  }, [onSelect]);
  
  // Virtual scrolling for large lists
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: processedAgents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated item height
    overscan: 5
  });
  
  return (
    <div
      ref={parentRef}
      className="h-96 overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const agent = processedAgents[virtualItem.index];
          
          return (
            <div
              key={agent.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: virtualItem.size,
                transform: `translateY(${virtualItem.start}px)`
              }}
            >
              <AgentCard
                agent={agent}
                onSelect={handleSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

AgentList.displayName = 'AgentList';

// ❌ Avoid: Unoptimized components
export const AgentList = ({ agents, onSelect }) => {
  return (
    <div>
      {agents.map(agent => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onSelect={() => onSelect(agent)}
        />
      ))}
    </div>
  );
};
```

## 🧪 Testing Standards

### **Unit Testing**
```typescript
// ✅ Good: Comprehensive unit tests

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentCard } from './AgentCard';
import { mockAgent } from '@/test/fixtures';

describe('AgentCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders agent information correctly', () => {
    render(
      <AgentCard
        agent={mockAgent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(mockAgent.name)).toBeInTheDocument();
    expect(screen.getByText(mockAgent.description)).toBeInTheDocument();
    expect(screen.getByLabelText(`Agent status: ${mockAgent.status}`)).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <AgentCard
        agent={mockAgent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const editButton = screen.getByLabelText('Edit agent');
    await user.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockAgent);
  });
  
  it('shows confirmation dialog before deleting', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(
      <AgentCard
        agent={mockAgent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByLabelText('Delete agent');
    await user.click(deleteButton);
    
    expect(confirmSpy).toHaveBeenCalledWith(
      `Are you sure you want to delete "${mockAgent.name}"?`
    );
    expect(mockOnDelete).toHaveBeenCalledWith(mockAgent.id);
    
    confirmSpy.mockRestore();
  });
  
  it('handles status toggle with loading state', async () => {
    const user = userEvent.setup();
    const mockUpdateStatus = vi.fn().mockResolvedValue(undefined);
    
    // Mock the hook
    vi.mock('@/hooks/useAgentOperations', () => ({
      useAgentOperations: () => ({
        updateAgentStatus: mockUpdateStatus
      })
    }));
    
    render(<AgentCard agent={mockAgent} />);
    
    const toggleButton = screen.getByLabelText('Activate agent');
    await user.click(toggleButton);
    
    // Check loading state
    expect(screen.getByRole('button', { name: /activate agent/i })).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    
    // Wait for operation to complete
    await waitFor(() => {
      expect(mockUpdateStatus).toHaveBeenCalledWith(mockAgent.id, 'active');
    });
  });
  
  it('displays error message on status toggle failure', async () => {
    const user = userEvent.setup();
    const mockUpdateStatus = vi.fn().mockRejectedValue(new Error('Update failed'));
    
    vi.mock('@/hooks/useAgentOperations', () => ({
      useAgentOperations: () => ({
        updateAgentStatus: mockUpdateStatus
      })
    }));
    
    render(<AgentCard agent={mockAgent} />);
    
    const toggleButton = screen.getByLabelText('Activate agent');
    await user.click(toggleButton);
    
    await waitFor(() => {
      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });
  });
});

// Test fixtures
// test/fixtures/agent.ts
export const mockAgent: Agent = {
  id: 'agent-123',
  name: 'Test Agent',
  description: 'A test agent for unit testing',
  status: 'inactive' as const,
  model: {
    provider: 'openai' as const,
    model: 'gpt-4'
  },
  language: 'en' as const,
  systemPrompt: 'You are a helpful assistant',
  createdBy: 'user-123',
  createdAt: new Date('2023-01-01'),
  lastActivity: new Date('2023-01-02')
};
```

### **Integration Testing**
```typescript
// ✅ Good: API integration tests

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { testClient } from '@/test/client';
import { createTestUser, createTestAgent } from '@/test/factories';
import { cleanupDatabase } from '@/test/helpers';

describe('Agent API Integration', () => {
  let testUser: User;
  let authToken: string;
  
  beforeAll(async () => {
    testUser = await createTestUser();
    authToken = await testClient.auth.login(testUser.email, testUser.password);
  });
  
  afterAll(async () => {
    await cleanupDatabase();
  });
  
  describe('POST /api/agents', () => {
    it('creates agent with valid data', async () => {
      const agentData = {
        name: 'Integration Test Agent',
        description: 'Test agent for integration testing',
        model: { provider: 'openai', model: 'gpt-4' },
        systemPrompt: 'You are a helpful assistant for testing',
        language: 'en',
        capabilities: ['conversation', 'analysis']
      };
      
      const response = await testClient.post('/api/agents', {
        headers: { Authorization: `Bearer ${authToken}` },
        body: agentData
      });
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toMatchObject({
        name: agentData.name,
        description: agentData.description,
        status: 'inactive'
      });
    });
    
    it('returns validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        model: { provider: 'invalid' }, // Invalid provider
        systemPrompt: 'Too short' // Invalid: too short
      };
      
      const response = await testClient.post('/api/agents', {
        headers: { Authorization: `Bearer ${authToken}` },
        body: invalidData
      });
      
      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
      expect(response.data.error).toBe('Validation failed');
      expect(response.data.details).toHaveLength(3);
    });
    
    it('requires authentication', async () => {
      const response = await testClient.post('/api/agents', {
        body: { name: 'Test' }
      });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('GET /api/agents', () => {
    it('returns paginated agents for authenticated user', async () => {
      // Create test agents
      await Promise.all([
        createTestAgent({ createdBy: testUser.id, name: 'Agent 1' }),
        createTestAgent({ createdBy: testUser.id, name: 'Agent 2' }),
        createTestAgent({ createdBy: testUser.id, name: 'Agent 3' })
      ]);
      
      const response = await testClient.get('/api/agents?page=1&limit=2', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toHaveLength(2);
      expect(response.data.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2
      });
    });
  });
});
```

---

**Next**: Continue with [Performance Optimization](./performance-optimization.md) for advanced performance tuning techniques.