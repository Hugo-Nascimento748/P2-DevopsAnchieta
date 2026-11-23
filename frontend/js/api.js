/**
 * Camada de Integração com a API — Área do Barbeiro
 * Projeto: P2-DevopsAnchieta (Sistema de Agendamento para Barbearias)
 *
 * Modelos alinhados com backend/src/models/:
 * - Usuario: { id, nome, email, senha, telefone, tipo: 'BARBEIRO' }
 * - Servico: { id, barbeiroId, nome, descricao, duracaoMinutos, preco, ativo }
 * - Disponibilidade: { id, barbeiroId, inicio, fim }
 */

const STORAGE_KEYS = {
  API_URL: 'barbearia_api_url',
  TOKEN: 'barbearia_jwt_token',
  USER: 'barbearia_usuario',
  FALLBACK_ENABLED: 'barbearia_fallback_offline',
  MOCK_USERS: 'barbearia_mock_usuarios',
  MOCK_SERVICES: 'barbearia_mock_servicos',
  MOCK_SLOTS: 'barbearia_mock_disponibilidades',
};

function getApiBaseUrl() {
  return (localStorage.getItem(STORAGE_KEYS.API_URL) || 'http://localhost:3000').replace(/\/+$/, '');
}

function setApiBaseUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem(STORAGE_KEYS.API_URL, url.trim().replace(/\/+$/, ''));
  }
}

function isOfflineFallbackEnabled() {
  const val = localStorage.getItem(STORAGE_KEYS.FALLBACK_ENABLED);
  return val === null ? false : val === 'true';
}

function setOfflineFallbackEnabled(enabled) {
  localStorage.setItem(STORAGE_KEYS.FALLBACK_ENABLED, enabled ? 'true' : 'false');
}

/* ==================== SESSÃO / JWT ==================== */

function salvarSessao(token, usuario) {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(usuario));
}

function obterToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function obterUsuarioLogado() {
  const raw = localStorage.getItem(STORAGE_KEYS.USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function encerrarSessao() {
  const usuario = obterUsuarioLogado();
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href =
    usuario && usuario.tipo === 'CLIENTE' ? 'login-cliente.html' : 'login-barbeiro.html';
}

function exigirAutenticacaoBarbeiro() {
  const token = obterToken();
  const usuario = obterUsuarioLogado();
  if (!token || !usuario) {
    window.location.href = 'login-barbeiro.html?aviso=login_necessario';
    return null;
  }
  return { token, usuario };
}

/* ==================== CLIENTE HTTP COM JWT ==================== */

async function apiRequest(path, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = obterToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { mensagem: text } : {};
  }

  if (!response.ok) {
    const msgErro =
      (data && (data.erro || data.message || data.mensagem || data.error)) ||
      `Erro HTTP ${response.status} ao comunicar com a API.`;
    const err = new Error(msgErro);
    err.status = response.status;
    err.payload = data;
    throw err;
  }

  return data;
}

/* ==================== #15 CADASTRO DE CLIENTE ==================== */

async function cadastrarCliente({ nome, email, telefone, senha }) {
  const payload = {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone ? telefone.trim() : null,
    senha,
    tipo: 'CLIENTE',
  };

  try {
    return await apiRequest('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }

    const lista = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_USERS) || '[]');
    if (lista.some((usuario) => usuario.email === payload.email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }

    const novoUsuario = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'cliente-' + Date.now(),
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone,
      tipo: 'CLIENTE',
      senhaSimulada: payload.senha,
      criadoEm: new Date().toISOString(),
    };
    lista.push(novoUsuario);
    localStorage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(lista));
    return {
      mensagem: 'Cliente cadastrado com sucesso! (Modo simulação local — API offline)',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        tipo: novoUsuario.tipo,
      },
      _offline: true,
    };
  }
}

/* ==================== #16 LOGIN DE CLIENTE ==================== */

