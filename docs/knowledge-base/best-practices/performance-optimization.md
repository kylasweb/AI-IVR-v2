# 📊 Performance Optimization

Advanced strategies and techniques for optimizing AI IVR v2 performance across frontend, backend, and database layers.

## 🎯 Performance Goals & Metrics

### **Target Performance Standards**
```yaml
User Interface:
  - Initial Page Load: < 2s (3G network)
  - Time to Interactive: < 3s
  - First Contentful Paint: < 1.5s
  - Largest Contentful Paint: < 2.5s
  - Cumulative Layout Shift: < 0.1

API Performance:
  - Simple Queries: < 100ms average
  - Complex Operations: < 500ms average
  - AI Agent Responses: < 800ms average
  - File Uploads: < 5s for 10MB
  
Real-time Features:
  - WebSocket Connection: < 50ms
  - Message Delivery: < 100ms
  - Status Updates: < 200ms
  
Database Performance:
  - Simple Queries: < 50ms
  - Join Queries: < 200ms
  - Full-text Search: < 300ms
  - Bulk Operations: < 2s per 1000 records
```

### **Monitoring Setup**
```typescript
// Performance monitoring implementation
import { NextResponse } from 'next/server';
import { performance } from 'perf_hooks';

// Middleware for API performance tracking
export async function middleware(request: Request) {
  const startTime = performance.now();
  
  const response = await NextResponse.next();
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Log slow requests
  if (duration > 500) {
    console.warn(`Slow API request: ${request.url} took ${duration.toFixed(2)}ms`);
  }
  
  // Add performance headers
  response.headers.set('X-Response-Time', `${duration.toFixed(2)}ms`);
  
  return response;
}

// Client-side performance tracking
class PerformanceTracker {
  static trackPageLoad(pageName: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const metrics = {
          page: pageName,
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
        
        // Send to analytics
        analytics.track('page_performance', metrics);
      });
    }
  }
  
  static trackAPICall(url: string, duration: number, success: boolean) {
    analytics.track('api_performance', {
      url,
      duration,
      success,
      timestamp: Date.now()
    });
  }
}
```

## 🚀 Frontend Optimization

### **Next.js App Router Optimization**
```typescript
// app/layout.tsx - Optimized root layout
import { Inter } from 'next/font/google';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: {
    template: '%s | AI IVR v2',
    default: 'AI IVR v2 - Intelligent Voice Response Platform'
  },
  description: 'Advanced AI-powered Interactive Voice Response system',
  keywords: ['AI', 'IVR', 'Voice Response', 'Automation'],
  openGraph: {
    title: 'AI IVR v2',
    description: 'Intelligent Voice Response Platform',
    type: 'website',
    locale: 'en_US',
    siteName: 'AI IVR v2'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        
        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { margin: 0; font-family: var(--font-inter), sans-serif; }
            .loading-spinner { animation: spin 1s linear infinite; }
            @keyframes spin { to { transform: rotate(360deg); } }
          `
        }} />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
