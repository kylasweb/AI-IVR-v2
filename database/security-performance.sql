-- Row Level Security Policies for Enhanced Security
-- Add these to your Prisma migration

-- Enable RLS for User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_self_policy ON "User"
    FOR ALL
    TO authenticated
    USING (id = current_user_id());

-- Enable RLS for AI Agents
ALTER TABLE "AIAgent" ENABLE ROW LEVEL SECURITY;

-- Users can only access AI agents they created or that are public
CREATE POLICY ai_agent_access_policy ON "AIAgent"
    FOR ALL
    TO authenticated
    USING (
        creator_id = current_user_id() 
        OR status = 'published'
    );

-- Enable RLS for Workflows
ALTER TABLE "Workflow" ENABLE ROW LEVEL SECURITY;

-- Workflow access based on permissions
CREATE POLICY workflow_access_policy ON "Workflow"
    FOR ALL
    TO authenticated
    USING (
        user_id = current_user_id()
        OR is_template = true
        OR EXISTS (
            SELECT 1 FROM workflow_permissions 
            WHERE workflow_id = "Workflow".id 
            AND user_id = current_user_id()
        )
    );

-- Performance Indexes
CREATE INDEX CONCURRENTLY idx_user_email ON "User"(email);
CREATE INDEX CONCURRENTLY idx_workflow_category ON "Workflow"(category);
CREATE INDEX CONCURRENTLY idx_workflow_active ON "Workflow"(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_aiagent_status ON "AIAgent"(status);
CREATE INDEX CONCURRENTLY idx_aiagent_creator ON "AIAgent"(creator_id);
CREATE INDEX CONCURRENTLY idx_ride_status ON "Ride"(status);
CREATE INDEX CONCURRENTLY idx_ride_driver ON "Ride"(driver_id);
CREATE INDEX CONCURRENTLY idx_ride_created ON "Ride"(created_at);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_workflow_user_category ON "Workflow"(user_id, category, is_active);
CREATE INDEX CONCURRENTLY idx_aiagent_status_created ON "AIAgent"(status, created_at);

-- Function to get current user ID (implement based on your auth system)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
BEGIN
    -- This should return the authenticated user's ID
    -- Implementation depends on your authentication system
    RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;