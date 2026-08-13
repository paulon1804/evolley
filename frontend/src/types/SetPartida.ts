export type StatusSet =
    | "Não iniciado"
    | "Em andamento"
    | "Finalizado";

export interface SetPartida {
    id: string;
    partidaId: string;
    numero: number;
    pontosEquipe: number;
    pontosAdversario: number;
    status: StatusSet;
    iniciadoEm?: string;
    finalizadoEm?: string;
}