```

### **Component-Level Optimization**
```tsx
// Optimized component with multiple performance techniques
import { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Lazy load heavy components
const AgentAnalytics = lazy(() => import('./AgentAnalytics'));
const ConversationLogs = lazy(() => import('./ConversationLogs'));

interface AgentDashboardProps {
  agents: Agent[];
  selectedAgentId?: string;
  onAgentSelect: (agentId: string) => void;
}

// Memoized component to prevent unnecessary re-renders
export const AgentDashboard = memo<AgentDashboardProps>(({
  agents,
  selectedAgentId,
  onAgentSelect
}) => {
  // Memoize expensive computations
  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      // Sort by activity, then by name
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1;
      }
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });
  }, [agents]);
  
  const agentStats = useMemo(() => {
    return agents.reduce((stats, agent) => {
      stats.total++;
      stats[agent.status] = (stats[agent.status] || 0) + 1;
      return stats;
    }, { total: 0, active: 0, inactive: 0 } as Record<string, number>);
  }, [agents]);
  
  // Stable callback references
  const handleAgentClick = useCallback((agentId: string) => {
    onAgentSelect(agentId);
  }, [onAgentSelect]);
  
  // Virtual scrolling for large lists
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: sortedAgents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 5,
    getItemKey: (index) => sortedAgents[index].id
  });
  
  // Intersection observer for lazy loading
  const { ref: lazyRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });
  
  return (
    <div className="h-full flex flex-col">
      {/* Stats Header - Always visible */}
      <div className="flex-shrink-0 grid grid-cols-3 gap-4 p-4 border-b">
        <StatCard title="Total Agents" value={agentStats.total} />
        <StatCard title="Active" value={agentStats.active} variant="success" />
        <StatCard title="Inactive" value={agentStats.inactive} variant="neutral" />
      </div>
      
      {/* Virtual scrolling agent list */}
      <div 
        ref={parentRef}
        className="flex-1 overflow-auto"
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
            const agent = sortedAgents[virtualItem.index];
            
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
                <AgentListItem
                  agent={agent}
                  isSelected={agent.id === selectedAgentId}
                  onClick={handleAgentClick}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Lazy loaded sections */}
      <div ref={lazyRef} className="flex-shrink-0">
        {isIntersecting && (
          <Suspense fallback={<div className="p-4">Loading analytics...</div>}>
            <AgentAnalytics agents={sortedAgents} />
          </Suspense>
        )}
      </div>
      
      {selectedAgentId && (
        <Suspense fallback={<div className="p-4">Loading conversation logs...</div>}>
          <ConversationLogs agentId={selectedAgentId} />
        </Suspense>
      )}
    </div>
  );
});

AgentDashboard.displayName = 'AgentDashboard';

// Memoized list item component
const AgentListItem = memo<{
  agent: Agent;
  isSelected: boolean;
  onClick: (agentId: string) => void;
}>(({ agent, isSelected, onClick }) => {
  const handleClick = useCallback(() => {
    onClick(agent.id);
  }, [agent.id, onClick]);
  
  return (
    <div
      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{agent.name}</h4>
          <p className="text-sm text-gray-500 truncate">{agent.description}</p>
        </div>
        <StatusBadge status={agent.status} />
      </div>
    </div>
  );
});
```

### **Image and Asset Optimization**
```tsx
// Optimized image handling
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500 text-sm">Image failed to load</span>
      </div>
    );
  }
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkbHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyejrATv/Z"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        style={{
          objectFit: 'cover',
          transition: 'opacity 0.3s ease-in-out'
        }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
};

