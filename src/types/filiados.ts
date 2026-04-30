export interface Filiado {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  categoria: 'desempregado' | 'trabalhador';
  renda_mensal?: number;
  valor_sugerido?: number;
}