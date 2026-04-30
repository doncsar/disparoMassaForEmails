import express from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { CobrancaService } from './services/CobrancaService';
import { supabase } from './config/database';

dotenv.config();
const app = express();
app.use(express.json());

const cobrancaService = new CobrancaService();

// Rota manual (caso queiram disparar fora do horário)
app.post('/api/disparar-cobrancas', async (req, res) => {
  const mes = req.body.mes || new Date().toISOString().slice(0, 7); // YYYY-MM
  try {
    const resultado = await cobrancaService.dispararCobrancas(mes);
    res.json({ sucesso: true, ...resultado });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

// Rota para cadastrar filiado
app.post('/api/filiados', async (req, res) => {
  const { data, error } = await supabase.from('filiados').insert(req.body);
  if (error) return res.status(400).json({ erro: error.message });
  res.json(data);
});

// Rota para listar pendentes do mês
app.get('/api/pendentes', async (req, res) => {
  const { data, error } = await supabase.from('pendentes_mes_atual').select('*');
  if (error) return res.status(500).json({ erro: error.message });
  res.json(data);
});

// Agendamento: Todo dia 5 de cada mês às 9h
cron.schedule('0 9 5 * *', () => {
  const mesAtual = new Date().toISOString().slice(0, 7);
  console.log(`[Cron] Iniciando cobrança automática: ${mesAtual}`);
  cobrancaService.dispararCobrancas(mesAtual);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Agendamento ativo: Todo dia 5, 9h da manhã');
});