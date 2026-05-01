# Disparo Massa

---

## 🏗️ Arquitetura Atual (v2.0 — Sistema de Cobrança)

### O que mudou

A aplicação evoluiu de um simples disparador de emails para um **sistema de cobrança mensal automatizado** com controle de estado, filas de envio e persistência de dados.

### Estrutura de pastas
src/
├── app.ts                    # Servidor Express + agendamento cron
├── config/
│   └── database.ts           # Cliente Supabase (PostgreSQL)
├── services/
│   └── CobrancaService.ts   # Lógica de negócio: filas, batches, rate limits
├── mailer/
│   └── BrevoMailer.ts       # Envio via API Brevo (300 emails/dia grátis)
└── apis/
└── rotas.ts             # Rotas HTTP da API (mantido para compatibilidade)


### Fluxo de trabalho

1. **Dia 5 de cada mês, 9h** → Cron dispara automaticamente
2. **CobrancaService** consulta filiados ativos que ainda não foram cobrados no mês
3. **Envio em batches** → Respeita rate limit do provedor (2s entre emails)
4. **Registro no banco** → Cada envio é logado para evitar spam duplicado
5. **Fallback manual** → Rota POST `/api/disparar-cobrancas` para acionamento fora do horário

### Tecnologias adicionadas

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Banco de dados | **Supabase** (PostgreSQL) | Gratuito até 500MB, API REST integrada, GDPR |
| Email transacional | **Brevo API** | 300 emails/dia grátis, melhor entregabilidade que SMTP Gmail |
| Agendamento | **node-cron** | Nativo Node.js, sem dependência externa |
| Type safety | **Axios** | HTTP client tipado para chamadas à API Brevo |

### Variáveis de ambiente (.env)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Email (fallback Gmail — deprecado, manter para contingência)
SMTP_FROM=seuemail@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASSWORD=sua_senha_de_app

# Supabase (obrigatório para v2.0)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...

# Brevo (obrigatório para envio em produção)
BREVO_API_KEY=xkeysib-...
FROM_EMAIL=financeiro@copbrancas.org.ia.dev.exemplo
```

🚀 Próximos passos (roadmap)
Fase 1 — Infraestrutura (
[ ] Criar projeto no Supabase 
[ ] Executar script SQL acima no editor
[ ] Gerar API Key no Brevo
[ ] Preencher .env com credenciais reais
[ ] Testar rota POST /api/disparar-cobrancas com 1 filiado de teste
Fase 2 — Escalabilidade
[ ] Implementar sistema de filas com status e tentativas (já estruturado no banco)
[ ] Adicionar rota GET /api/status-cobranca?mes=YYYY-MM para dashboard
[ ] Criar múltiplas contas Brevo (sharding) se filiados > 300
[ ] Implementar retry automático para falhas transitórias
Fase 3 — Soberania digital (médio prazo)
[ ] Migrar banco para servidor físico do partido (PostgreSQL local)
[ ] Substituir Brevo por SMTP próprio ou servidor de email auto-hospedado
[ ] Implementar backup criptografado (VeraCrypt) dos dados de filiados
[ ] Documentar política de LGPD interna

POST: <http://localhost:3000/api/contribuicao-mensal>

Body:

```json
[
  {
    "nome": "José",
    "email": "jose@mail.com",
    "telefone": "82999999999"
  },
  {
    "nome": "Maria",
    "email": "maria@mail.com",
    "telefone": "82988888888"
  }
]
```
