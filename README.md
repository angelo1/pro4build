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

O projeto não requer framework, instalação de dependências, compilação, base de dados ou variáveis de ambiente.

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
- O formulário pede nome, email e telefone e **não envia contactos automaticamente**. Gera um briefing local com esses dados. Uma ligação abre o programa de email para o visitante anexar o ficheiro e confirmar o envio para angelo.belchior@pro4build.com.
- O relatório de obra tem dados fictícios; não existe autenticação, área de cliente ou ligação a obras reais.
- A imagem de moradia é uma visualização gerada, não um projeto executado.
- Não há analytics, publicidade ou serviço de email configurado.
- Preços, suplementos, IVA e prazos dos simuladores são pressupostos indicativos. Validar a tabela comercial antes do lançamento.
- O cálculo de terreno não consulta PDM nem confirma edificabilidade.
- A política de privacidade está em public/privacidade.html e identifica a AART, Lda., NIF 513442740. O contacto de privacidade aprovado é angelo.belchior@pro4build.com. Antes de ativar envio automático, definir o prestador, segurança, conservação e transferências, e atualizar esta política.

## Continuar o trabalho no Codex

Abra o repositório no Codex. Indicação inicial sugerida:

> Continua o website pro4build existente. Mantém a identidade visual e o conteúdo em português de Portugal. O site estático está em public e publica na Vercel. Consulta o README antes de alterar os formulários e simuladores. O próximo passo é integrar a receção de pedidos com um serviço escolhido pelo proprietário, sem apresentar sucesso de envio antes de confirmação do servidor.

## Assets e fontes

Lettering do logotipo em contornos SVG. As fontes URW Gothic e a respetiva licença encontram-se em public/assets/FONT-LICENSE.txt. Preserve a licença se distribuir as fontes.

Exportação da versão do website de 20/10/2026. O ZIP não inclui credenciais, histórico Git ou configuração do alojamento anterior.
