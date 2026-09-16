import { createClient } from '@supabase/supabase-js';
import { api } from './api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as credenciais reais foram fornecidas
export const isSupabaseConfigured = () => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('seu-projeto') &&
    !supabaseAnonKey.includes('sua-chave')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Armazenamento local reativo para quando o Supabase estiver em modo de configuração
// (Sem dados mockados: inicia limpo e persiste apenas os dados reais criados pelo usuário)
const LOCAL_STORAGE_KEYS = {
  PAYROLL: 'euditoria_payroll_records',
  BATCHES: 'euditoria_batches_records',
  CERTIFICATES: 'euditoria_certificates_records',
  TENANTS: 'euditoria_tenants_records',
  USER_SESSION: 'euditoria_user_session',
  REGISTERED_COMPANIES: 'euditoria_registered_companies',
};

const getLocalData = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('[Euditoria Storage] Erro ao salvar localmente:', err);
  }
};

async function hashPassword(password) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash + password.charCodeAt(i)) | 0;
  }
  return String(hash);
}

// ==========================================
// 1. SERVIÇOS DE AUTENTICAÇÃO E SESSÃO
// ==========================================
export const authService = {
  async getCurrentSession() {
    if (isSupabaseConfigured()) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const profile = await this.getProfile(session.user.id);
          return { user: session.user, profile };
        }
      } catch (err) {
        console.warn('[Supabase Auth] Falha ao recuperar sessão:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_SESSION);
    return local ? JSON.parse(local) : null;
  },

  /**
   * RF-AUTH-01: Cadastro de nova empresa / empregador no banco de dados.
   * Persiste no Supabase, no Backend Spring Boot e no armazenamento de empresas registradas.
   */
  async register(companyData) {
    const {
      userType = 'PJ',
      documentNumber,
      fullName,
      responsavelNome,
      telefone,
      email,
      password,
      agreedLgpd,
    } = companyData;

    if (!agreedLgpd) {
      throw new Error('É obrigatório concordar com os Termos de Serviço e a Política de Privacidade (LGPD).');
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanDoc = (documentNumber || '').replace(/\D/g, '');
    const cleanFullName = (fullName || '').trim();
    const cleanResponsavel = (responsavelNome || '').trim();
    const cleanPhone = (telefone || '').trim();

    // 1. Tenta persistir no Backend Spring Boot
    let backendResult = null;
    try {
      backendResult = await api.registerCompany({
        userType,
        documentNumber: cleanDoc,
        companyName: cleanFullName,
        responsavelNome: cleanResponsavel,
        telefone: cleanPhone,
        email: cleanEmail,
        password,
        agreedLgpd: true,
      });
    } catch (err) {
      // Se for erro de duplicidade ou validação do backend, propaga para o usuário
      if (err.message && (err.message.includes('já está cadastrado') || err.message.includes('já possui cadastro'))) {
        throw err;
      }
      console.warn('[Backend Auth] Backend Spring Boot offline, salvando no banco local contingencial:', err.message);
    }

    // 2. Se Supabase estiver configurado com credenciais reais, cadastra no Supabase
    let supabaseUser = null;
    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });
        if (authError) throw authError;
        supabaseUser = authData?.user;

        // Persiste na tabela de tenants
        await supabase.from('tenants').upsert([{
          id: backendResult?.company?.id || 'ten_' + Date.now(),
          name: cleanFullName,
          cnpj: cleanDoc,
          email: cleanEmail,
          plan: 'PROFESSIONAL',
        }]);

        // Persiste na tabela de perfis
        if (supabaseUser) {
          await supabase.from('profiles').upsert([{
            user_id: supabaseUser.id,
            user_type: userType,
            access_role: 'TITULAR',
            document_number: cleanDoc,
            full_name: cleanFullName,
            email: cleanEmail,
          }]);
        }
      } catch (err) {
        console.warn('[Supabase Auth] Erro ao cadastrar no Supabase:', err.message);
        throw new Error('Falha ao registrar conta no Supabase: ' + err.message);
      }
    }

    // 3. Persiste no banco seguro de empresas cadastradas
    const existingCompanies = getLocalData(LOCAL_STORAGE_KEYS.REGISTERED_COMPANIES);
    const alreadyExists = existingCompanies.some(
      (c) => c.email === cleanEmail || c.documentNumber.replace(/\D/g, '') === cleanDoc
    );

    if (alreadyExists) {
      throw new Error('Esta empresa ou e-mail já está cadastrado no sistema. Por favor, acesse pela aba "Já Tenho Conta".');
    }

    const passwordHash = await hashPassword(password);
    const companyId = backendResult?.company?.id || 'comp_' + Date.now();

    const newCompanyRecord = {
      id: companyId,
      userType,
      documentNumber: documentNumber.trim(),
      fullName: cleanFullName,
      responsavelNome: cleanResponsavel,
      telefone: cleanPhone,
      email: cleanEmail,
      passwordHash,
      agreedLgpd: true,
      agreedLgpdAt: new Date().toISOString(),
      registeredAt: new Date().toISOString(),
      accessRole: 'TITULAR',
    };

    setLocalData(LOCAL_STORAGE_KEYS.REGISTERED_COMPANIES, [...existingCompanies, newCompanyRecord]);

    // Cria a sessão autenticada da nova empresa
    const sessionData = {
      user: { id: supabaseUser?.id || companyId, email: cleanEmail },
      profile: {
        id: companyId,
        userType,
        accessRole: 'TITULAR',
        documentNumber: documentNumber.trim(),
        fullName: cleanFullName,
        responsavelNome: cleanResponsavel,
        telefone: cleanPhone,
        email: cleanEmail,
        loggedAt: new Date().toISOString(),
      },
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
    return sessionData;
  },

  /**
   * RF-AUTH-02: Login estrito baseado no banco de dados.
   * BLOQUEIA usuários ou empresas não cadastradas ou senhas inválidas.
   */
  async login(credentials) {
    const { email, password } = credentials;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanDoc = cleanEmail.replace(/\D/g, '');

    // 1. Se o Supabase estiver configurado, valida diretamente pelo Supabase Auth
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        throw new Error('Credenciais inválidas no Supabase ou empresa não cadastrada. Verifique seus dados ou crie uma conta.');
      }

      const profile = await this.getProfile(data.user.id);
      const sessionData = {
        user: data.user,
        profile: profile || {
          email: cleanEmail,
          fullName: 'Empresa Titular',
          accessRole: 'TITULAR',
          userType: 'PJ',
        },
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
      return sessionData;
    }

    // 2. Tenta login no Backend Spring Boot
    let backendSuccess = null;
    let backendError = null;
    try {
      backendSuccess = await api.loginCompany({
        email: cleanEmail,
        password,
      });
    } catch (err) {
      backendError = err;
    }

    if (backendSuccess && backendSuccess.company) {
      const comp = backendSuccess.company;
      const sessionData = {
        user: { id: comp.id, email: comp.email || cleanEmail },
        profile: {
          id: comp.id,
          userType: comp.userType || 'PJ',
          accessRole: comp.accessRole || 'TITULAR',
          documentNumber: comp.documentNumber,
          fullName: comp.companyName,
          responsavelNome: comp.responsavelNome,
          email: comp.email || cleanEmail,
          loggedAt: new Date().toISOString(),
        },
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
      return sessionData;
    }

    // Se o backend retornou erro de negócio (ex: 404 usuário não cadastrado ou 422 senha incorreta), repassa o erro
    if (backendError && backendError.message && !backendError.message.includes('Failed to fetch') && !backendError.message.includes('NetworkError')) {
      throw backendError;
    }

    // 3. Fallback para o Banco Local de Empresas Cadastradas (caso backend esteja desligado)
    const registeredCompanies = getLocalData(LOCAL_STORAGE_KEYS.REGISTERED_COMPANIES);

    const foundCompany = registeredCompanies.find(
      (c) => c.email === cleanEmail || (cleanDoc && c.documentNumber.replace(/\D/g, '') === cleanDoc)
    );

    // REGRA ESTRITA: Se a empresa não estiver cadastrada no banco, NÃO FAZ LOGIN!
    if (!foundCompany) {
      throw new Error(
        'Empresa ou usuário não cadastrado no sistema. Por favor, crie sua conta na aba "Criar Nova Conta" antes de efetuar o login.'
      );
    }

    // REGRA ESTRITA: Se a senha não conferir, NÃO FAZ LOGIN!
    const inputHash = await hashPassword(password);
    if (foundCompany.passwordHash && foundCompany.passwordHash !== inputHash) {
      throw new Error('Senha incorreta. Verifique suas credenciais de acesso.');
    }

    const sessionData = {
      user: { id: foundCompany.id, email: foundCompany.email },
      profile: {
        id: foundCompany.id,
        userType: foundCompany.userType,
        accessRole: foundCompany.accessRole || 'TITULAR',
        documentNumber: foundCompany.documentNumber,
        fullName: foundCompany.fullName,
        responsavelNome: foundCompany.responsavelNome,
        telefone: foundCompany.telefone,
        email: foundCompany.email,
        loggedAt: new Date().toISOString(),
      },
    };

    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
    return sessionData;
  },

  async logout() {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Supabase Auth] Erro ao deslogar:', err);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_SESSION);
  },

  async switchAccessContext(context) {
    const local = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_SESSION);
    if (local) {
      const parsed = JSON.parse(local);
      parsed.profile = {
        ...parsed.profile,
        accessRole: context.accessRole,
        outorganteType: context.outorganteType || null,
        outorganteDocument: context.outorganteDocument || null,
        outorganteName: context.outorganteName || null,
        procuracaoNumero: context.procuracaoNumero || null,
      };
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_SESSION, JSON.stringify(parsed));
      return parsed;
    }
    return null;
  },

  async getProfile(userId) {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return data;
  },
};

