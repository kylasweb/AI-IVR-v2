-- FairGo Telephony Configuration Database Initialization
-- This script sets up the initial database structure for the telephony gateway service

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert default SIP trunk (placeholder - to be configured with actual Jio credentials)
INSERT INTO sip_trunks (name, host, port, is_active) VALUES
('jio-sip-trunk-1', 'sip.jio.com', 5060, false),
('jio-sip-trunk-2', 'sip.jio.com', 5060, false)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sip_trunks_is_active ON sip_trunks(is_active);
CREATE INDEX IF NOT EXISTS idx_call_logs_trunk_id ON call_logs(trunk_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_started_at ON call_logs(started_at);
CREATE INDEX IF NOT EXISTS idx_call_logs_call_id ON call_logs(call_id);