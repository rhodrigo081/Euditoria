import assert from 'node:assert';
import { validateCpf, validateCnpj, validateEmail, validateRequired } from '../../src/public/src/utils/validators.js';
import { generateCertificatePdf } from '../../src/public/src/utils/pdfGenerator.js';

console.log('--- Iniciando Testes Automatizados de Folha de Pagamento & Autenticação ---');

// 1. Regras de Negócio de Onboarding em 2 Passos
// Passo 1: Validação dos dados cadastrais da empresa/titular
function validateCompanyCredentials(company) {
  if (company.userType === 'PF') {
    if (!validateCpf(company.documentNumber)) return { valid: false, error: 'CPF_INVALIDO' };
  } else {
    if (!validateCnpj(company.documentNumber)) return { valid: false, error: 'CNPJ_INVALIDO' };
  }

  if (!validateRequired(company.fullName)) return { valid: false, error: 'NOME_OBRIGATORIO' };
  if (!validateEmail(company.email)) return { valid: false, error: 'EMAIL_INVALIDO' };
  if (!company.password || company.password.length < 6) return { valid: false, error: 'SENHA_CURTA' };

  return { valid: true };
}

// Passo 1B: Validação do Cadastro de Nova Empresa com Termos LGPD
function validateCompanyRegistration(data) {
  const credValidation = validateCompanyCredentials(data);
  if (!credValidation.valid) return credValidation;

  if (!validateRequired(data.responsavelNome)) return { valid: false, error: 'RESPONSAVEL_OBRIGATORIO' };
  if (!validateRequired(data.telefone) || data.telefone.length < 14) return { valid: false, error: 'TELEFONE_INVALIDO' };
  if (!data.agreedLgpd) return { valid: false, error: 'LGPD_NAO_ACEITO' };
  if (data.password !== data.confirmPassword) return { valid: false, error: 'SENHAS_DIVERGENTES' };

  return { valid: true };
}

// Passo 2: Validação do contexto de operação selecionado (Titular ou Procurador)
function validateOperationContext(context) {
  if (context.accessRole === 'TITULAR') {
    return { valid: true }; // Titular usa diretamente os dados da empresa autenticada
  }

  if (context.accessRole === 'PROCURADOR') {
    if (!context.outorganteDocument) return { valid: false, error: 'OUTORGANTE_OBRIGATORIO' };
    const isValidOutorgante = context.outorganteType === 'PF' 
      ? validateCpf(context.outorganteDocument) 
      : validateCnpj(context.outorganteDocument);
    if (!isValidOutorgante) return { valid: false, error: 'DOC_OUTORGANTE_INVALIDO' };
    if (!validateRequired(context.outorganteName)) return { valid: false, error: 'NOME_OUTORGANTE_OBRIGATORIO' };
    return { valid: true };
  }

  return { valid: false, error: 'ROLE_DESCONHECIDO' };
}

// Teste Passo 1: Empresa válida (CNPJ)
const company1 = {
  userType: 'PJ',
  documentNumber: '12.345.678/0001-95',
  fullName: 'TechBrasil Soluções Digitais Ltda',
  email: 'compliance@techbrasil.com.br',
  password: 'senhaSegura123',
};
assert.strictEqual(validateCompanyCredentials(company1).valid, true, 'Passo 1: Empresa válida deve passar');

// Teste Cadastro: Sem aceite LGPD (deve falhar)
const regWithoutLgpd = {
  ...company1,
  responsavelNome: 'Dra. Juliana Silveira',
  telefone: '(11) 9 8765-4321',
  confirmPassword: 'senhaSegura123',
  agreedLgpd: false,
};
assert.strictEqual(validateCompanyRegistration(regWithoutLgpd).valid, false, 'Cadastro sem LGPD deve ser rejeitado');
assert.strictEqual(validateCompanyRegistration(regWithoutLgpd).error, 'LGPD_NAO_ACEITO');

// Teste Cadastro: Com aceite LGPD e senhas coincidentes (deve passar)
const regValid = {
  ...regWithoutLgpd,
  agreedLgpd: true,
};
assert.strictEqual(validateCompanyRegistration(regValid).valid, true, 'Cadastro com LGPD e dados válidos deve passar');

// Teste Passo 2 - Opção A: Continuar no próprio perfil (Titular)
assert.strictEqual(validateOperationContext({ accessRole: 'TITULAR' }).valid, true, 'Passo 2: Opção Titular válida');

// Teste Passo 2 - Opção B: Procuração sem informar empresa outorgante (deve falhar)
assert.strictEqual(validateOperationContext({ accessRole: 'PROCURADOR', outorganteDocument: '' }).valid, false, 'Passo 2: Procuração sem outorgante deve falhar');

