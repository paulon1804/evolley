export type TipoPartida =
    | "Oficial"
    | "Amistoso";

export type StatusPartida =
    | "Agendada"
    | "Em andamento"
    | "Finalizada"
    | "Cancelada";

export type MelhorDe = 3 | 5;

export interface Partida {
    id: string;

    equipeId: string;

    tipo: TipoPartida;

    adversario: string;

    competicao?: string;

    local?: string;

    data?: string;

    hora?: string;

    melhorDe: MelhorDe;

    status: StatusPartida;

    observacoes?: string;

    createdAt: string;

    updatedAt: string;
}