async function loginCliente({ email, senha }) {
  const payload = {
    email: email.trim().toLowerCase(),
    senha,
  };

  let res;
  try {
    res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }

    const lista = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_USERS) || '[]');
    const encontrado = lista.find(
      (usuario) =>
        usuario.email === payload.email &&
        usuario.senhaSimulada === payload.senha &&
        usuario.tipo === 'CLIENTE'
    );
    if (!encontrado) {
      throw new Error('E-mail ou senha inválidos (ou cadastre um cliente primeiro).');
    }

    const tokenSimulado =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      btoa(JSON.stringify({ id: encontrado.id, tipo: 'CLIENTE', email: encontrado.email })) +
      '.mock-signature';
    const usuarioPublico = {
      id: encontrado.id,
      nome: encontrado.nome,
      email: encontrado.email,
      telefone: encontrado.telefone,
      tipo: 'CLIENTE',
    };
    salvarSessao(tokenSimulado, usuarioPublico);
    return {
      mensagem: 'Login realizado com sucesso! (Modo simulação local — API offline)',
      token: tokenSimulado,
      usuario: usuarioPublico,
      _offline: true,
    };
  }

  if (res.usuario && res.usuario.tipo && res.usuario.tipo.toUpperCase() !== 'CLIENTE') {
    throw new Error('Esta conta não pertence ao perfil de Cliente.');
  }

  salvarSessao(res.token, res.usuario);
  return res;
}

/* ==================== #17 CADASTRO DE BARBEIRO ==================== */

async function cadastrarBarbeiro({ nome, email, telefone, senha }) {
  const payload = {
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    telefone: telefone ? telefone.trim() : null,
    senha,
    tipo: 'BARBEIRO',
  };

  try {
    return await apiRequest('/auth/cadastro', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Se foi erro retornado pela API (ex: 400 ou 409 e-mail já cadastrado), repassa o erro real
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    // Fallback local quando o servidor backend ainda não está rodando na porta 3000
    const lista = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_USERS) || '[]');
    if (lista.some((u) => u.email === payload.email)) {
      throw new Error('Este e-mail já está cadastrado.');
    }
    const novoUsuario = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'barb-' + Date.now(),
      nome: payload.nome,
      email: payload.email,
      telefone: payload.telefone,
      tipo: 'BARBEIRO',
      senhaSimulada: payload.senha,
      criadoEm: new Date().toISOString(),
    };
    lista.push(novoUsuario);
    localStorage.setItem(STORAGE_KEYS.MOCK_USERS, JSON.stringify(lista));
    return {
      mensagem: 'Barbeiro cadastrado com sucesso! (Modo simulação local — API offline)',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        telefone: novoUsuario.telefone,
        tipo: novoUsuario.tipo,
      },
      _offline: true,
    };
  }
}

/* ==================== #18 LOGIN DE BARBEIRO ==================== */

async function loginBarbeiro({ email, senha }) {
  const payload = {
    email: email.trim().toLowerCase(),
    senha,
  };

  try {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (res.usuario && res.usuario.tipo && res.usuario.tipo.toUpperCase() !== 'BARBEIRO') {
      throw new Error('Esta conta não pertence ao perfil de Barbeiro.');
    }

    salvarSessao(res.token, res.usuario);
    return res;
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const lista = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_USERS) || '[]');
    const encontrado = lista.find(
      (u) => u.email === payload.email && u.senhaSimulada === payload.senha
    );
    if (!encontrado) {
      throw new Error('E-mail ou senha inválidos (ou cadastre um barbeiro primeiro).');
    }
    const tokenSimulado =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      btoa(JSON.stringify({ id: encontrado.id, tipo: 'BARBEIRO', email: encontrado.email })) +
      '.mock-signature';
    const usuarioPublico = {
      id: encontrado.id,
      nome: encontrado.nome,
      email: encontrado.email,
      telefone: encontrado.telefone,
      tipo: 'BARBEIRO',
    };
    salvarSessao(tokenSimulado, usuarioPublico);
    return {
      mensagem: 'Login realizado com sucesso! (Modo simulação local — API offline)',
      token: tokenSimulado,
      usuario: usuarioPublico,
      _offline: true,
    };
  }
}