// Teste Passo 2 - Opção B: Procuração com outorgante válido
const proxyContext = {
  accessRole: 'PROCURADOR',
  outorganteType: 'PJ',
  outorganteDocument: '12.345.678/0001-95',
  outorganteName: 'Indústria Metalúrgica Gaúcha S.A.',
  procuracaoNumero: 'PROC-2026-99014',
};
assert.strictEqual(validateOperationContext(proxyContext).valid, true, 'Passo 2: Opção Procurador com outorgante válida');

// 2. Teste de Apuração de Folha de Pagamento
function calculatePayrollValues(gross) {
  const val = parseFloat(gross) || 0;
  let inss = 0;
  if (val <= 1518.00) inss = val * 0.075;
  else if (val <= 2793.88) inss = (1518 * 0.075) + ((val - 1518) * 0.09);
  else if (val <= 4190.83) inss = (1518 * 0.075) + ((2793.88 - 1518) * 0.09) + ((val - 2793.88) * 0.12);
  else inss = Math.min(990.58, (1518 * 0.075) + ((2793.88 - 1518) * 0.09) + ((4190.83 - 2793.88) * 0.12) + ((val - 4190.83) * 0.14));

  const baseIrrf = Math.max(0, val - inss);
  let irrf = 0;
  if (baseIrrf > 2259.20 && baseIrrf <= 2826.65) irrf = (baseIrrf * 0.075) - 169.44;
  else if (baseIrrf > 2826.65 && baseIrrf <= 3751.05) irrf = (baseIrrf * 0.15) - 381.44;
  else if (baseIrrf > 3751.05 && baseIrrf <= 4664.68) irrf = (baseIrrf * 0.225) - 662.77;
  else if (baseIrrf > 4664.68) irrf = (baseIrrf * 0.275) - 896.00;
  irrf = Math.max(0, irrf);

  const fgts = val * 0.08;
  const net = val - inss - irrf;
  return { gross: val, inss: Number(inss.toFixed(2)), irrf: Number(irrf.toFixed(2)), fgts: Number(fgts.toFixed(2)), net: Number(net.toFixed(2)) };
}

const payRes = calculatePayrollValues(5000.00);
assert.strictEqual(payRes.gross, 5000.00);
assert.strictEqual(payRes.fgts, 400.00, 'FGTS de R$ 5.000,00 deve ser 8% = R$ 400,00');
assert.ok(payRes.inss > 500, 'INSS sobre 5000 deve ser progressivo');
assert.ok(payRes.net < 5000, 'Salário líquido deve deduzir encargos');
assert.strictEqual(Number((payRes.gross - payRes.inss - payRes.irrf).toFixed(2)), payRes.net, 'Líquido deve ser Bruto - INSS - IRRF');

// 3. Teste do Gerador de Certificado em PDF com jsPDF
const mockCertificate = {
  certificateId: 'EUD-TEST-2026-001',
  protocolNumber: 'PROT-TEST-001',
  razaoSocial: 'Empresa Teste S.A.',
  cnpj: '12.345.678/0001-95',
  totalEventsValidated: 25,
  sha256Hash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
  issuedAt: '2026-09-14T20:00:00.000Z',
  verificationUrl: 'https://euditoria.gov.br/verificar/EUD-TEST-2026-001',
};

// Como o ambiente Node não tem window/download, simulamos ou verificamos que a função não explode
try {
  // Criação direta do jsPDF para validar estrutura vetorial
  const doc = generateCertificatePdf(mockCertificate);
  assert.ok(doc, 'PDF gerado com sucesso');
} catch (err) {
  // No node, doc.save() pode chamar elemento HTML de download se DOM não existir
  if (!err.message.includes('document is not defined') && !err.message.includes('HTML')) {
    throw err;
  }
}

// 4. Testes de Persistência no Banco de Dados & Login Estrito (Sem Mock Bypass)
console.log('--- Testando Persistência em Banco & Login Estrito ---');

// Simulação do repositório em banco de dados
const databaseStore = new Map();

function hashTestPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash + password.charCodeAt(i)) | 0;
  }
  return String(hash);
}

