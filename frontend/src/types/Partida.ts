export type TipoPartida =
    | "Oficial"
    | "Amistoso";

export type StatusPartida =
    | "Agendada"
    | "Em andamento"
    | "Finalizada"
    | "Cancelada";

export type MelhorDe = 1 | 3 | 5;

export type PontosPorSet = 12 | 15;

export interface Partida {
    id: string;

    equipeId: string;

    tipo: TipoPartida;

    adversario: string;

    /*
     * Quando o adversário é uma equipe cadastrada, o scout
     * pode ser registrado para os dois times. O campo
     * "adversario" guarda o nome para exibição.
     */
    adversarioEquipeId?: string;

    competicao?: string;

    torneioId?: string;

    /*
     * Quando definido, todos os sets da partida terminam
     * nesta pontuação. Quando undefined, vale a regra
     * padrão (25 pontos e 15 no set decisivo).
     */
    pontosPorSet?: PontosPorSet;

    local?: string;

    data?: string;

    hora?: string;

    melhorDe: MelhorDe;

    status: StatusPartida;

    observacoes?: string;

    createdAt: string;

    updatedAt: string;
}