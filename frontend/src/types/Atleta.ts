export type PosicaoAtleta =
    | "Levantador"
    | "Oposto"
    | "Ponteiro"
    | "Central"
    | "Líbero";

export type BracoDominante =
    | "Direito"
    | "Esquerdo"
    | "Ambidestro";

export interface Atleta {
    id: string;
    nome: string;
    numero: number;
    posicao: PosicaoAtleta;
    dataNascimento: string;
    altura?: number;
    peso?: number;
    bracoDominante: BracoDominante;
    equipeId: string;
    ativo: boolean;
    observacoes?: string;
}