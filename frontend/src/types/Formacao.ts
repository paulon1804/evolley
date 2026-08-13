export type PosicaoQuadra = 1 | 2 | 3 | 4 | 5 | 6;

export interface JogadorEmQuadra {
    atletaId: string;
    posicao: PosicaoQuadra;
}

export interface Formacao {
    id: string;
    partidaId: string;
    setId: string;
    jogadores: JogadorEmQuadra[];
    createdAt: string;
    updatedAt: string;
}