/* ==================== #19 GERENCIAMENTO DE SERVIÇOS ==================== */

async function listarServicosBarbeiro() {
  const usuario = obterUsuarioLogado();
  const barbeiroId = usuario ? usuario.id : '';

  try {
    const query = barbeiroId ? `?barbeiroId=${encodeURIComponent(barbeiroId)}` : '';
    const data = await apiRequest(`/servicos${query}`, { method: 'GET' });
    return Array.isArray(data) ? data : data.servicos || [];
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_SERVICES) || '[]');
    return barbeiroId ? todos.filter((s) => s.barbeiroId === barbeiroId) : todos;
  }
}

async function criarServicoBarbeiro({ nome, descricao, duracaoMinutos, preco, ativo = true }) {
  const usuario = obterUsuarioLogado();
  const payload = {
    barbeiroId: usuario ? usuario.id : undefined,
    nome: nome.trim(),
    descricao: descricao ? descricao.trim() : null,
    duracaoMinutos: Number(duracaoMinutos),
    preco: Number(preco).toFixed(2),
    ativo: Boolean(ativo),
  };

  try {
    return await apiRequest('/servicos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_SERVICES) || '[]');
    const novo = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'srv-' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
    };
    todos.push(novo);
    localStorage.setItem(STORAGE_KEYS.MOCK_SERVICES, JSON.stringify(todos));
    return { mensagem: 'Serviço cadastrado com sucesso!', servico: novo, _offline: true };
  }
}

async function atualizarServicoBarbeiro(id, { nome, descricao, duracaoMinutos, preco, ativo }) {
  const payload = {
    nome: nome.trim(),
    descricao: descricao ? descricao.trim() : null,
    duracaoMinutos: Number(duracaoMinutos),
    preco: Number(preco).toFixed(2),
    ativo: Boolean(ativo),
  };

  try {
    return await apiRequest(`/servicos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_SERVICES) || '[]');
    const idx = todos.findIndex((s) => String(s.id) === String(id));
    if (idx === -1) throw new Error('Serviço não encontrado.');
    todos[idx] = { ...todos[idx], ...payload };
    localStorage.setItem(STORAGE_KEYS.MOCK_SERVICES, JSON.stringify(todos));
    return { mensagem: 'Serviço atualizado com sucesso!', servico: todos[idx], _offline: true };
  }
}

async function removerServicoBarbeiro(id) {
  try {
    return await apiRequest(`/servicos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_SERVICES) || '[]');
    const filtrados = todos.filter((s) => String(s.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.MOCK_SERVICES, JSON.stringify(filtrados));
    return { mensagem: 'Serviço removido com sucesso!', _offline: true };
  }
}

/* ==================== #20 GERENCIAMENTO DE HORÁRIOS (DISPONIBILIDADE) ==================== */

async function listarHorariosBarbeiro() {
  const usuario = obterUsuarioLogado();
  const barbeiroId = usuario ? usuario.id : '';

  try {
    const query = barbeiroId ? `?barbeiroId=${encodeURIComponent(barbeiroId)}` : '';
    const data = await apiRequest(`/disponibilidades${query}`, { method: 'GET' });
    return Array.isArray(data) ? data : data.disponibilidades || data.horarios || [];
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_SLOTS) || '[]');
    return barbeiroId ? todos.filter((h) => h.barbeiroId === barbeiroId) : todos;
  }
}

