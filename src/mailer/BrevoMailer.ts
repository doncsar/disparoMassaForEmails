import axios from 'axios';
import fs from 'fs';
import path from 'path';

export class BrevoMailer {
  private apiKey: string;
  private fromEmail: string;
  
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || '';
    this.fromEmail = process.env.FROM_EMAIL || 'financeiro@up-alagoas.org';
  }

  async sendEmail(to: string, nome: string, valor: number, mes: string) {
    if (!this.apiKey) {
      console.warn('[Brevo] API Key não configurada. Simulando envio...');
      return { success: true, simulado: true };
    }

    const htmlContent = this.getHTML(nome, valor, mes);
    
    try {
      await axios.post(
        'https://api.brevo.com/v3/smtp/email',
        {
          sender: { name: "UP Alagoas", email: this.fromEmail },
          to: [{ email: to, name: nome }],
          subject: `Contribuição Mensal - ${mes}`,
          htmlContent: htmlContent
        },
        {
          headers: {
            'api-key': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log(`[Brevo] Email enviado para ${to}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[Brevo] Falha ao enviar para ${to}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  private getHTML(nome: string, valor: number, mes: string): string {
    return `
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:20px;font-family:Arial,sans-serif;color:#222;">
        <h2 style="color:#d62828">Olá camarada ${nome},</h2>
        <p>Chegou o mês de <strong>${mes}</strong>, e com ele a contribuição mensal.</p>
        <p>Valor sugerido para você: <strong style="color:#d62828;font-size:1.4em;">R$ ${valor.toFixed(2)}</strong></p>
        <p>Chave PIX (CNPJ): <strong>36.930.541/0001-66</strong></p>
        <p><em>"O nosso sacrifício é a cota pela liberdade" — Che Guevara</em></p>
        <p><strong>Viva a luta socialista!</strong></p>
      </div>
    `;
  }
}