// ==========================================
// 2. SERVIÇOS DE FOLHA DE PAGAMENTO (PAYROLL)
// ==========================================
export const payrollService = {
  async getPayroll(tenantId, competency = null) {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('payroll').select('*');
        if (tenantId) query = query.eq('tenant_id', tenantId);
        if (competency && competency !== 'TODAS') query = query.eq('competency', competency);
        const { data, error } = await query.order('employee_name', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Payroll] Erro ao buscar da nuvem:', err);
      }
    }

    // Armazenamento local
    const list = getLocalData(LOCAL_STORAGE_KEYS.PAYROLL);
    return list.filter((item) => {
      const matchTenant = !tenantId || item.tenant_id === tenantId;
      const matchComp = !competency || competency === 'TODAS' || item.competency === competency;
      return matchTenant && matchComp;
    });
  },

  async insertPayroll(record) {
    const item = {
      id: record.id || 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      tenant_id: record.tenant_id || 'tenant-padrao',
      competency: record.competency,
      employee_name: record.employee_name,
      cpf: record.cpf,
      cargo: record.cargo || 'Não especificado',
      matricula: record.matricula || 'MAT-' + Math.floor(1000 + Math.random() * 9000),
      event_type: record.event_type || 'S-1200',
      gross_amount: Number(record.gross_amount) || 0,
      inss_amount: Number(record.inss_amount) || 0,
      irrf_amount: Number(record.irrf_amount) || 0,
      fgts_amount: Number(record.fgts_amount) || 0,
      net_amount: Number(record.net_amount) || 0,
      status: record.status || 'CONFORME',
      rubrics: record.rubrics || [],
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('payroll').insert([item]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Payroll] Falha ao inserir na nuvem:', err);
      }
    }

    const current = getLocalData(LOCAL_STORAGE_KEYS.PAYROLL);
    current.unshift(item);
    setLocalData(LOCAL_STORAGE_KEYS.PAYROLL, current);
    return item;
  },

  async deletePayroll(id) {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('payroll').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase Payroll] Falha ao deletar:', err);
      }
    }
    const current = getLocalData(LOCAL_STORAGE_KEYS.PAYROLL);
    const updated = current.filter((i) => i.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.PAYROLL, updated);
    return true;
  },

  async getCompetencies(tenantId) {
    const records = await this.getPayroll(tenantId);
    const unique = Array.from(new Set(records.map((r) => r.competency).filter(Boolean)));
    return unique.sort().reverse();
  },
};

