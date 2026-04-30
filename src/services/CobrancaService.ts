import { supabase } from '../config/database';
import { BrevoMailer } from '../mailer/BrevoMailer';

export class CobrancaService {
  private mailer = new BrevoMailer();

  async dispararCobrancas(mesReferencia: string) {
    // Busca filiados ativos que ainda não receberam cobrança este mês
    const { data: pendentes, error } = await supabase
      .from('filiados')
      .select('*')
      .eq('ativo', true)
      .not('id', 'in', 
        supabase.from('cobrancas')
          .select('filiado_id')
          .eq('mes_referencia', mesReferencia)
      );

    if (error) {
      console.error('[CobrancaService] Erro ao buscar pendentes:', error);
      throw new Error('Erro ao consultar banco de dados');
    }

    console.log(`[CobrancaService] Encontrados ${pendentes?.length || 0} filiados pendentes`);

    let enviados = 0;
    let falhas = 0;

    for (const filiado of pendentes || []) {
      try {
        // Envia email
        const result = await this.mailer.sendEmail(
          filiado.email,
          filiado.nome,
          filiado.valor_sugerido || 15,
          mesReferencia
        );

        // Registra no banco (para não spamar)
        await supabase.from('cobrancas').insert({
          filiado_id: filiado.id,
          mes_referencia: mesReferencia,
          enviado_em: new Date().toISOString(),
          pago: false
        });

        if (result.success) enviados++;
        else falhas++;

        // Delay de 2 segundos entre envios (respeita rate limit)
        await new Promise(r => setTimeout(r, 2000));
        
      } catch (err) {
        console.error(`[CobrancaService] Falha no processo para ${filiado.email}:`, err);
        falhas++;
      }
    }

    return { enviados, falhas, total: pendentes?.length || 0 };
  }

  async marcarComoPago(filiadoId: string, mes: string, valor: number) {
    return await supabase
      .from('cobrancas')
      .update({ 
        pago: true, 
        pago_em: new Date().toISOString(), 
        valor_pago: valor 
      })
      .eq('filiado_id', filiadoId)
      .eq('mes_referencia', mes);
  }
}