async function criarHorarioBarbeiro({ inicio, fim }) {
  const dataInicio = new Date(inicio);
  const dataFim = new Date(fim);

  if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
    throw new Error('Informe uma data/hora válida para o início e o fim.');
  }

  // Regra definida em backend/src/models/Disponibilidade.ts:
  if (dataFim <= dataInicio) {
    throw new Error('O fim precisa ser posterior ao início.');
  }

  const usuario = obterUsuarioLogado();
  const payload = {
    barbeiroId: usuario ? usuario.id : undefined,
    inicio: dataInicio.toISOString(),
    fim: dataFim.toISOString(),
  };

  try {
    return await apiRequest('/disponibilidades', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_SLOTS) || '[]');
    const conflito = todos.some(
      (h) =>
        h.barbeiroId === payload.barbeiroId &&
        new Date(payload.inicio) < new Date(h.fim) &&
        new Date(payload.fim) > new Date(h.inicio)
    );
    if (conflito) {
      throw new Error('Já existe um horário disponível cadastrado que conflita com este intervalo.');
    }
    const novo = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'hor-' + Date.now(),
      ...payload,
      createdAt: new Date().toISOString(),
    };
    todos.push(novo);
    localStorage.setItem(STORAGE_KEYS.MOCK_SLOTS, JSON.stringify(todos));
    return { mensagem: 'Horário disponível cadastrado com sucesso!', disponibilidade: novo, _offline: true };
  }
}

async function removerHorarioBarbeiro(id) {
  try {
    return await apiRequest(`/disponibilidades/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    if (err.status || !isOfflineFallbackEnabled()) {
      throw err;
    }
    const todos = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOCK_SLOTS) || '[]');
    const filtrados = todos.filter((h) => String(h.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.MOCK_SLOTS, JSON.stringify(filtrados));
    return { mensagem: 'Horário removido com sucesso!', _offline: true };
  }
}

/* ==================== FLUXO DE AGENDAMENTO DO CLIENTE ==================== */

function exigirSessaoCliente() {
  const token = obterToken();
  const usuario = obterUsuarioLogado();
  if (!token || !usuario || usuario.tipo !== 'CLIENTE') {
    window.location.href = 'login-cliente.html?aviso=login_necessario';
    return null;
  }
  return { token, usuario };
}

async function listarBarbeirosCliente() {
  const data = await apiRequest('/barbeiros', { method: 'GET' });
  return Array.isArray(data) ? data : data.barbeiros || [];
}

async function listarHorariosLivresCliente({ barbeiroId, servicoId, data }) {
  const query = new URLSearchParams({ servicoId, data });
  const resultado = await apiRequest(
    `/barbeiros/${encodeURIComponent(barbeiroId)}/horarios-livres?${query}`,
    { method: 'GET' }
  );
  return Array.isArray(resultado) ? resultado : resultado.horarios || [];
}

async function criarAgendamentoCliente({ barbeiroId, servicoId, inicio }) {
  const sessao = exigirSessaoCliente();
  if (!sessao) throw new Error('Entre como cliente para realizar um agendamento.');

  return apiRequest('/agendamentos', {
    method: 'POST',
    body: JSON.stringify({
      clienteId: sessao.usuario.id,
      barbeiroId,
      servicoId,
      inicio,
    }),
  });
}

async function listarAgendamentosCliente() {
  const sessao = exigirSessaoCliente();
  if (!sessao) return [];
  const query = new URLSearchParams({ clienteId: sessao.usuario.id });
  const resultado = await apiRequest(`/agendamentos?${query}`, { method: 'GET' });
  return Array.isArray(resultado) ? resultado : resultado.agendamentos || [];
}

async function cancelarAgendamentoCliente(id) {
  return apiRequest(`/agendamentos/${encodeURIComponent(id)}/cancelar`, {
    method: 'PATCH',
  });
}

/* ==================== UI HELPERS ==================== */

function exibirMensagem(elementId, texto, tipo = 'success') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = texto;
  el.className = `alert show alert-${tipo}`;
}

function limparMensagem(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = '';
  el.className = 'alert';
}

function inicializarBarraApi() {
  const inputUrl = document.getElementById('api-base-url-input');
  const chkFallback = document.getElementById('api-fallback-checkbox');
  if (inputUrl) {
    inputUrl.value = getApiBaseUrl();
    inputUrl.addEventListener('change', (e) => {
      setApiBaseUrl(e.target.value);
    });
  }
  if (chkFallback) {
    chkFallback.checked = isOfflineFallbackEnabled();
    chkFallback.addEventListener('change', (e) => {
      setOfflineFallbackEnabled(e.target.checked);
    });
  }
}