// ==========================================
// 3. SERVIÇOS DE LOTES AUDITADOS (BATCHES)
// ==========================================
export const batchService = {
  async getBatches(tenantId) {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('batches').select('*');
        if (tenantId) query = query.eq('tenant_id', tenantId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Batches] Falha ao buscar lotes:', err);
      }
    }
    const current = getLocalData(LOCAL_STORAGE_KEYS.BATCHES);
    return tenantId ? current.filter((b) => b.tenantId === tenantId || b.tenant_id === tenantId) : current;
  },

  async insertBatch(batch) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('batches').insert([batch]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Batches] Falha ao salvar lote na nuvem:', err);
      }
    }
    const current = getLocalData(LOCAL_STORAGE_KEYS.BATCHES);
    current.unshift(batch);
    setLocalData(LOCAL_STORAGE_KEYS.BATCHES, current);
    return batch;
  },

  async updateBatch(batchId, updates) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('batches')
          .update(updates)
          .eq('id', batchId)
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Batches] Falha ao atualizar lote na nuvem:', err);
      }
    }
    const current = getLocalData(LOCAL_STORAGE_KEYS.BATCHES);
    const idx = current.findIndex((b) => (b.batchId || b.id) === batchId);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates };
      setLocalData(LOCAL_STORAGE_KEYS.BATCHES, current);
      return current[idx];
    }
    return null;
  },
};

