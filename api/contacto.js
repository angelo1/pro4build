const nodemailer = require('nodemailer');

const RECIPIENT = 'geral@pro4build.com';
const ORIGINS = new Set(['https://pro4build.com', 'https://www.pro4build.com']);
const FIELDS = {nome:100, email:254, telefone:30, local:100, fase:100, area:100, investimento:100, ideia:10000, origem:200};
const REQUIRED = ['nome', 'email', 'telefone', 'local', 'fase'];

function createHandler({env = process.env, createTransport = nodemailer.createTransport} = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({error:'Método não permitido.'});
    }
    if (!ORIGINS.has(req.headers.origin)) return res.status(403).json({error:'Origem não permitida.'});
    if (!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type'] || '')) {
      return res.status(415).json({error:'Formato não suportado.'});
    }
    if (Number(req.headers['content-length']) > 50000) return res.status(413).json({error:'Pedido demasiado longo.'});
    let input;
    try { input = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
    catch { return res.status(400).json({error:'Pedido inválido.'}); }
    if (!input || Array.isArray(input) || typeof input !== 'object') return res.status(400).json({error:'Pedido inválido.'});
    if (input.website) return res.status(400).json({error:'Não foi possível validar o pedido.'});
    const data = {};
    for (const [name, max] of Object.entries(FIELDS)) {
      const value = input[name] === undefined ? '' : input[name];
      if (typeof value !== 'string' || value.length > max || (name !== 'ideia' && /[\r\n]/.test(value))) {
        return res.status(400).json({error:'Verifique os campos e o tamanho da mensagem.'});
      }
      data[name] = value.trim();
    }
    if (REQUIRED.some(name => !data[name]) || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) ||
        !/^[+\d\s().-]{6,30}$/.test(data.telefone)) {
      return res.status(400).json({error:'Preencha nome, email, telefone, local e situação do projeto com dados válidos.'});
    }
    const port = Number(env.SMTP_PORT);
    const from = env.SMTP_FROM || env.SMTP_USER;
    if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASSWORD || ![465,587].includes(port) ||
        !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(from || '')) {
      return res.status(503).json({error:'O envio está temporariamente indisponível. Contacte geral@pro4build.com.'});
    }
    let transport;
    try {
      transport = createTransport({host:env.SMTP_HOST, port, secure:port === 465, requireTLS:port === 587,
        auth:{user:env.SMTP_USER, pass:env.SMTP_PASSWORD},
        connectionTimeout:10000, greetingTimeout:10000, socketTimeout:15000,
        tls:{minVersion:'TLSv1.2'}, logger:false, debug:false,
        disableFileAccess:true, disableUrlAccess:true});
      const labels = {nome:'Nome',email:'Email',telefone:'Telefone',local:'Local da construção',fase:'Situação',area:'Área',investimento:'Investimento previsto',ideia:'Ideia e prioridades',origem:'Página de origem'};
      const text = 'PRO4BUILD — NOVO PEDIDO DE PROJETO\n\n' + Object.entries(labels).map(([key,label]) => label + ': ' + (data[key] || 'Não indicado')).join('\n\n');
      const result = await transport.sendMail({from:{name:'Pro4build — Website',address:from}, to:RECIPIENT,
        replyTo:{name:data.nome,address:data.email}, subject:data.origem === '/setubal' ? 'Novo pedido de projeto — Pro4build | Setúbal' : 'Novo pedido de projeto — Pro4build', text,
        disableFileAccess:true, disableUrlAccess:true});
      if (!result.accepted?.some(address => String(address).toLowerCase() === RECIPIENT)) throw new Error('Recipient not accepted');
      return res.status(202).json({ok:true});
    } catch {
      // Não expor credenciais, respostas SMTP ou dados pessoais nos logs/resposta.
      return res.status(502).json({error:'Não foi possível confirmar o envio. Contacte geral@pro4build.com antes de repetir o pedido.'});
    } finally { transport?.close(); }
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
