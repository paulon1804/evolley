export type FuncaoEscalacao =
    | "Titular"
    | "Reserva";

export interface AtletaEscalado {
    atletaId: string;
    funcao: FuncaoEscalacao;
    capitao: boolean;
    libero: boolean;
}

export interface EscalacaoPartida {
    id: string;
    partidaId: string;
    atletas: AtletaEscalado[];
    confirmada: boolean;
    createdAt: string;
    updatedAt: string;
}