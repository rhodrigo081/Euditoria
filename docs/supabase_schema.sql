-- ============================================================================
-- PLATAFORMA EUDITORIA - ESQUEMA DE BANCO DE DADOS SUPABASE (POSTGRESQL)
-- ============================================================================
-- Execute este script no SQL Editor do seu projeto Supabase para criar todas as
-- tabelas, índices e políticas de segurança (Row Level Security).
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE PERFIS DE USUÁRIOS (PF / PJ / TITULAR / PROCURADOR)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('PF', 'PJ')),
    access_role VARCHAR(20) NOT NULL CHECK (access_role IN ('TITULAR', 'PROCURADOR')),
    document_number VARCHAR(20) NOT NULL, -- CPF ou CNPJ do usuário logado
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL,
    -- Campos exclusivos para perfil Procurador
    outorgante_type VARCHAR(10) CHECK (outorgante_type IN ('PF', 'PJ')),
    outorgante_document VARCHAR(20), -- CPF ou CNPJ da empresa/pessoa com procuração
    outorgante_name VARCHAR(120),
    procuracao_numero VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABELA DE ORGANIZAÇÕES / TENANTS
CREATE TABLE IF NOT EXISTS public.tenants (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120),
    plan VARCHAR(20) DEFAULT 'PROFESSIONAL' CHECK (plan IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
    monthly_quota INTEGER DEFAULT 5000,
    monthly_events_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE LOTES AUDITADOS (BATCHES)
CREATE TABLE IF NOT EXISTS public.batches (
    id VARCHAR(50) PRIMARY KEY,
    tenant_id VARCHAR(50) REFERENCES public.tenants(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('COMPLIANT', 'NON_COMPLIANT', 'PROCESSING', 'PENDING')),
    events_count INTEGER DEFAULT 0,
    xml_content TEXT,
    diagnostics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE FOLHA DE PAGAMENTO & REMUNERAÇÕES (PAYROLL)
CREATE TABLE IF NOT EXISTS public.payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(50) REFERENCES public.tenants(id) ON DELETE CASCADE,
    competency VARCHAR(7) NOT NULL, -- Formato 'AAAA-MM', ex: '2026-09'
    employee_name VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    cargo VARCHAR(80) NOT NULL,
    matricula VARCHAR(30) NOT NULL,
    event_type VARCHAR(10) DEFAULT 'S-1200' CHECK (event_type IN ('S-1200', 'S-1210', 'S-2299')),
    gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    inss_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    irrf_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fgts_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'CONFORME' CHECK (status IN ('CONFORME', 'DIVERGENTE', 'PROCESSADO')),
    rubrics JSONB DEFAULT '[]'::jsonb, -- Detalhamento de rubricas com vencimentos e descontos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE CERTIFICADOS OFICIAIS DE CONFORMIDADE
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    certificate_id VARCHAR(60) NOT NULL UNIQUE,
    protocol_number VARCHAR(60) NOT NULL UNIQUE,
    batch_id VARCHAR(50) REFERENCES public.batches(id) ON DELETE CASCADE,
    tenant_id VARCHAR(50) REFERENCES public.tenants(id) ON DELETE CASCADE,
    razao_social VARCHAR(120) NOT NULL,
    cnpj VARCHAR(20) NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    total_events INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'VALIDO',
    verification_url TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE ESPELHOS FISCAIS (TAX MIRRORS)
CREATE TABLE IF NOT EXISTS public.tax_mirrors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id VARCHAR(50) REFERENCES public.batches(id) ON DELETE CASCADE UNIQUE,
    tenant_id VARCHAR(50) REFERENCES public.tenants(id) ON DELETE CASCADE,
    base_inss NUMERIC(12, 2) DEFAULT 0.00,
    inss_declarado NUMERIC(12, 2) DEFAULT 0.00,
    inss_apurado NUMERIC(12, 2) DEFAULT 0.00,
    divergencia_inss NUMERIC(12, 2) DEFAULT 0.00,
    base_irrf NUMERIC(12, 2) DEFAULT 0.00,
    irrf_declarado NUMERIC(12, 2) DEFAULT 0.00,
    irrf_apurado NUMERIC(12, 2) DEFAULT 0.00,
    divergencia_irrf NUMERIC(12, 2) DEFAULT 0.00,
    base_fgts NUMERIC(12, 2) DEFAULT 0.00,
    fgts_declarado NUMERIC(12, 2) DEFAULT 0.00,
    fgts_apurado NUMERIC(12, 2) DEFAULT 0.00,
    divergencia_fgts NUMERIC(12, 2) DEFAULT 0.00,
    patronal_previdenciaria NUMERIC(12, 2) DEFAULT 0.00,
    rat NUMERIC(12, 2) DEFAULT 0.00,
    terceiros NUMERIC(12, 2) DEFAULT 0.00,
    total_patronal NUMERIC(12, 2) DEFAULT 0.00,
    possui_divergencias BOOLEAN DEFAULT false,
    memoria_calculo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ÍNDICES PARA ALTA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_payroll_competency ON public.payroll(competency);
CREATE INDEX IF NOT EXISTS idx_payroll_tenant ON public.payroll(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payroll_cpf ON public.payroll(cpf);
CREATE INDEX IF NOT EXISTS idx_batches_tenant ON public.batches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON public.certificates(certificate_id);

-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_mirrors ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público/autenticado permissivo para a API Euditoria
CREATE POLICY "Acesso público ou autenticado aos perfis" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Acesso público ou autenticado aos tenants" ON public.tenants FOR ALL USING (true);
CREATE POLICY "Acesso público ou autenticado aos lotes" ON public.batches FOR ALL USING (true);
CREATE POLICY "Acesso público ou autenticado à folha de pagamento" ON public.payroll FOR ALL USING (true);
CREATE POLICY "Acesso público ou autenticado aos certificados" ON public.certificates FOR ALL USING (true);
CREATE POLICY "Acesso público ou autenticado aos espelhos fiscais" ON public.tax_mirrors FOR ALL USING (true);
