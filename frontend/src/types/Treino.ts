export type StatusTreino =
    | "Planejado"
    | "Em andamento"
    | "Finalizado";

export type FundamentoTreino =
    | "Saque"
    | "Recepção"
    | "Levantamento"
    | "Ataque"
    | "Bloqueio"
    | "Defesa"
    | "Físico"
    | "Tático";

export type IntensidadeAtividade =
    | "Leve"
    | "Moderada"
    | "Alta"
    | "Máxima";

export interface ParticipanteTreino {
    atletaId: string;
    presente: boolean;
}

export interface AtividadeTreino {
    id: string;
    nome: string;
    fundamento: FundamentoTreino;
    intensidade: IntensidadeAtividade;
    duracaoMinutos?: number;
    tempoExecutadoSegundos?: number;

    /*
     * Quando undefined, considera todos os participantes
     * presentes no treino. Isso mantém compatibilidade
     * com treinos antigos já salvos.
     */
    participantesAtividadeIds?: string[];

    observacoes?: string;
}

export interface Treino {
    id: string;
    equipeId: string;
    data: string;
    objetivo: string;
    observacoes: string;
    status: StatusTreino;
    participantes: ParticipanteTreino[];
    atividades: AtividadeTreino[];
    createdAt: string;
    updatedAt: string;
}

export interface EventoTreino {
    id: string;
    treinoId: string;
    atividadeId: string;
    atletaId: string;
    fundamento: FundamentoTreino;
    resultado: string;
    criadoEm: string;
}