// next.config.js - Image optimization configuration
module.exports = {
  images: {
    domains: ['example.com', 'cdn.example.com'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Enable compression
  compress: true,
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  }
}
```

## 🔄 API & Backend Optimization

### **Database Query Optimization**
```typescript
// Optimized Prisma queries with performance best practices
class OptimizedAgentService {
  // Use connection pooling
  private prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20'
      }
    }
  });
  
  // Efficient pagination with cursor-based approach
  async getAgentsPaginated(
    cursor?: string,
    limit = 20,
    userId?: string
  ): Promise<{ agents: Agent[]; nextCursor?: string }> {
    const agents = await this.prisma.agent.findMany({
      where: userId ? { createdBy: userId } : undefined,
      select: {
        id: true,
        name: true,
        status: true,
        createdAt: true,
        lastActivity: true,
        // Use _count for efficient counting
        _count: {
          select: {
            conversations: true,
            messages: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1, // Take one extra to determine if there's a next page
      skip: cursor ? 1 : 0
    });
    
    const hasNextPage = agents.length > limit;
    if (hasNextPage) agents.pop(); // Remove the extra item
    
    return {
      agents,
      nextCursor: hasNextPage ? agents[agents.length - 1].id : undefined
    };
  }
  
  // Batch operations for efficiency
  async updateMultipleAgentStatuses(
    agentIds: string[],
    status: 'active' | 'inactive',
    userId: string
  ): Promise<void> {
    await this.prisma.$transaction([
      // Update agents
      this.prisma.agent.updateMany({
        where: {
          id: { in: agentIds },
          createdBy: userId // Security check
        },
        data: { 
          status,
          updatedAt: new Date()
        }
      }),
      
      // Log the bulk operation
      this.prisma.auditLog.create({
        data: {
          action: 'bulk_status_update',
          resourceType: 'agent',
          resourceIds: agentIds,
          userId,
          metadata: { newStatus: status }
        }
      })
    ]);
  }
  
  // Optimized search with full-text search
  async searchAgents(
    query: string,
    userId: string,
    limit = 20
  ): Promise<Agent[]> {
    // Use database-specific full-text search for better performance
    return await this.prisma.$queryRaw`
      SELECT id, name, description, status, created_at as "createdAt"
      FROM agents 
      WHERE created_by = ${userId}
        AND (
          to_tsvector('english', name || ' ' || COALESCE(description, '')) 
          @@ plainto_tsquery('english', ${query})
        )
      ORDER BY 
        ts_rank(
          to_tsvector('english', name || ' ' || COALESCE(description, '')), 
          plainto_tsquery('english', ${query})
        ) DESC
      LIMIT ${limit}
    `;
  }
  
  // Efficient aggregation queries
  async getAgentStatistics(userId: string): Promise<AgentStats> {
    const [stats] = await this.prisma.$queryRaw<AgentStats[]>`
      SELECT 
        COUNT(*) as total_agents,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_agents,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_agents,
        AVG(
          CASE WHEN last_activity IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (NOW() - last_activity)) / 3600 
          END
        ) as avg_hours_since_activity,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as created_this_week
      FROM agents 
      WHERE created_by = ${userId}
    `;
    
    return stats;
  }
}
```

### **Caching Strategies**
```typescript
// Multi-level caching implementation
import { Redis } from '@upstash/redis';
import { LRUCache } from 'lru-cache';

class CachingService {
  private redis = new Redis({
    url: process.env.REDIS_URL!,
    token: process.env.REDIS_TOKEN!,
  });
  
  // In-memory cache for frequently accessed data
  private memoryCache = new LRUCache<string, any>({
    max: 500, // Maximum items
    ttl: 1000 * 60 * 5, // 5 minutes TTL
    allowStale: true,
    updateAgeOnGet: true
  });
  
  // L1: Memory cache (fastest)
  // L2: Redis cache (fast)
  // L3: Database (slowest)
  async get<T>(key: string, fetchFunction?: () => Promise<T>): Promise<T | null> {
    // Try memory cache first
    const memoryResult = this.memoryCache.get(key);
    if (memoryResult !== undefined) {
      return memoryResult as T;
    }
    
    // Try Redis cache
    const redisResult = await this.redis.get(key);
    if (redisResult !== null) {
      // Store in memory cache for next time
      this.memoryCache.set(key, redisResult);
      return redisResult as T;
    }
    
    // Fetch from source if function provided
    if (fetchFunction) {
      const freshData = await fetchFunction();
      if (freshData !== null && freshData !== undefined) {
        await this.set(key, freshData, 300); // 5 minutes
        return freshData;
      }
    }
    
    return null;
  }
  
  async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    // Set in both caches
    this.memoryCache.set(key, value);
    await this.redis.setex(key, ttlSeconds, value);
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Clear memory cache items matching pattern
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear Redis cache
    const keys = await this.redis.keys(`*${pattern}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  
  // Cache warming for critical data
  async warmCache(): Promise<void> {
    const criticalData = [
      { key: 'system:config', fetcher: () => this.getSystemConfig() },
      { key: 'ai:models', fetcher: () => this.getAvailableModels() },
      { key: 'system:stats', fetcher: () => this.getSystemStats() }
    ];
    
    await Promise.all(
      criticalData.map(({ key, fetcher }) => 
        this.get(key, fetcher)
      )
    );
  }
}

// Cache-aware API route
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const cacheKey = `user:${params.userId}:agents`;
  
  try {
    const cachedAgents = await cachingService.get(
      cacheKey,
      async () => {
        return await agentService.getUserAgents(params.userId);
      }
    );
    
    return NextResponse.json({
      success: true,
      data: cachedAgents,
      cached: true
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

// Cache invalidation on updates
export async function PUT(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  try {
    const updatedAgent = await agentService.updateAgent(params.agentId, updates);
    
    // Invalidate related cache entries
    await cachingService.invalidate(`user:${updatedAgent.createdBy}:agents`);
    await cachingService.invalidate(`agent:${params.agentId}`);
    
    return NextResponse.json({
      success: true,
      data: updatedAgent
    });
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}
```

### **Request Optimization**
```typescript
// Request batching and deduplication
class RequestOptimizer {
  private batchQueue = new Map<string, Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>>();
  
  private batchTimeout: NodeJS.Timeout | null = null;
  
  // Batch multiple requests into single database call
  async batchGetAgents(agentIds: string[]): Promise<Agent[]> {
    return new Promise((resolve, reject) => {
      const batchKey = 'get-agents';
      
      if (!this.batchQueue.has(batchKey)) {
        this.batchQueue.set(batchKey, []);
      }
      
      this.batchQueue.get(batchKey)!.push({ resolve, reject });
      
      // Clear existing timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      // Set new timeout to process batch
      this.batchTimeout = setTimeout(() => {
        this.processBatch(batchKey, agentIds);
      }, 10); // Wait 10ms to collect more requests
    });
  }
  
  private async processBatch(batchKey: string, agentIds: string[]): Promise<void> {
    const requests = this.batchQueue.get(batchKey) || [];
    this.batchQueue.delete(batchKey);
    
    try {
      // Single database call for all requested agents
      const agents = await prisma.agent.findMany({
        where: { id: { in: agentIds } },
        select: {
          id: true,
          name: true,
          status: true,
          description: true,
          createdAt: true
        }
      });
      
      // Resolve all pending requests
      requests.forEach(({ resolve }) => resolve(agents));
      
    } catch (error) {
      // Reject all pending requests
      requests.forEach(({ reject }) => reject(error));
    }
  }
}

// Request deduplication
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // If request is already pending, return the same promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }
    
    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
}

// Usage in API routes
const requestOptimizer = new RequestOptimizer();
const deduplicator = new RequestDeduplicator();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const agentIds = searchParams.get('ids')?.split(',') || [];
  
  // Deduplicate identical requests
  const cacheKey = `agents:${agentIds.sort().join(',')}`;
  
  const agents = await deduplicator.dedupe(cacheKey, async () => {
    return await requestOptimizer.batchGetAgents(agentIds);
  });
  
  return NextResponse.json({ success: true, data: agents });
}
```

## 🗄️ Database Performance Tuning

### **Index Optimization**
```sql
-- Prisma schema with optimized indexes
model Agent {
  id          String   @id @default(cuid())
  name        String   
  description String?  
  status      String   @default("inactive")
  createdBy   String   
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  lastActivity DateTime?
  
  conversations Conversation[]
  
  // Compound indexes for common query patterns
  @@index([status, createdBy], name: "idx_agent_status_user")
  @@index([createdBy, createdAt], name: "idx_agent_user_created")
  @@index([lastActivity], name: "idx_agent_activity")
  @@index([name], name: "idx_agent_name") // For search
  
  // Partial index for active agents only (PostgreSQL)
  @@index([createdBy], name: "idx_active_agents", where: { status: "active" })
}

model Conversation {
  id        String   @id @default(cuid())
  agentId   String   
  userId    String?  
  status    String   @default("active")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  agent    Agent      @relation(fields: [agentId], references: [id], onDelete: Cascade)
  messages Message[]
  
  // Optimized indexes
  @@index([agentId, status], name: "idx_conv_agent_status")
  @@index([userId, createdAt], name: "idx_conv_user_created")
  @@index([createdAt], name: "idx_conv_created") // For time-based queries
}

model Message {
  id             String   @id @default(cuid())
  conversationId String   
  content        String   
  role           String   // 'user', 'assistant', 'system'
  createdAt      DateTime @default(now())
  
  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  // Indexes for message retrieval
  @@index([conversationId, createdAt], name: "idx_msg_conv_time")
  @@index([role, createdAt], name: "idx_msg_role_time")
}
```

### **Query Performance Monitoring**
```typescript
// Database performance monitoring
class DatabaseMonitor {
  private queryStats = new Map<string, {
    count: number;
    totalTime: number;
    maxTime: number;
    avgTime: number;
  }>();
  
  // Monitor slow queries
  logQuery(query: string, duration: number, params?: any[]): void {
    const normalizedQuery = this.normalizeQuery(query);
    
    if (!this.queryStats.has(normalizedQuery)) {
      this.queryStats.set(normalizedQuery, {
        count: 0,
        totalTime: 0,
        maxTime: 0,
        avgTime: 0
      });
    }
    
    const stats = this.queryStats.get(normalizedQuery)!;
    stats.count++;
    stats.totalTime += duration;
    stats.maxTime = Math.max(stats.maxTime, duration);
    stats.avgTime = stats.totalTime / stats.count;
    
    // Log slow queries
    if (duration > 100) { // 100ms threshold
      console.warn(`Slow query detected: ${duration}ms`, {
        query: normalizedQuery,
        params,
        stats
      });
    }
  }
  
  private normalizeQuery(query: string): string {
    // Remove parameter values for consistent grouping
    return query
      .replace(/\$\d+/g, '$?') // PostgreSQL parameters
      .replace(/\?/g, '$?')     // MySQL parameters
      .replace(/\s+/g, ' ')     // Normalize whitespace
      .trim();
  }
  
  // Get performance report
  getPerformanceReport(): Array<{
    query: string;
    stats: any;
    severity: 'low' | 'medium' | 'high';
  }> {
    return Array.from(this.queryStats.entries()).map(([query, stats]) => {
      let severity: 'low' | 'medium' | 'high' = 'low';
      
      if (stats.avgTime > 200) severity = 'high';
      else if (stats.avgTime > 100) severity = 'medium';
      
      return { query, stats, severity };
    }).sort((a, b) => b.stats.avgTime - a.stats.avgTime);
  }
}

// Enhanced Prisma client with monitoring
const databaseMonitor = new DatabaseMonitor();

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ],
});

prisma.$on('query', (e) => {
  databaseMonitor.logQuery(e.query, e.duration, e.params);
});
```

### **Connection Pool Optimization**
```typescript
// Optimized database connection configuration
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?' + new URLSearchParams({
        // Connection pool settings
        'connection_limit': '20',
        'pool_timeout': '20',
        'connect_timeout': '10',
        
        // Performance settings
        'statement_cache_size': '100',
        'prepared_statement_cache_queries': '100',
        
        // SSL settings (for production)
        'sslmode': process.env.NODE_ENV === 'production' ? 'require' : 'prefer',
        
        // Schema cache
        'schema_cache': 'true',
        
        // Application name for monitoring
        'application_name': 'ai-ivr-v2'
      }).toString()
    }
  },
  
  // Logging configuration
  log: process.env.NODE_ENV === 'development' ? [
    { level: 'query', emit: 'event' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' },
  ] : [
    { level: 'error', emit: 'stdout' },
  ]
});

// Connection health monitoring
class ConnectionMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  
  startMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
      } catch (error) {
        console.error('Database health check failed:', error);
        // Alert monitoring system
        await this.alertHealthCheckFailure(error);
      }
    }, 30000); // Check every 30 seconds
  }
  
  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
  
  private async alertHealthCheckFailure(error: any): Promise<void> {
    // Send alert to monitoring service
    // Example: Sentry, DataDog, CloudWatch, etc.
    console.error('Database connection failure:', {
      error: error.message,
      timestamp: new Date().toISOString(),
      process: process.pid
    });
  }
}

// Graceful shutdown handling
const connectionMonitor = new ConnectionMonitor();

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  connectionMonitor.stopMonitoring();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  connectionMonitor.stopMonitoring();
  await prisma.$disconnect();
  process.exit(0);
});

// Start monitoring in production
if (process.env.NODE_ENV === 'production') {
  connectionMonitor.startMonitoring();
}
```

## 📊 Performance Testing & Benchmarking

### **Load Testing Setup**
```typescript
// Load testing with k6 or similar tools
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(99)<500'], // 99% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

export default function() {
  // Test API endpoints
  let response = http.get('https://your-api.com/api/agents', {
    headers: {
      'Authorization': 'Bearer ' + __ENV.AUTH_TOKEN,
    },
  });
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'has agents data': (r) => JSON.parse(r.body).data.length > 0,
  });
  
  sleep(1);
  
  // Test creating an agent
  response = http.post('https://your-api.com/api/agents', 
    JSON.stringify({
      name: `Test Agent ${__VU}-${__ITER}`,
      description: 'Load test agent',
      model: { provider: 'openai', model: 'gpt-4' },
      systemPrompt: 'You are a helpful assistant',
      language: 'en'
    }), 
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + __ENV.AUTH_TOKEN,
      },
    }
  );
  
  check(response, {
    'agent created successfully': (r) => r.status === 201,
    'creation time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(2);
}
```

### **Performance Benchmarking**
```typescript
// Automated performance benchmarking
class PerformanceBenchmark {
  async runBenchmark(): Promise<BenchmarkResults> {
    const results: BenchmarkResults = {
      timestamp: new Date(),
      database: await this.benchmarkDatabase(),
      api: await this.benchmarkAPI(),
      frontend: await this.benchmarkFrontend(),
    };
    
    await this.saveBenchmarkResults(results);
    return results;
  }
  
  private async benchmarkDatabase(): Promise<DatabaseBenchmark> {
    const startTime = performance.now();
    
    // Test simple queries
    const simpleQueryStart = performance.now();
    await prisma.agent.findMany({ take: 100 });
    const simpleQueryTime = performance.now() - simpleQueryStart;
    
    // Test complex queries
    const complexQueryStart = performance.now();
    await prisma.agent.findMany({
      include: {
        conversations: {
          include: {
            messages: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      },
      take: 50
    });
    const complexQueryTime = performance.now() - complexQueryStart;
    
    // Test bulk operations
    const bulkStart = performance.now();
    await prisma.agent.updateMany({
      where: { status: 'inactive' },
      data: { updatedAt: new Date() }
    });
    const bulkTime = performance.now() - bulkStart;
    
    return {
      simpleQuery: simpleQueryTime,
      complexQuery: complexQueryTime,
      bulkOperation: bulkTime,
      totalTime: performance.now() - startTime
    };
  }
  
  private async benchmarkAPI(): Promise<APIBenchmark> {
    const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
    const results: APIBenchmark = {
      endpoints: []
    };
    
    const endpoints = [
      { path: '/api/agents', method: 'GET' },
      { path: '/api/agents', method: 'POST', body: { /* test data */ } },
      { path: '/api/agents/test-agent-id', method: 'GET' },
      { path: '/api/conversations', method: 'GET' },
    ];
    
    for (const endpoint of endpoints) {
      const times: number[] = [];
      
      // Run each endpoint 10 times
      for (let i = 0; i < 10; i++) {
        const start = performance.now();
        
        try {
          const response = await fetch(`${baseURL}${endpoint.path}`, {
            method: endpoint.method,
            headers: { 'Content-Type': 'application/json' },
            body: endpoint.body ? JSON.stringify(endpoint.body) : undefined
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          await response.json();
          times.push(performance.now() - start);
          
        } catch (error) {
          console.error(`Benchmark error for ${endpoint.path}:`, error);
        }
      }
      
      if (times.length > 0) {
        results.endpoints.push({
          path: endpoint.path,
          method: endpoint.method,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          p95Time: this.percentile(times, 95),
          p99Time: this.percentile(times, 99)
        });
      }
    }
    
    return results;
  }
  
  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index];
  }
  
  private async saveBenchmarkResults(results: BenchmarkResults): Promise<void> {
    // Save to database or monitoring service
    await prisma.performanceBenchmark.create({
      data: {
        timestamp: results.timestamp,
        results: JSON.stringify(results)
      }
    });
    
    // Alert if performance regression detected
    if (await this.detectRegression(results)) {
      await this.alertPerformanceRegression(results);
    }
  }
}

// Scheduled benchmarking
const benchmark = new PerformanceBenchmark();

// Run benchmarks daily
setInterval(async () => {
  if (process.env.NODE_ENV === 'production') {
    try {
      await benchmark.runBenchmark();
    } catch (error) {
      console.error('Benchmark failed:', error);
    }
  }
}, 24 * 60 * 60 * 1000); // Every 24 hours
```

---

**Next Steps**:
- Monitor performance metrics continuously
- Set up alerting for performance regressions  
- Regularly review and optimize slow queries
- Test performance impact of new features
- Consider CDN and edge caching for global users