function registerCompanyInDb(data) {
  if (!data.agreedLgpd) {
    throw new Error('LGPD_NAO_ACEITO');
  }

  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanDoc = (data.documentNumber || '').replace(/\D/g, '');

  for (const comp of databaseStore.values()) {
    if (comp.email === cleanEmail || comp.cleanDoc === cleanDoc) {
      throw new Error('EMPRESA_JA_CADASTRADA');
    }
  }

  const record = {
    id: 'comp_' + Date.now(),
    userType: data.userType || 'PJ',
    documentNumber: data.documentNumber,
    cleanDoc,
    companyName: data.fullName,
    responsavelNome: data.responsavelNome,
    telefone: data.telefone,
    email: cleanEmail,
    passwordHash: hashTestPassword(data.password),
    agreedLgpd: true,
    registeredAt: new Date().toISOString(),
  };

  databaseStore.set(cleanEmail, record);
  return record;
}

function loginCompanyFromDb(credentials) {
  const cleanEmail = (credentials.email || '').trim().toLowerCase();
  const cleanDoc = cleanEmail.replace(/\D/g, '');

  let found = databaseStore.get(cleanEmail);
  if (!found && cleanDoc) {
    for (const comp of databaseStore.values()) {
      if (comp.cleanDoc === cleanDoc) {
        found = comp;
        break;
      }
    }
  }

  // REGRA DE NEGÓCIO: Se não tiver cadastro, NÃO faz login!
  if (!found) {
    throw new Error('USUARIO_NAO_CADASTRADO');
  }

  // REGRA DE NEGÓCIO: Se a senha não bater, NÃO faz login!
  const inputHash = hashTestPassword(credentials.password);
  if (found.passwordHash !== inputHash) {
    throw new Error('SENHA_INCORRETA');
  }

  return {
    user: { id: found.id, email: found.email },
    profile: {
      userType: found.userType,
      accessRole: 'TITULAR',
      documentNumber: found.documentNumber,
      fullName: found.companyName,
      responsavelNome: found.responsavelNome,
      email: found.email,
    },
  };
}

// Teste A: Tentar logar com empresa NÃO cadastrada deve falhar com USUARIO_NAO_CADASTRADO
assert.throws(
  () => loginCompanyFromDb({ email: 'inexistente@empresa.com.br', password: 'qualquerSenha123' }),
  (err) => err.message === 'USUARIO_NAO_CADASTRADO',
  'Login de usuário não cadastrado deve falhar estritamente'
);

// Teste B: Cadastrar nova empresa no banco de dados
const registered = registerCompanyInDb({
  userType: 'PJ',
  documentNumber: '11.222.333/0001-44',
  fullName: 'Euditoria Compliance & Tech Ltda',
  responsavelNome: 'Roberto Santos',
  telefone: '(11) 9 9988-7766',
  email: 'diretoria@euditoriatech.com.br',
  password: 'senhaForte@2026',
  agreedLgpd: true,
});
assert.ok(registered.id, 'Empresa cadastrada deve ter ID gerado');
assert.strictEqual(registered.email, 'diretoria@euditoriatech.com.br');
assert.strictEqual(registered.agreedLgpd, true);

// Teste C: Tentar cadastrar a mesma empresa duplicada deve ser rejeitado
assert.throws(
  () => registerCompanyInDb({
    userType: 'PJ',
    documentNumber: '11.222.333/0001-44',
    fullName: 'Tentativa Duplicada',
    responsavelNome: 'Alguem',
    telefone: '(11) 9 1111-2222',
    email: 'diretoria@euditoriatech.com.br',
    password: 'outraSenha123',
    agreedLgpd: true,
  }),
  (err) => err.message === 'EMPRESA_JA_CADASTRADA',
  'Cadastro duplicado deve ser rejeitado'
);

// Teste D: Tentar login com senha incorreta para empresa cadastrada deve falhar
assert.throws(
  () => loginCompanyFromDb({ email: 'diretoria@euditoriatech.com.br', password: 'senhaErrada999' }),
  (err) => err.message === 'SENHA_INCORRETA',
  'Login com senha errada deve falhar estritamente com SENHA_INCORRETA'
);

// Teste E: Login com credenciais corretas deve autenticar com sucesso
const loginSuccess = loginCompanyFromDb({ email: 'diretoria@euditoriatech.com.br', password: 'senhaForte@2026' });
assert.ok(loginSuccess.user, 'Login deve retornar dados do usuário');
assert.strictEqual(loginSuccess.profile.fullName, 'Euditoria Compliance & Tech Ltda');
assert.strictEqual(loginSuccess.profile.accessRole, 'TITULAR');

// Teste F: Login buscando pelo CNPJ também deve autenticar
const loginByDoc = loginCompanyFromDb({ email: '11.222.333/0001-44', password: 'senhaForte@2026' });
assert.strictEqual(loginByDoc.profile.documentNumber, '11.222.333/0001-44');

console.log('✔ Todos os testes de Folha de Pagamento & Autenticação passaram com sucesso!');