// ==========================================
// 4. SERVIÇOS DE CERTIFICADOS OFICIAIS
// ==========================================
export const certificateService = {
  async getCertificates(tenantId) {
    if (isSupabaseConfigured()) {
      try {
        let query = supabase.from('certificates').select('*');
        if (tenantId) query = query.eq('tenant_id', tenantId);
        const { data, error } = await query.order('issued_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Certificates] Falha ao carregar certificados:', err);
      }
    }
    const current = getLocalData(LOCAL_STORAGE_KEYS.CERTIFICATES);
    return tenantId ? current.filter((c) => c.tenantId === tenantId || c.tenant_id === tenantId) : current;
  },

  async insertCertificate(certificate) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('certificates').insert([certificate]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Certificates] Falha ao salvar certificado na nuvem:', err);
      }
    }
    const current = getLocalData(LOCAL_STORAGE_KEYS.CERTIFICATES);
    current.unshift(certificate);
    setLocalData(LOCAL_STORAGE_KEYS.CERTIFICATES, current);
    return certificate;
  },
};

// ==========================================
// 5. SERVIÇOS DE ORGANIZAÇÕES / TENANTS
// ==========================================
export const tenantService = {
  async getTenants() {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('tenants').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('[Supabase Tenants] Falha ao carregar organizações:', err);
      }
    }
    const local = getLocalData(LOCAL_STORAGE_KEYS.TENANTS);
    return local;
  },

  async createTenant(tenant) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('tenants').insert([tenant]).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[Supabase Tenants] Falha ao salvar organização:', err);
      }
    }
    const current = getLocalData(LOCAL_STORAGE_KEYS.TENANTS);
    current.push(tenant);
    setLocalData(LOCAL_STORAGE_KEYS.TENANTS, current);
    return tenant;
  },
};
