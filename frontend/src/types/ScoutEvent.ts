import type { PosicaoQuadra } from "./Formacao";

export type FundamentoScout =
    | "Saque"
    | "Recepção"
    | "Ataque"
    | "Bloqueio"
    | "Defesa"
    | "Levantamento";

export type ResultadoScout =
    | "Ponto"
    | "Ace"
    | "A"
    | "B"
    | "C"
    | "Positivo"
    | "Neutro"
    | "Negativo"
    | "Erro";

export type ImpactoPlacar =
    | "Nenhum"
    | "PontoEquipe"
    | "PontoAdversario";

export interface ScoutEvent {
    id: string;

    partidaId: string;
    setId: string;
    atletaId: string;

    fundamento: FundamentoScout;
    resultado: ResultadoScout;

    impactoPlacar: ImpactoPlacar;

    posicaoQuadra?: PosicaoQuadra;

    pontosEquipeAntes: number;
    pontosAdversarioAntes: number;

    pontosEquipeDepois: number;
    pontosAdversarioDepois: number;

    criadoEm: string;
}