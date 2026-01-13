# 🌅 Morning Brief

**Portal de notícias de geopolítica em áudio para público americano conservador 45-65+**

Um site de briefings diários de notícias com foco em geopolítica, entregues em formato de áudio curto (1-2 minutos cada).

## ✨ Features

- 🎧 **Áudio Briefings** - Resumos em áudio de 1-2 minutos cada
- 📰 **Curadoria AI** - Seleção automática das notícias mais importantes
- 🎯 **Foco em Geopolítica** - China, Rússia, Oriente Médio, Europa, Economia
- 📱 **PWA Ready** - Funciona como app no celular (Add to Home Screen)
- 📧 **Newsletter** - Briefing diário por email às 6 AM EST
- 🎨 **Design Acessível** - Fontes grandes, contraste alto, botões grandes

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas API keys

# 3. Rodar em desenvolvimento
npm run dev

# 4. Abrir no navegador
open http://localhost:3000
```

## 🔧 Configuração das APIs

### 1. TheNewsAPI (Notícias)
- Site: https://www.thenewsapi.com/
- Plano: Basic ($19/mês) - 2,500 requests/dia
- Adicione: `THENEWSAPI_KEY=xxx` no `.env.local`

### 2. AI Summarization (Escolha um)

**Claude (Recomendado)**
- Site: https://console.anthropic.com/
- Modelo: `claude-3-haiku-20240307` (mais barato)
- Custo: ~$0.25/1M tokens input
- Adicione: `ANTHROPIC_API_KEY=xxx`

**OpenAI (Alternativa)**
- Site: https://platform.openai.com/
- Modelo: `gpt-4o-mini`
- Adicione: `OPENAI_API_KEY=xxx`

### 3. Amazon Polly (Text-to-Speech)
- Console: https://console.aws.amazon.com/polly
- Free tier: 5M caracteres/mês por 12 meses
- Voz recomendada: `Joanna` ou `Matthew` com estilo Newscaster
- Adicione no `.env.local`:
  ```
  AWS_ACCESS_KEY_ID=xxx
  AWS_SECRET_ACCESS_KEY=xxx
  AWS_REGION=us-east-1
  ```

## 📁 Estrutura do Projeto

```
morning-brief/
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout principal com header/footer
│   │   ├── page.tsx        # Página inicial
│   │   └── globals.css     # Estilos globais + tema
│   ├── components/
│   │   ├── AudioPlayer.tsx    # Player de áudio com controles
│   │   ├── BriefingCard.tsx   # Card de notícia
│   │   └── NewsletterForm.tsx # Formulário de newsletter
│   ├── lib/
│   │   ├── news-api.ts     # Integração TheNewsAPI
│   │   ├── ai-summarize.ts # Geração de resumos com AI
│   │   └── tts-polly.ts    # Text-to-Speech com Polly
│   └── types/
│       └── index.ts        # TypeScript types
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── icons/              # Ícones do app
│   └── audio/              # Arquivos de áudio
└── .env.example            # Template de variáveis
```

## 🎯 Pipeline de Geração de Conteúdo

```
1. Buscar notícias (TheNewsAPI)
   └─> 50 artigos de geopolítica

2. Filtrar e ranquear (Claude Haiku)
   └─> Top 5-7 mais importantes

3. Gerar resumos (Claude Sonnet)
   └─> Título, resumo, "What to watch"

4. Gerar áudio (Amazon Polly)
   └─> MP3 com voz Newscaster

5. Publicar no site
   └─> Upload para R2, atualizar DB
```

## 💰 Custos Estimados (Mensal)

| Serviço | Custo |
|---------|-------|
| TheNewsAPI | $19 |
| Claude AI | $8-15 |
| Amazon Polly | $0 (free tier) |
| Cloudflare R2 | $0 (free tier) |
| Hospedagem (Vercel) | $0 (hobby) |
| **Total** | **~$27-35/mês** |

## 📈 Próximos Passos

- [ ] Integrar TheNewsAPI
- [ ] Configurar AWS Polly
- [ ] Criar pipeline de automação (n8n ou cron)
- [ ] Deploy na Vercel
- [ ] Configurar analytics (Google Analytics)
- [ ] Integrar newsletter (ConvertKit/Mailchimp)
- [ ] Implementar armazenamento de áudio (R2)

## 🚢 Deploy

```bash
# Build para produção
npm run build

# Deploy na Vercel (recomendado)
npx vercel

# Ou use o dashboard da Vercel:
# 1. Conecte o repositório
# 2. Configure variáveis de ambiente
# 3. Deploy automático em cada push
```

## 📞 Suporte

Criado para o canal Reality Stones / Morning Brief.

---

**Morning Brief** - Your trusted daily geopolitics briefing 🌅
