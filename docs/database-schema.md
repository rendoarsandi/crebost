# Database Schema Design

## Overview
Database schema untuk platform Crebost menggunakan PostgreSQL dengan Prisma ORM.

## Core Tables

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'PROMOTER',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  balance_idr DECIMAL(15,2) DEFAULT 0,
  total_earned_idr DECIMAL(15,2) DEFAULT 0,
  phone VARCHAR(20),
  bio TEXT,
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('CREATOR', 'PROMOTER', 'ADMIN');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');
```

### Campaigns
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget_usd DECIMAL(10,2) NOT NULL,
  budget_idr DECIMAL(15,2) NOT NULL,
  rate_per_viewer_usd DECIMAL(5,3) NOT NULL,
  rate_per_viewer_idr DECIMAL(10,2) NOT NULL,
  target_viewers INTEGER NOT NULL,
  current_viewers INTEGER DEFAULT 0,
  requirements JSONB NOT NULL,
  materials JSONB NOT NULL,
  status campaign_status NOT NULL DEFAULT 'DRAFT',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE campaign_status AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
```

### Promotions
```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  promoter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform promotion_platform NOT NULL,
  content_url TEXT NOT NULL,
  proof_url TEXT,
  viewers_count INTEGER DEFAULT 0,
  engagement_data JSONB,
  earnings_idr DECIMAL(10,2) DEFAULT 0,
  status promotion_status NOT NULL DEFAULT 'PENDING',
  submitted_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE promotion_platform AS ENUM ('TIKTOK', 'INSTAGRAM', 'YOUTUBE', 'TWITTER', 'FACEBOOK');
CREATE TYPE promotion_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
```

### Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount_idr DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  reference_id UUID,
  reference_type transaction_reference_type,
  payment_method VARCHAR(50),
  payment_data JSONB,
  status transaction_status NOT NULL DEFAULT 'PENDING',
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'EARNING', 'PAYMENT', 'REFUND', 'FEE');
CREATE TYPE transaction_reference_type AS ENUM ('CAMPAIGN', 'PROMOTION', 'WITHDRAWAL_REQUEST');
CREATE TYPE transaction_status AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');
```

### Withdrawal Requests
```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount_idr DECIMAL(15,2) NOT NULL,
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  admin_fee_idr DECIMAL(10,2) NOT NULL,
  net_amount_idr DECIMAL(15,2) NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'PENDING',
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE withdrawal_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED');
```

### Reports & Complaints
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_content_id UUID,
  reported_content_type report_content_type,
  reason report_reason NOT NULL,
  description TEXT NOT NULL,
  evidence_urls JSONB,
  status report_status NOT NULL DEFAULT 'PENDING',
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE report_content_type AS ENUM ('CAMPAIGN', 'PROMOTION', 'USER_PROFILE');
CREATE TYPE report_reason AS ENUM ('SPAM', 'FRAUD', 'INAPPROPRIATE_CONTENT', 'FAKE_METRICS', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');
```

### Analytics & Tracking
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE campaign_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_engagement INTEGER DEFAULT 0,
  total_spent_idr DECIMAL(15,2) DEFAULT 0,
  platform_breakdown JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_campaigns_creator_id ON campaigns(creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_promotions_campaign_id ON promotions(campaign_id);
CREATE INDEX idx_promotions_promoter_id ON promotions(promoter_id);
CREATE INDEX idx_promotions_status ON promotions(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(date);
```

## Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users FOR ALL USING (auth.uid() = id);

-- Campaigns visibility
CREATE POLICY campaigns_creator_access ON campaigns FOR ALL USING (creator_id = auth.uid());
CREATE POLICY campaigns_public_read ON campaigns FOR SELECT USING (status = 'ACTIVE');

-- Promotions access
CREATE POLICY promotions_promoter_access ON promotions FOR ALL USING (promoter_id = auth.uid());
CREATE POLICY promotions_creator_read ON promotions FOR SELECT USING (
  campaign_id IN (SELECT id FROM campaigns WHERE creator_id = auth.uid())
);

-- Transactions access
CREATE POLICY transactions_own_data ON transactions FOR ALL USING (user_id = auth.uid());

-- Withdrawal requests access
CREATE POLICY withdrawal_requests_own_data ON withdrawal_requests FOR ALL USING (user_id = auth.uid());
```

## Business Logic Constraints

```sql
-- Ensure campaign budget is positive
ALTER TABLE campaigns ADD CONSTRAINT check_positive_budget CHECK (budget_usd > 0);

-- Ensure rate per viewer is positive
ALTER TABLE campaigns ADD CONSTRAINT check_positive_rate CHECK (rate_per_viewer_usd > 0);

-- Ensure target viewers is positive
ALTER TABLE campaigns ADD CONSTRAINT check_positive_target CHECK (target_viewers > 0);

-- Ensure current viewers doesn't exceed target
ALTER TABLE campaigns ADD CONSTRAINT check_viewers_limit CHECK (current_viewers <= target_viewers);

-- Ensure transaction amount is positive for most types
ALTER TABLE transactions ADD CONSTRAINT check_positive_amount CHECK (
  (type IN ('DEPOSIT', 'EARNING', 'PAYMENT') AND amount_idr > 0) OR
  (type IN ('WITHDRAWAL', 'REFUND', 'FEE') AND amount_idr >= 0)
);

-- Ensure withdrawal amount is positive
ALTER TABLE withdrawal_requests ADD CONSTRAINT check_positive_withdrawal CHECK (amount_idr > 0);
```
