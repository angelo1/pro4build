# pro4build

Website de construção de moradias com identidade visual própria, fases de construção, demonstração de acompanhamento de obra e três simuladores.

## Publicar na Vercel

1. Extraia o ZIP.
2. Coloque **o conteúdo da pasta pro4build-github** na raiz de um repositório GitHub. Na raiz devem ficar este README, vercel.json, tests e public.
3. Na Vercel, importe esse repositório.
4. Use a raiz do repositório como Root Directory. O ficheiro vercel.json configura o site estático.
5. Se precisar de preencher os campos manualmente: Framework Preset = Other; Build Command vazio; Output Directory = public.
6. Publique e teste a página inicial e /simuladores.html.
7. Nas definições do projeto Vercel, adicione pro4build.com e siga os registos DNS que a plataforma indicar.

O site não requer framework nem compilação. A função de envio em api/contacto.js usa Node.js e Nodemailer. Instalar dependências com npm ci; configurar SMTP na Vercel antes de ativar o formulário automático.

## Executar localmente

Na pasta do projeto, com Python 3:

```bash
python3 -m http.server 8000 --directory public
```

Abra http://localhost:8000. Os assets são locais; não há dependências de serviços do alojamento anterior.

## Ficheiros principais

- public/index.html — página inicial.
- public/style.css — estilos e adaptação a telemóvel.
- public/app.js — fases da construção, relatório demonstrativo, formulário e briefing.
- public/simuladores.html — página com orçamento, prazo e terreno.
- public/simuladores.css — estilos dos simuladores.
- public/simulator-model.js — fórmulas de cálculo, independentes da interface.
- public/simuladores.js — interface e exportação de resultados.
- public/assets — logotipos vetoriais, imagem arquitetónica e fontes.
- tests/model.test.cjs — verificações dos cálculos.
- vercel.json — configuração de publicação.

## Testes

Com Node.js 18 ou superior:

```bash
node --test tests/model.test.cjs
```

## Estado funcional

- Navegação, fases, separadores do relatório, simuladores e download de briefing funcionam no navegador.
- As simulações podem ser guardadas como texto ou impressas.
- O botão de preparar projeto transporta a simulação para o briefing na página inicial através de sessionStorage.
- O formulário envia os pedidos por POST /api/contacto para o SMTP do domínio, com destinatário fixo geral@pro4build.com e Reply-To do visitante. Só apresenta aceitação após confirmação SMTP. Mantém download de cópia local e alternativa de email direto.
- O relatório de obra tem dados fictícios; não existe autenticação, área de cliente ou ligação a obras reais.
- A imagem de moradia é uma visualização gerada, não um projeto executado.
- Não há analytics nem publicidade. O envio depende das variáveis SMTP configuradas no servidor.
- Preços, suplementos, IVA e prazos dos simuladores são pressupostos indicativos. Validar a tabela comercial antes do lançamento.
- O cálculo de terreno não consulta PDM nem confirma edificabilidade.
- A política de privacidade está em public/privacidade.html e identifica a AART, Lda., NIF 513442740. O contacto de privacidade aprovado é geral@pro4build.com. Confirmar o fornecedor SMTP e respetivas condições de conservação e transferências antes da ativação.

## Continuar o trabalho no Codex

Abra o repositório no Codex. Indicação inicial sugerida:

> Continua o website pro4build existente. Mantém a identidade visual e o conteúdo em português de Portugal. O site estático está em public e publica na Vercel. Consulta o README antes de alterar os formulários e simuladores. O próximo passo é integrar a receção de pedidos com um serviço escolhido pelo proprietário, sem apresentar sucesso de envio antes de confirmação do servidor.

## Assets e fontes

Lettering do logotipo em contornos SVG. As fontes URW Gothic e a respetiva licença encontram-se em public/assets/FONT-LICENSE.txt. Preserve a licença se distribuir as fontes.

Exportação da versão do website de 20/10/2026. O ZIP não inclui credenciais, histórico Git ou configuração do alojamento anterior.

## Envio automático por SMTP

Na Vercel, no projeto ligado a **www.pro4build.com**, configurar em Settings → Environment Variables (Production):

- `SMTP_HOST`: `cp104.redewt.net` (servidor indicado pelo proprietário).
- `SMTP_PORT`: `465` (TLS, ligação e certificado verificados). Também suporta `587` com STARTTLS obrigatório.
- `SMTP_USER`: utilizador da conta, normalmente `geral@pro4build.com`.
- `SMTP_PASSWORD`: password SMTP ou password de aplicação, apenas na Vercel.
- `SMTP_FROM`: endereço remetente autorizado; normalmente `geral@pro4build.com`.

Não guardar credenciais em ficheiros versionados. Usar `.env.example` apenas como modelo. Confirmar autenticação SMTP permitida pelo fornecedor, SPF/DKIM e acesso da Vercel à porta escolhida. Depois de definir as variáveis, efetuar novo deploy e enviar um pedido de teste para confirmar a receção na caixa (incluindo spam). Uma resposta 202 significa aceitação pelo SMTP, não entrega garantida ao destinatário.

O endpoint valida origem, formato, limites de campos e honeypot. Não aceita destinatários enviados pelo navegador e não permite anexos/URLs arbitrários. Ativar limitação de pedidos no firewall da Vercel conforme o tráfego; não existe limitação distribuída de pedidos na aplicação. Não repetir automaticamente mensagens com estado incerto.

`npm test` executa testes de cálculo e de envio com transporte simulado, sem usar credenciais reais. O servidor estático Python não executa `/api/contacto`; o teste integrado requer Vercel Preview/Production com SMTP configurado.

## Landing page Setúbal

A rota `/setubal` é reescrita pela Vercel para `public/setubal.html`, com CSS e JavaScript próprios e os assets de marca existentes. O formulário usa `/api/contacto`, com os mesmos requisitos e credenciais SMTP da página inicial. Inclui `origem=/setubal` no email e identifica Setúbal no assunto, sem cookies de marketing ou pixels adicionais. A comparação de valores é apresentada como possibilidade dependente de análise, com exclusões e FAQ; não são publicados preços, imóveis disponíveis ou testemunhos não verificados.
