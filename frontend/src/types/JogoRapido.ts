export type FormatoJogoRapido =
    | "2x2"
    | "6x6";

export type TimeJogoRapido =
    | "A"
    | "B";

export type AcaoJogoRapido =
    | "Saque"
    | "Passe"
    | "Levantamento"
    | "Ataque"
    | "Bloqueio"
    | "Defesa";

export type ResultadoJogoRapido =
    | "Ace"
    | "Ponto"
    | "A"
    | "B"
    | "C"
    | "Positivo"
    | "Neutro"
    | "Negativo"
    | "Erro";

export interface JogadorJogoRapido {
    id: string;
    numero: number;
    nome: string;
    time: TimeJogoRapido;
}

export interface EventoJogoRapido {
    id: string;

    jogoId: string;
    jogadorId: string;
    time: TimeJogoRapido;

    acao: AcaoJogoRapido;
    resultado: ResultadoJogoRapido;

    pontosTimeAAntes: number;
    pontosTimeBAntes: number;

    pontosTimeADepois: number;
    pontosTimeBDepois: number;

    criadoEm: string;
}

export interface JogoRapido {
    id: string;

    formato: FormatoJogoRapido;

    jogadores: JogadorJogoRapido[];

    pontosTimeA: number;
    pontosTimeB: number;

    status:
    | "Em andamento"
    | "Finalizado";

    iniciadoEm: string;
    finalizadoEm?: string;
}