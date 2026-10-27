import type { FormatoJogoRapido } from "./JogoRapido";
import type { PontosPorSet } from "./Partida";

export type StatusTorneio =
    | "Planejado"
    | "Em andamento"
    | "Finalizado"
    | "Cancelado";

export type FormatoTorneio = FormatoJogoRapido;

export interface Torneio {
    id: string;
    nome: string;
    formato: FormatoTorneio;
    pontosPorSet?: PontosPorSet;
    equipesIds?: string[];
    local?: string;
    dataInicio?: string;
    dataFim?: string;
    status: StatusTorneio;
    observacoes?: string;
    createdAt: string;
    updatedAt: string;
}
