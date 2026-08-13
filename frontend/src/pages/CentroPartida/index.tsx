import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RemoveIcon from "@mui/icons-material/Remove";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import StopIcon from "@mui/icons-material/Stop";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Divider,
    FormControlLabel,
    MenuItem,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import type { Atleta } from "../../types/Atleta";
import type { Equipe } from "../../types/Equipe";
import type { Partida } from "../../types/Partida";
import type { SetPartida } from "../../types/SetPartida";

import type {
    AtletaEscalado,
    EscalacaoPartida,
    FuncaoEscalacao,
} from "../../types/Escalacao";

import type {
    Formacao,
    JogadorEmQuadra,
    PosicaoQuadra,
} from "../../types/Formacao";

import type {
    FundamentoScout,
    ImpactoPlacar,
    ResultadoScout,
    ScoutEvent,
} from "../../types/ScoutEvent";



function CentroPartida() {
    const { partidaId } = useParams();
    const navigate = useNavigate();

    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [atletas, setAtletas] = useState<Atleta[]>([]);
    const [sets, setSets] = useState<SetPartida[]>([]);
    const [escalacoes, setEscalacoes] =
        useState<EscalacaoPartida[]>([]);
    const [formacoes, setFormacoes] =
        useState<Formacao[]>([]);
    const [scoutEvents, setScoutEvents] =
        useState<ScoutEvent[]>([]);

    const [atletaScoutId, setAtletaScoutId] =
        useState("");

    const [fundamentoScout, setFundamentoScout] =
        useState<FundamentoScout | "">("");

    const [resultadoScout, setResultadoScout] =
        useState<ResultadoScout | "">("");

    const [escalacaoAtual, setEscalacaoAtual] =
        useState<AtletaEscalado[]>([]);

    const [impactoPlacar, setImpactoPlacar] =
        useState<ImpactoPlacar>("Nenhum");

    const [erro, setErro] = useState("");

    /*
     * ============================================================
     * CARREGAMENTO
     * ============================================================
     */

    useEffect(() => {
        try {
            const partidasSalvas =
                localStorage.getItem("evolley-partidas");

            const equipesSalvas =
                localStorage.getItem("evolley-equipes");

            const atletasSalvos =
                localStorage.getItem("evolley-atletas");

            const setsSalvos =
                localStorage.getItem("evolley-sets");

            const escalacoesSalvas =
                localStorage.getItem("evolley-escalacoes");

            const formacoesSalvas =
                localStorage.getItem("evolley-formacoes");

            const scoutSalvo =
                localStorage.getItem(
                    "evolley-scout-events",
                );

            if (partidasSalvas) {
                setPartidas(
                    JSON.parse(partidasSalvas),
                );
            }

            if (equipesSalvas) {
                setEquipes(
                    JSON.parse(equipesSalvas),
                );
            }

            if (atletasSalvos) {
                setAtletas(
                    JSON.parse(atletasSalvos),
                );
            }

            if (setsSalvos) {
                setSets(
                    JSON.parse(setsSalvos),
                );
            }

            if (escalacoesSalvas) {
                const dados: EscalacaoPartida[] =
                    JSON.parse(escalacoesSalvas);

                setEscalacoes(dados);
            }

            if (formacoesSalvas) {
                const dados: Formacao[] =
                    JSON.parse(formacoesSalvas);

                setFormacoes(dados);
            }

            if (scoutSalvo) {
                const dados: ScoutEvent[] =
                    JSON.parse(scoutSalvo);

                setScoutEvents(dados);
            }
        } catch {
            setErro(
                "Não foi possível carregar os dados da partida.",
            );
        }
    }, []);

    /*
     * ============================================================
     * DADOS DA PARTIDA
     * ============================================================
     */

    const partida = useMemo(
        () =>
            partidas.find(
                (item) =>
                    item.id === partidaId,
            ),
        [partidas, partidaId],
    );

    const equipe = useMemo(
        () =>
            equipes.find(
                (item) =>
                    item.id === partida?.equipeId,
            ),
        [equipes, partida],
    );

    const atletasDaEquipe = useMemo(
        () =>
            atletas.filter(
                (atleta) =>
                    atleta.equipeId ===
                    partida?.equipeId &&
                    atleta.ativo,
            ),
        [atletas, partida],
    );

    const setsDaPartida = useMemo(
        () =>
            sets
                .filter(
                    (item) =>
                        item.partidaId ===
                        partidaId,
                )
                .sort(
                    (a, b) =>
                        a.numero - b.numero,
                ),
        [sets, partidaId],
    );

    const setAtual = useMemo(
        () =>
            setsDaPartida.find(
                (set) =>
                    set.status ===
                    "Em andamento",
            ),
        [setsDaPartida],
    );

    const escalacaoSalva = useMemo(
        () =>
            escalacoes.find(
                (item) =>
                    item.partidaId ===
                    partidaId,
            ),
        [escalacoes, partidaId],
    );

    useEffect(() => {
        if (!escalacaoSalva) {
            return;
        }

        setEscalacaoAtual(
            escalacaoSalva.atletas,
        );
    }, [escalacaoSalva]);

    const titulares = useMemo(
        () =>
            escalacaoAtual.filter(
                (item) =>
                    item.funcao ===
                    "Titular",
            ),
        [escalacaoAtual],
    );

    const formacaoAtual = useMemo(
        () =>
            formacoes.find(
                (formacao) =>
                    formacao.setId ===
                    setAtual?.id,
            ),
        [formacoes, setAtual],
    );

    /*
     * ============================================================
     * SCOUT
     * ============================================================
     */

    const fundamentos: FundamentoScout[] = [
        "Saque",
        "Recepção",
        "Ataque",
        "Bloqueio",
        "Defesa",
        "Levantamento",
    ];

    const resultados: ResultadoScout[] = [
        "Ponto",
        "Positivo",
        "Neutro",
        "Negativo",
        "Erro",
    ];

    const impactosPlacar: ImpactoPlacar[] = [
        "Nenhum",
        "PontoEquipe",
        "PontoAdversario",
    ];

    const atletasDisponiveisScout =
        useMemo(() => {
            if (!escalacaoSalva) {
                return [];
            }

            return escalacaoSalva.atletas
                .map((item) =>
                    atletas.find(
                        (atleta) =>
                            atleta.id ===
                            item.atletaId,
                    ),
                )
                .filter(
                    (
                        atleta,
                    ): atleta is Atleta =>
                        Boolean(atleta),
                );
        }, [escalacaoSalva, atletas]);

    const eventosPartida = useMemo(
        () =>
            scoutEvents.filter(
                (evento) =>
                    evento.partidaId ===
                    partidaId,
            ),
        [scoutEvents, partidaId],
    );

    /*
     * ============================================================
     * PERSISTÊNCIA
     * ============================================================
     */

    function salvarPartidas(
        novaLista: Partida[],
    ) {
        setPartidas(novaLista);

        localStorage.setItem(
            "evolley-partidas",
            JSON.stringify(novaLista),
        );
    }

    function salvarSets(
        novaLista: SetPartida[],
    ) {
        setSets(novaLista);

        localStorage.setItem(
            "evolley-sets",
            JSON.stringify(novaLista),
        );
    }

    function salvarEscalacoes(
        novaLista: EscalacaoPartida[],
    ) {
        setEscalacoes(novaLista);

        localStorage.setItem(
            "evolley-escalacoes",
            JSON.stringify(novaLista),
        );
    }

    function salvarFormacoes(
        novaLista: Formacao[],
    ) {
        setFormacoes(novaLista);

        localStorage.setItem(
            "evolley-formacoes",
            JSON.stringify(novaLista),
        );
    }

    function salvarScout(
        novaLista: ScoutEvent[],
    ) {
        setScoutEvents(novaLista);

        localStorage.setItem(
            "evolley-scout-events",
            JSON.stringify(novaLista),
        );
    }

    /*
     * ============================================================
     * REGRAS DOS SETS
     * ============================================================
     */

    function quantidadeSetsParaVencer() {
        if (!partida) {
            return 0;
        }

        return partida.melhorDe === 3
            ? 2
            : 3;
    }

    function pontosParaVencerSet(
        numeroSet: number,
    ) {
        if (!partida) {
            return 25;
        }

        const tieBreak =
            partida.melhorDe === 3
                ? numeroSet === 3
                : numeroSet === 5;

        return tieBreak
            ? 15
            : 25;
    }

    function setTerminou(
        pontosEquipe: number,
        pontosAdversario: number,
        numeroSet: number,
    ) {
        const minimo =
            pontosParaVencerSet(
                numeroSet,
            );

        const maiorPontuacao =
            Math.max(
                pontosEquipe,
                pontosAdversario,
            );

        const diferenca =
            Math.abs(
                pontosEquipe -
                pontosAdversario,
            );

        return (
            maiorPontuacao >= minimo &&
            diferenca >= 2
        );
    }

    function contarSetsVencidos(
        lista: SetPartida[],
    ) {
        const finalizados =
            lista.filter(
                (set) =>
                    set.partidaId ===
                    partidaId &&
                    set.status ===
                    "Finalizado",
            );

        const equipeVenceu =
            finalizados.filter(
                (set) =>
                    set.pontosEquipe >
                    set.pontosAdversario,
            ).length;

        const adversarioVenceu =
            finalizados.filter(
                (set) =>
                    set.pontosAdversario >
                    set.pontosEquipe,
            ).length;

        return {
            equipeVenceu,
            adversarioVenceu,
        };
    }

    /*
     * ============================================================
     * PARTIDA
     * ============================================================
     */

    function iniciarPartida() {
        if (!partida) {
            return;
        }

        const agora =
            new Date().toISOString();

        const partidasAtualizadas =
            partidas.map((item) =>
                item.id === partida.id
                    ? {
                        ...item,
                        status:
                            "Em andamento" as const,
                        updatedAt:
                            agora,
                    }
                    : item,
            );

        salvarPartidas(
            partidasAtualizadas,
        );

        if (
            setsDaPartida.length === 0
        ) {
            const primeiroSet: SetPartida = {
                id: crypto.randomUUID(),
                partidaId:
                    partida.id,
                numero: 1,
                pontosEquipe: 0,
                pontosAdversario: 0,
                status:
                    "Em andamento",
                iniciadoEm:
                    agora,
            };

            salvarSets([
                ...sets,
                primeiroSet,
            ]);
        }
    }

    function continuarSet() {
        if (!partida) {
            return;
        }

        const ultimoSet =
            setsDaPartida[
            setsDaPartida.length - 1
            ];

        if (!ultimoSet) {
            return;
        }

        const terminouCorretamente =
            setTerminou(
                ultimoSet.pontosEquipe,
                ultimoSet.pontosAdversario,
                ultimoSet.numero,
            );

        if (terminouCorretamente) {
            return;
        }

        const setsAtualizados =
            sets.map((set) =>
                set.id === ultimoSet.id
                    ? {
                        ...set,
                        status:
                            "Em andamento" as const,
                        finalizadoEm:
                            undefined,
                    }
                    : set,
            );

        salvarSets(
            setsAtualizados,
        );
    }

    function aplicarAlteracaoPlacar(
        lado: "equipe" | "adversario",
        incremento: number,
    ) {
        if (
            !partida ||
            !setAtual ||
            partida.status !== "Em andamento"
        ) {
            return;
        }

        const pontosEquipeDepois =
            lado === "equipe"
                ? Math.max(
                    0,
                    setAtual.pontosEquipe + incremento,
                )
                : setAtual.pontosEquipe;

        const pontosAdversarioDepois =
            lado === "adversario"
                ? Math.max(
                    0,
                    setAtual.pontosAdversario + incremento,
                )
                : setAtual.pontosAdversario;

        const agora = new Date().toISOString();

        const setsAtualizados = sets.map((set) =>
            set.id === setAtual.id
                ? {
                    ...set,
                    pontosEquipe: pontosEquipeDepois,
                    pontosAdversario: pontosAdversarioDepois,
                }
                : set,
        );

        const terminou = setTerminou(
            pontosEquipeDepois,
            pontosAdversarioDepois,
            setAtual.numero,
        );

        if (!terminou) {
            salvarSets(setsAtualizados);
            return;
        }

        const setsFinalizados = setsAtualizados.map((set) =>
            set.id === setAtual.id
                ? {
                    ...set,
                    status: "Finalizado" as const,
                    finalizadoEm: agora,
                }
                : set,
        );

        const placar = contarSetsVencidos(setsFinalizados);
        const setsNecessarios = quantidadeSetsParaVencer();

        const partidaTerminou =
            placar.equipeVenceu >= setsNecessarios ||
            placar.adversarioVenceu >= setsNecessarios;

        if (partidaTerminou) {
            salvarSets(setsFinalizados);

            const partidasAtualizadas = partidas.map((item) =>
                item.id === partida.id
                    ? {
                        ...item,
                        status: "Finalizada" as const,
                        updatedAt: agora,
                    }
                    : item,
            );

            salvarPartidas(partidasAtualizadas);
            return;
        }

        const novoSet: SetPartida = {
            id: crypto.randomUUID(),
            partidaId: partida.id,
            numero: setAtual.numero + 1,
            pontosEquipe: 0,
            pontosAdversario: 0,
            status: "Em andamento",
            iniciadoEm: agora,
        };

        salvarSets([
            ...setsFinalizados,
            novoSet,
        ]);
    }

    function atualizarPonto(
        lado: "equipe" | "adversario",
        incremento: number,
    ) {
        aplicarAlteracaoPlacar(
            lado,
            incremento,
        );
    }


    function voltarUltimoPonto(
        lado: "equipe" | "adversario",
    ) {
        if (!partida) {
            return;
        }

        const setsPartidaOrdenados = sets
            .filter(
                (set) =>
                    set.partidaId === partida.id,
            )
            .sort(
                (a, b) =>
                    a.numero - b.numero,
            );

        if (setsPartidaOrdenados.length === 0) {
            setErro(
                "A partida ainda não possui sets.",
            );
            return;
        }

        /*
         * Se um novo set foi criado em 0 x 0,
         * a correção pertence ao set anterior.
         */
        let setParaCorrigir =
            setsPartidaOrdenados[
            setsPartidaOrdenados.length - 1
            ];

        if (
            setParaCorrigir.pontosEquipe === 0 &&
            setParaCorrigir.pontosAdversario === 0 &&
            setParaCorrigir.numero > 1
        ) {
            setParaCorrigir =
                setsPartidaOrdenados[
                setsPartidaOrdenados.length - 2
                ];
        }

        if (!setParaCorrigir) {
            return;
        }

        if (
            lado === "equipe" &&
            setParaCorrigir.pontosEquipe === 0
        ) {
            setErro(
                "A equipe não possui ponto para voltar.",
            );
            return;
        }

        if (
            lado === "adversario" &&
            setParaCorrigir.pontosAdversario === 0
        ) {
            setErro(
                "O adversário não possui ponto para voltar.",
            );
            return;
        }

        /*
         * Proteção: não apagamos um set posterior
         * que já tenha começado de verdade.
         */
        const setsPosteriores =
            setsPartidaOrdenados.filter(
                (set) =>
                    set.numero >
                    setParaCorrigir.numero,
            );

        const idsSetsPosteriores =
            new Set(
                setsPosteriores.map(
                    (set) => set.id,
                ),
            );

        const existeAtividadePosterior =
            setsPosteriores.some(
                (set) =>
                    set.pontosEquipe > 0 ||
                    set.pontosAdversario > 0,
            ) ||
            scoutEvents.some(
                (evento) =>
                    idsSetsPosteriores.has(
                        evento.setId,
                    ),
            );

        if (existeAtividadePosterior) {
            setErro(
                "Não é possível voltar esse ponto porque o set seguinte já possui ações ou pontos registrados.",
            );
            return;
        }

        const novosPontosEquipe =
            lado === "equipe"
                ? Math.max(
                    0,
                    setParaCorrigir.pontosEquipe - 1,
                )
                : setParaCorrigir.pontosEquipe;

        const novosPontosAdversario =
            lado === "adversario"
                ? Math.max(
                    0,
                    setParaCorrigir.pontosAdversario - 1,
                )
                : setParaCorrigir.pontosAdversario;

        /*
         * Remove o set seguinte vazio e reabre
         * o set em que a arbitragem voltou o ponto.
         */
        const setsCorrigidos = sets
            .filter(
                (set) =>
                    !(
                        set.partidaId === partida.id &&
                        set.numero >
                        setParaCorrigir.numero
                    ),
            )
            .map((set) =>
                set.id === setParaCorrigir.id
                    ? {
                        ...set,
                        pontosEquipe:
                            novosPontosEquipe,
                        pontosAdversario:
                            novosPontosAdversario,
                        status:
                            "Em andamento" as const,
                        finalizadoEm:
                            undefined,
                    }
                    : set,
            );

        salvarSets(
            setsCorrigidos,
        );

        /*
         * Remove formações órfãs de sets vazios
         * que foram eliminados pela correção.
         */
        if (idsSetsPosteriores.size > 0) {
            salvarFormacoes(
                formacoes.filter(
                    (formacao) =>
                        !idsSetsPosteriores.has(
                            formacao.setId,
                        ),
                ),
            );
        }

        /*
         * Se o último ponto também foi registrado
         * pelo Scout, removemos esse evento para
         * manter estatística e placar sincronizados.
         */
        const impactoEsperado: ImpactoPlacar =
            lado === "equipe"
                ? "PontoEquipe"
                : "PontoAdversario";

        const eventosDoSet =
            scoutEvents.filter(
                (evento) =>
                    evento.partidaId === partida.id &&
                    evento.setId === setParaCorrigir.id,
            );

        const ultimoEventoDoSet =
            eventosDoSet[
            eventosDoSet.length - 1
            ];

        const eventoRepresentaPontoCorrigido =
            ultimoEventoDoSet &&
            ultimoEventoDoSet.impactoPlacar ===
            impactoEsperado &&
            ultimoEventoDoSet.pontosEquipeDepois ===
            setParaCorrigir.pontosEquipe &&
            ultimoEventoDoSet.pontosAdversarioDepois ===
            setParaCorrigir.pontosAdversario;

        if (eventoRepresentaPontoCorrigido) {
            salvarScout(
                scoutEvents.filter(
                    (evento) =>
                        evento.id !==
                        ultimoEventoDoSet.id,
                ),
            );
        }

        /*
         * Se o ponto havia encerrado a partida,
         * a partida volta para Em andamento.
         */
        if (partida.status === "Finalizada") {
            const agora =
                new Date().toISOString();

            salvarPartidas(
                partidas.map((item) =>
                    item.id === partida.id
                        ? {
                            ...item,
                            status:
                                "Em andamento" as const,
                            updatedAt:
                                agora,
                        }
                        : item,
                ),
            );
        }

        setErro("");
    }

    function encerrarPartida() {
        if (!partida) {
            return;
        }

        const agora =
            new Date().toISOString();

        const partidasAtualizadas =
            partidas.map((item) =>
                item.id === partida.id
                    ? {
                        ...item,
                        status:
                            "Finalizada" as const,
                        updatedAt:
                            agora,
                    }
                    : item,
            );

        salvarPartidas(
            partidasAtualizadas,
        );
    }

    /*
     * ============================================================
     * ESCALAÇÃO
     * ============================================================
     */

    function alternarAtleta(
        atletaId: string,
    ) {
        const jaExiste =
            escalacaoAtual.some(
                (item) =>
                    item.atletaId ===
                    atletaId,
            );

        if (jaExiste) {
            setEscalacaoAtual(
                escalacaoAtual.filter(
                    (item) =>
                        item.atletaId !==
                        atletaId,
                ),
            );

            return;
        }

        const novoAtleta: AtletaEscalado = {
            atletaId,
            funcao: "Reserva",
            capitao: false,
            libero: false,
        };

        setEscalacaoAtual([
            ...escalacaoAtual,
            novoAtleta,
        ]);
    }

    function alterarFuncao(
        atletaId: string,
        funcao: FuncaoEscalacao,
    ) {
        setEscalacaoAtual(
            escalacaoAtual.map(
                (item) =>
                    item.atletaId ===
                        atletaId
                        ? {
                            ...item,
                            funcao,
                        }
                        : item,
            ),
        );
    }

    function definirCapitao(
        atletaId: string,
    ) {
        setEscalacaoAtual(
            escalacaoAtual.map(
                (item) => ({
                    ...item,

                    capitao:
                        item.atletaId ===
                            atletaId
                            ? !item.capitao
                            : false,
                }),
            ),
        );
    }

    function definirLibero(
        atletaId: string,
    ) {
        setEscalacaoAtual(
            escalacaoAtual.map(
                (item) =>
                    item.atletaId ===
                        atletaId
                        ? {
                            ...item,
                            libero:
                                !item.libero,
                        }
                        : item,
            ),
        );
    }

    function salvarEscalacao() {
        if (!partida) {
            return;
        }

        if (
            escalacaoAtual.length === 0
        ) {
            setErro(
                "Selecione pelo menos um atleta para a partida.",
            );

            return;
        }

        const titularesSelecionados =
            escalacaoAtual.filter(
                (item) =>
                    item.funcao ===
                    "Titular",
            );

        if (
            titularesSelecionados.length >
            6
        ) {
            setErro(
                "A escalação não pode ter mais de 6 titulares.",
            );

            return;
        }

        const agora =
            new Date().toISOString();

        if (escalacaoSalva) {
            const listaAtualizada =
                escalacoes.map(
                    (item) =>
                        item.id ===
                            escalacaoSalva.id
                            ? {
                                ...item,
                                atletas:
                                    escalacaoAtual,
                                confirmada:
                                    true,
                                updatedAt:
                                    agora,
                            }
                            : item,
                );

            salvarEscalacoes(
                listaAtualizada,
            );

            setErro("");

            return;
        }

        const novaEscalacao:
            EscalacaoPartida = {
            id: crypto.randomUUID(),
            partidaId:
                partida.id,
            atletas:
                escalacaoAtual,
            confirmada: true,
            createdAt:
                agora,
            updatedAt:
                agora,
        };

        salvarEscalacoes([
            ...escalacoes,
            novaEscalacao,
        ]);

        setErro("");
    }

    /*
     * ============================================================
     * FORMAÇÃO
     * ============================================================
     */

    function criarFormacaoInicial() {
        if (
            !partida ||
            !setAtual
        ) {
            return;
        }

        if (
            titulares.length !== 6
        ) {
            setErro(
                "A formação exige exatamente 6 titulares.",
            );

            return;
        }

        if (formacaoAtual) {
            return;
        }

        const agora =
            new Date().toISOString();

        const jogadores:
            JogadorEmQuadra[] =
            titulares.map(
                (
                    titular,
                    indice,
                ) => ({
                    atletaId:
                        titular.atletaId,
                    posicao:
                        (indice +
                            1) as PosicaoQuadra,
                }),
            );

        const novaFormacao: Formacao = {
            id: crypto.randomUUID(),
            partidaId:
                partida.id,
            setId:
                setAtual.id,
            jogadores,
            createdAt:
                agora,
            updatedAt:
                agora,
        };

        salvarFormacoes([
            ...formacoes,
            novaFormacao,
        ]);

        setErro("");
    }

    function atualizarFormacao(
        jogadores: JogadorEmQuadra[],
    ) {
        if (!formacaoAtual) {
            return;
        }

        const agora =
            new Date().toISOString();

        const listaAtualizada =
            formacoes.map(
                (formacao) =>
                    formacao.id ===
                        formacaoAtual.id
                        ? {
                            ...formacao,
                            jogadores,
                            updatedAt:
                                agora,
                        }
                        : formacao,
            );

        salvarFormacoes(
            listaAtualizada,
        );
    }

    function alterarJogadorPosicao(
        posicao: PosicaoQuadra,
        atletaId: string,
    ) {
        if (!formacaoAtual) {
            return;
        }

        const jogadorDestino =
            formacaoAtual.jogadores.find(
                (jogador) =>
                    jogador.posicao ===
                    posicao,
            );

        const jogadorSelecionado =
            formacaoAtual.jogadores.find(
                (jogador) =>
                    jogador.atletaId ===
                    atletaId,
            );

        if (
            !jogadorDestino ||
            !jogadorSelecionado
        ) {
            return;
        }

        if (
            jogadorDestino.atletaId ===
            jogadorSelecionado.atletaId
        ) {
            return;
        }

        const posicaoAnterior =
            jogadorSelecionado.posicao;

        const jogadoresAtualizados =
            formacaoAtual.jogadores.map(
                (jogador) => {
                    if (
                        jogador.atletaId ===
                        jogadorSelecionado.atletaId
                    ) {
                        return {
                            ...jogador,
                            posicao,
                        };
                    }

                    if (
                        jogador.atletaId ===
                        jogadorDestino.atletaId
                    ) {
                        return {
                            ...jogador,
                            posicao:
                                posicaoAnterior,
                        };
                    }

                    return jogador;
                },
            );

        atualizarFormacao(
            jogadoresAtualizados,
        );
    }

    function rodarFormacao() {
        if (!formacaoAtual) {
            return;
        }

        const jogadoresRodados =
            formacaoAtual.jogadores.map(
                (jogador) => {
                    let novaPosicao:
                        PosicaoQuadra;

                    switch (
                    jogador.posicao
                    ) {
                        case 1:
                            novaPosicao = 6;
                            break;

                        case 6:
                            novaPosicao = 5;
                            break;

                        case 5:
                            novaPosicao = 4;
                            break;

                        case 4:
                            novaPosicao = 3;
                            break;

                        case 3:
                            novaPosicao = 2;
                            break;

                        case 2:
                            novaPosicao = 1;
                            break;

                        default:
                            novaPosicao =
                                jogador.posicao;
                    }

                    return {
                        ...jogador,
                        posicao:
                            novaPosicao,
                    };
                },
            );

        atualizarFormacao(
            jogadoresRodados,
        );
    }

    function buscarAtleta(
        atletaId: string,
    ) {
        return atletas.find(
            (atleta) =>
                atleta.id === atletaId,
        );
    }

    function jogadorNaPosicao(
        posicao: PosicaoQuadra,
    ) {
        return formacaoAtual?.jogadores.find(
            (jogador) =>
                jogador.posicao ===
                posicao,
        );
    }

    function buscarPosicaoAtleta(
        atletaId: string,
    ) {
        return formacaoAtual?.jogadores.find(
            (jogador) =>
                jogador.atletaId ===
                atletaId,
        )?.posicao;
    }

    /*
     * ============================================================
     * REGISTRO DO SCOUT
     * ============================================================
     */

    function registrarScout() {
        if (
            !partida ||
            !setAtual ||
            !atletaScoutId ||
            !fundamentoScout ||
            !resultadoScout
        ) {
            setErro(
                "Selecione atleta, fundamento e resultado.",
            );
            return;
        }

        const pontosEquipeAntes = setAtual.pontosEquipe;
        const pontosAdversarioAntes = setAtual.pontosAdversario;

        let pontosEquipeDepois = pontosEquipeAntes;
        let pontosAdversarioDepois = pontosAdversarioAntes;

        if (impactoPlacar === "PontoEquipe") {
            pontosEquipeDepois += 1;
        }

        if (impactoPlacar === "PontoAdversario") {
            pontosAdversarioDepois += 1;
        }

        const novoEvento: ScoutEvent = {
            id: crypto.randomUUID(),
            partidaId: partida.id,
            setId: setAtual.id,
            atletaId: atletaScoutId,
            fundamento: fundamentoScout,
            resultado: resultadoScout,
            impactoPlacar,
            posicaoQuadra: buscarPosicaoAtleta(atletaScoutId),
            pontosEquipeAntes,
            pontosAdversarioAntes,
            pontosEquipeDepois,
            pontosAdversarioDepois,
            criadoEm: new Date().toISOString(),
        };

        salvarScout([
            ...scoutEvents,
            novoEvento,
        ]);

        if (impactoPlacar === "PontoEquipe") {
            aplicarAlteracaoPlacar(
                "equipe",
                1,
            );
        }

        if (impactoPlacar === "PontoAdversario") {
            aplicarAlteracaoPlacar(
                "adversario",
                1,
            );
        }

        setFundamentoScout("");
        setResultadoScout("");
        setImpactoPlacar("Nenhum");
        setErro("");
    }

    function desfazerUltimaAcao() {
        if (!partida) {
            return;
        }

        const eventosDaPartida = scoutEvents.filter(
            (evento) =>
                evento.partidaId === partida.id,
        );

        if (eventosDaPartida.length === 0) {
            setErro(
                "Não há ações para desfazer.",
            );
            return;
        }

        const ultimoEvento =
            eventosDaPartida[
            eventosDaPartida.length - 1
            ];

        const setDoEvento = sets.find(
            (set) =>
                set.id === ultimoEvento.setId,
        );

        if (!setDoEvento) {
            setErro(
                "Não foi possível localizar o set da última ação.",
            );
            return;
        }

        /*
         * Recupera o placar anterior.
         *
         * Eventos novos possuem:
         * pontosEquipeAntes
         * pontosAdversarioAntes
         *
         * Para eventos antigos, calculamos o valor
         * usando o placar atual e o impacto da ação.
         */

        let pontosEquipeAntes =
            ultimoEvento.pontosEquipeAntes;

        let pontosAdversarioAntes =
            ultimoEvento.pontosAdversarioAntes;

        if (
            typeof pontosEquipeAntes !== "number"
        ) {
            pontosEquipeAntes =
                ultimoEvento.impactoPlacar ===
                    "PontoEquipe"
                    ? Math.max(
                        0,
                        setDoEvento.pontosEquipe - 1,
                    )
                    : setDoEvento.pontosEquipe;
        }

        if (
            typeof pontosAdversarioAntes !==
            "number"
        ) {
            pontosAdversarioAntes =
                ultimoEvento.impactoPlacar ===
                    "PontoAdversario"
                    ? Math.max(
                        0,
                        setDoEvento.pontosAdversario -
                        1,
                    )
                    : setDoEvento.pontosAdversario;
        }

        /*
         * Remove o evento do Scout.
         */

        const novaListaEventos =
            scoutEvents.filter(
                (evento) =>
                    evento.id !==
                    ultimoEvento.id,
            );

        salvarScout(
            novaListaEventos,
        );

        /*
         * Se a ação não alterou o placar,
         * basta remover o evento.
         */

        if (
            ultimoEvento.impactoPlacar ===
            "Nenhum"
        ) {
            setErro("");
            return;
        }

        /*
         * Remove sets criados depois do
         * ponto que está sendo desfeito.
         *
         * Exemplo:
         *
         * Set 1: 25 x 20
         * Set 2: 0 x 0
         *
         * Ao desfazer:
         *
         * Set 2 é removido
         * Set 1 volta para 24 x 20
         */

        const setsCorrigidos = sets
            .filter(
                (set) =>
                    !(
                        set.partidaId ===
                        partida.id &&
                        set.numero >
                        setDoEvento.numero
                    ),
            )
            .map((set) =>
                set.id === setDoEvento.id
                    ? {
                        ...set,

                        pontosEquipe:
                            pontosEquipeAntes,

                        pontosAdversario:
                            pontosAdversarioAntes,

                        status:
                            "Em andamento" as const,

                        finalizadoEm:
                            undefined,
                    }
                    : set,
            );

        salvarSets(
            setsCorrigidos,
        );

        /*
         * Caso esse ponto tenha encerrado
         * a partida, reabre a partida.
         */

        if (
            partida.status ===
            "Finalizada"
        ) {
            const agora =
                new Date().toISOString();

            const partidasAtualizadas =
                partidas.map((item) =>
                    item.id === partida.id
                        ? {
                            ...item,

                            status:
                                "Em andamento" as const,

                            updatedAt:
                                agora,
                        }
                        : item,
                );

            salvarPartidas(
                partidasAtualizadas,
            );
        }

        setErro("");
    }

    /*
     * ============================================================
     * RENDERIZAÇÃO DA QUADRA
     * ============================================================
     */

    const renderPosicaoQuadra = (
        posicao: PosicaoQuadra,
    ) => {
        const jogador =
            jogadorNaPosicao(
                posicao,
            );

        const atleta =
            jogador
                ? buscarAtleta(
                    jogador.atletaId,
                )
                : undefined;

        return (
            <Card
                key={posicao}
                variant="outlined"
                sx={{
                    height: "100%",
                }}
            >
                <CardContent>
                    <Typography
                        variant="overline"
                        color="text.secondary"
                    >
                        P{posicao}
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 2,
                        }}
                    >
                        {atleta
                            ? `${atleta.numero} · ${atleta.nome}`
                            : "Sem atleta"}
                    </Typography>

                    <TextField
                        select
                        size="small"
                        label="Atleta"
                        value={
                            jogador?.atletaId ??
                            ""
                        }
                        onChange={(evento) =>
                            alterarJogadorPosicao(
                                posicao,
                                evento.target.value,
                            )
                        }
                        fullWidth
                    >
                        {titulares.map(
                            (titular) => {
                                const dados =
                                    buscarAtleta(
                                        titular.atletaId,
                                    );

                                if (!dados) {
                                    return null;
                                }

                                return (
                                    <MenuItem
                                        key={
                                            dados.id
                                        }
                                        value={
                                            dados.id
                                        }
                                    >
                                        {dados.numero} ·{" "}
                                        {dados.nome}
                                    </MenuItem>
                                );
                            },
                        )}
                    </TextField>
                </CardContent>
            </Card>
        );
    };

    /*
     * ============================================================
     * VALIDAÇÃO DA PARTIDA
     * ============================================================
     */

    if (!partida && erro) {
        return (
            <>
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {erro}
                </Alert>

                <Button
                    onClick={() =>
                        navigate(
                            "/jogos",
                        )
                    }
                >
                    Voltar para jogos
                </Button>
            </>
        );
    }

    if (!partida) {
        return (
            <Alert severity="warning">
                Partida não encontrada.
            </Alert>
        );
    }

    const {
        equipeVenceu:
        setsVencidosEquipe,

        adversarioVenceu:
        setsVencidosAdversario,
    } =
        contarSetsVencidos(
            setsDaPartida,
        );

    const ultimoSet =
        setsDaPartida.length > 0
            ? setsDaPartida[
            setsDaPartida.length -
            1
            ]
            : undefined;

    const ultimoSetFinalizadoIncorretamente =
        partida.status ===
        "Em andamento" &&
        !setAtual &&
        ultimoSet &&
        ultimoSet.status ===
        "Finalizado" &&
        !setTerminou(
            ultimoSet.pontosEquipe,
            ultimoSet.pontosAdversario,
            ultimoSet.numero,
        );

    /*
     * ============================================================
     * INTERFACE
     * ============================================================
     */

    return (
        <>
            <Button
                startIcon={
                    <ArrowBackIcon />
                }
                onClick={() =>
                    navigate("/jogos")
                }
                sx={{ mb: 2 }}
            >
                Voltar para jogos
            </Button>

            {erro && (
                <Alert
                    severity="error"
                    onClose={() =>
                        setErro("")
                    }
                    sx={{ mb: 3 }}
                >
                    {erro}
                </Alert>
            )}

            {/* CABEÇALHO */}

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            {equipe?.nome ??
                                "Equipe"}{" "}
                            x{" "}
                            {
                                partida.adversario
                            }
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            {partida.tipo} ·
                            Melhor de{" "}
                            {
                                partida.melhorDe
                            }{" "}
                            sets
                        </Typography>
                    </Box>

                    <Chip
                        label={
                            partida.status
                        }
                        color={
                            partida.status ===
                                "Em andamento"
                                ? "warning"
                                : partida.status ===
                                    "Finalizada"
                                    ? "success"
                                    : "info"
                        }
                    />
                </Box>

                <Divider
                    sx={{ my: 3 }}
                />

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    {partida.status ===
                        "Agendada" && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={
                                    <PlayArrowIcon />
                                }
                                onClick={
                                    iniciarPartida
                                }
                            >
                                Iniciar partida
                            </Button>
                        )}

                    {partida.status ===
                        "Em andamento" && (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={
                                    <StopIcon />
                                }
                                onClick={
                                    encerrarPartida
                                }
                            >
                                Encerrar partida
                            </Button>
                        )}
                </Box>
            </Paper>

            {/* PLACAR DE SETS */}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(4, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Card>
                    <CardContent>
                        <Typography
                            color="text.secondary"
                        >
                            {equipe?.nome ??
                                "Equipe"}
                        </Typography>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            {
                                setsVencidosEquipe
                            }
                        </Typography>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography
                            color="text.secondary"
                        >
                            Placar de sets
                        </Typography>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            {
                                setsVencidosEquipe
                            }{" "}
                            x{" "}
                            {
                                setsVencidosAdversario
                            }
                        </Typography>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography
                            color="text.secondary"
                        >
                            {
                                partida.adversario
                            }
                        </Typography>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            {
                                setsVencidosAdversario
                            }
                        </Typography>
                    </CardContent>
                </Card>
            </Box>


            {/* CORREÇÃO DA ARBITRAGEM */}

            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography
                            sx={{
                                fontWeight: 600,
                            }}
                        >
                            Correção da arbitragem
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Utilize quando a arbitragem voltar o último ponto.
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={() =>
                                voltarUltimoPonto(
                                    "equipe",
                                )
                            }
                        >
                            Voltar ponto da equipe
                        </Button>

                        <Button
                            variant="outlined"
                            color="warning"
                            onClick={() =>
                                voltarUltimoPonto(
                                    "adversario",
                                )
                            }
                        >
                            Voltar ponto do adversário
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* ESCALAÇÃO */}

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Escalação
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            Selecione os
                            atletas que
                            participarão da
                            partida.
                        </Typography>
                    </Box>

                    {escalacaoSalva?.confirmada && (
                        <Chip
                            label="Escalação confirmada"
                            color="success"
                        />
                    )}
                </Box>

                {atletasDaEquipe.length ===
                    0 ? (
                    <Alert severity="warning">
                        Esta equipe não
                        possui atletas
                        ativos.
                    </Alert>
                ) : (
                    <>
                        <Box
                            sx={{
                                display:
                                    "grid",
                                gap: 2,
                            }}
                        >
                            {atletasDaEquipe.map(
                                (
                                    atleta,
                                ) => {
                                    const atletaEscalado =
                                        escalacaoAtual.find(
                                            (
                                                item,
                                            ) =>
                                                item.atletaId ===
                                                atleta.id,
                                        );

                                    const selecionado =
                                        Boolean(
                                            atletaEscalado,
                                        );

                                    return (
                                        <Paper
                                            key={
                                                atleta.id
                                            }
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                display:
                                                    "grid",
                                                gridTemplateColumns:
                                                {
                                                    xs: "1fr",
                                                    md: "2fr 1fr auto auto",
                                                },
                                                gap: 2,
                                                alignItems:
                                                    "center",
                                            }}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={
                                                            selecionado
                                                        }
                                                        onChange={() =>
                                                            alternarAtleta(
                                                                atleta.id,
                                                            )
                                                        }
                                                    />
                                                }
                                                label={`${atleta.numero} · ${atleta.nome} · ${atleta.posicao}`}
                                            />

                                            <TextField
                                                select
                                                size="small"
                                                label="Função"
                                                value={
                                                    atletaEscalado?.funcao ??
                                                    "Reserva"
                                                }
                                                disabled={
                                                    !selecionado
                                                }
                                                onChange={(
                                                    evento,
                                                ) =>
                                                    alterarFuncao(
                                                        atleta.id,
                                                        evento
                                                            .target
                                                            .value as FuncaoEscalacao,
                                                    )
                                                }
                                            >
                                                <MenuItem value="Titular">
                                                    Titular
                                                </MenuItem>

                                                <MenuItem value="Reserva">
                                                    Reserva
                                                </MenuItem>
                                            </TextField>

                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={
                                                            atletaEscalado?.capitao ??
                                                            false
                                                        }
                                                        disabled={
                                                            !selecionado
                                                        }
                                                        onChange={() =>
                                                            definirCapitao(
                                                                atleta.id,
                                                            )
                                                        }
                                                    />
                                                }
                                                label="Capitão"
                                            />

                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={
                                                            atletaEscalado?.libero ??
                                                            false
                                                        }
                                                        disabled={
                                                            !selecionado
                                                        }
                                                        onChange={() =>
                                                            definirLibero(
                                                                atleta.id,
                                                            )
                                                        }
                                                    />
                                                }
                                                label="Líbero"
                                            />
                                        </Paper>
                                    );
                                },
                            )}
                        </Box>

                        <Box
                            sx={{
                                mt: 3,
                                display:
                                    "flex",
                                justifyContent:
                                    "flex-end",
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={
                                    salvarEscalacao
                                }
                                disabled={
                                    escalacaoAtual.length ===
                                    0
                                }
                            >
                                {escalacaoSalva
                                    ? "Salvar alterações"
                                    : "Confirmar escalação"}
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            {/* FORMAÇÃO */}

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: {
                            xs: "flex-start",
                            md: "center",
                        },
                        flexDirection: {
                            xs: "column",
                            md: "row",
                        },
                        gap: 2,
                        mb: 3,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Formação em quadra
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            Organização dos seis
                            titulares no set
                            atual.
                        </Typography>
                    </Box>

                    {formacaoAtual && (
                        <Button
                            variant="outlined"
                            startIcon={
                                <RotateRightIcon />
                            }
                            onClick={
                                rodarFormacao
                            }
                        >
                            Rodar formação
                        </Button>
                    )}
                </Box>

                {!setAtual ? (
                    <Alert severity="info">
                        Inicie um set para
                        montar a formação.
                    </Alert>
                ) : titulares.length !==
                    6 ? (
                    <Alert severity="warning">
                        Defina exatamente 6
                        titulares na escalação
                        antes de montar a
                        formação.
                    </Alert>
                ) : !formacaoAtual ? (
                    <Box
                        sx={{
                            textAlign:
                                "center",
                            py: 3,
                        }}
                    >
                        <Typography
                            color="text.secondary"
                            sx={{
                                mb: 2,
                            }}
                        >
                            A formação inicial
                            deste set ainda não
                            foi criada.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={
                                criarFormacaoInicial
                            }
                        >
                            Montar formação
                            inicial
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Typography
                            align="center"
                            sx={{
                                fontWeight:
                                    700,
                                mb: 1,
                            }}
                        >
                            REDE
                        </Typography>

                        <Box
                            sx={{
                                borderTop: 4,
                                borderColor:
                                    "primary.main",
                                pt: 3,
                                pb: 3,
                            }}
                        >
                            <Box
                                sx={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                    {
                                        xs: "1fr",
                                        md: "repeat(3, 1fr)",
                                    },
                                    gap: 2,
                                    mb: 2,
                                }}
                            >
                                {renderPosicaoQuadra(
                                    4,
                                )}

                                {renderPosicaoQuadra(
                                    3,
                                )}

                                {renderPosicaoQuadra(
                                    2,
                                )}
                            </Box>

                            <Divider
                                sx={{
                                    my: 3,
                                }}
                            />

                            <Box
                                sx={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                    {
                                        xs: "1fr",
                                        md: "repeat(3, 1fr)",
                                    },
                                    gap: 2,
                                }}
                            >
                                {renderPosicaoQuadra(
                                    5,
                                )}

                                {renderPosicaoQuadra(
                                    6,
                                )}

                                {renderPosicaoQuadra(
                                    1,
                                )}
                            </Box>
                        </Box>

                        <Typography
                            align="center"
                            color="text.secondary"
                        >
                            FUNDO DE QUADRA
                        </Typography>
                    </>
                )}
            </Paper>

            {/* SCOUT */}

            <Paper
                sx={{
                    p: 3,
                    mb: 3,
                }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Scout
                </Typography>

                <Typography
                    color="text.secondary"
                    sx={{
                        mb: 3,
                    }}
                >
                    Registre as ações dos atletas durante o set atual.
                </Typography>

                {!setAtual ? (
                    <Alert severity="info">
                        Inicie um set antes de registrar o scout.
                    </Alert>
                ) : !escalacaoSalva ? (
                    <Alert severity="warning">
                        Confirme a escalação antes de iniciar o scout.
                    </Alert>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "repeat(4, 1fr)",
                                },
                                gap: 2,
                            }}
                        >
                            {/* ATLETA */}

                            <TextField
                                select
                                label="Atleta"
                                value={atletaScoutId}
                                onChange={(evento) =>
                                    setAtletaScoutId(
                                        evento.target.value,
                                    )
                                }
                                fullWidth
                            >
                                {atletasDisponiveisScout.map(
                                    (atleta) => (
                                        <MenuItem
                                            key={atleta.id}
                                            value={atleta.id}
                                        >
                                            {atleta.numero} · {atleta.nome}
                                        </MenuItem>
                                    ),
                                )}
                            </TextField>

                            {/* FUNDAMENTO */}

                            <TextField
                                select
                                label="Fundamento"
                                value={fundamentoScout}
                                onChange={(evento) =>
                                    setFundamentoScout(
                                        evento.target
                                            .value as FundamentoScout,
                                    )
                                }
                                fullWidth
                            >
                                {fundamentos.map(
                                    (fundamento) => (
                                        <MenuItem
                                            key={fundamento}
                                            value={fundamento}
                                        >
                                            {fundamento}
                                        </MenuItem>
                                    ),
                                )}
                            </TextField>

                            {/* RESULTADO */}

                            <TextField
                                select
                                label="Resultado"
                                value={resultadoScout}
                                onChange={(evento) =>
                                    setResultadoScout(
                                        evento.target
                                            .value as ResultadoScout,
                                    )
                                }
                                fullWidth
                            >
                                {resultados.map(
                                    (resultado) => (
                                        <MenuItem
                                            key={resultado}
                                            value={resultado}
                                        >
                                            {resultado}
                                        </MenuItem>
                                    ),
                                )}
                            </TextField>

                            {/* IMPACTO NO PLACAR */}

                            <TextField
                                select
                                label="Impacto no placar"
                                value={impactoPlacar}
                                onChange={(evento) =>
                                    setImpactoPlacar(
                                        evento.target
                                            .value as ImpactoPlacar,
                                    )
                                }
                                fullWidth
                            >
                                {impactosPlacar.map(
                                    (impacto) => (
                                        <MenuItem
                                            key={impacto}
                                            value={impacto}
                                        >
                                            {impacto === "Nenhum"
                                                ? "Não altera o placar"
                                                : impacto ===
                                                    "PontoEquipe"
                                                    ? "Ponto da equipe"
                                                    : "Ponto do adversário"}
                                        </MenuItem>
                                    ),
                                )}
                            </TextField>
                        </Box>

                        {/* AÇÕES */}

                        <Box
                            sx={{
                                mt: 3,
                                display: "flex",
                                justifyContent:
                                    "space-between",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <Button
                                variant="outlined"
                                color="warning"
                                onClick={
                                    desfazerUltimaAcao
                                }
                                disabled={
                                    eventosPartida.length ===
                                    0
                                }
                            >
                                Desfazer última ação
                            </Button>

                            <Button
                                variant="contained"
                                onClick={
                                    registrarScout
                                }
                                disabled={
                                    !atletaScoutId ||
                                    !fundamentoScout ||
                                    !resultadoScout
                                }
                            >
                                Registrar ação
                            </Button>
                        </Box>
                    </>
                )}
            </Paper>

            {/* ÚLTIMAS AÇÕES */}

            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                    mb: 3,
                }
                }
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2,
                    }}
                >
                    Últimas ações
                </Typography>

                {
                    eventosPartida.length ===
                        0 ? (
                        <Typography
                            color="text.secondary"
                        >
                            Nenhuma ação
                            registrada.
                        </Typography>
                    ) : (
                        <Box
                            sx={{
                                display: "grid",
                                gap: 1,
                            }}
                        >
                            {eventosPartida
                                .slice(-10)
                                .reverse()
                                .map(
                                    (
                                        evento,
                                    ) => {
                                        const atleta =
                                            buscarAtleta(
                                                evento.atletaId,
                                            );

                                        return (
                                            <Paper
                                                key={
                                                    evento.id
                                                }
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        display:
                                                            "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems:
                                                            "center",
                                                        gap: 2,
                                                        flexWrap:
                                                            "wrap",
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography
                                                            sx={{
                                                                fontWeight:
                                                                    600,
                                                            }}
                                                        >
                                                            {atleta
                                                                ? `${atleta.numero} · ${atleta.nome}`
                                                                : "Atleta"}
                                                        </Typography>

                                                        <Typography
                                                            color="text.secondary"
                                                        >
                                                            {
                                                                evento.fundamento
                                                            }{" "}
                                                            ·{" "}
                                                            {
                                                                evento.resultado
                                                            }
                                                        </Typography>
                                                    </Box>

                                                    <Box
                                                        sx={{
                                                            display:
                                                                "flex",
                                                            gap: 1,
                                                            flexWrap:
                                                                "wrap",
                                                        }}
                                                    >
                                                        {evento.posicaoQuadra && (
                                                            <Chip
                                                                size="small"
                                                                label={`P${evento.posicaoQuadra}`}
                                                            />
                                                        )}

                                                        <Chip
                                                            size="small"
                                                            variant="outlined"
                                                            label={`${evento.pontosEquipeDepois} x ${evento.pontosAdversarioDepois}`}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Paper>
                                        );
                                    },
                                )}
                        </Box>
                    )
                }
            </Paper>

            {/* SET INTERROMPIDO */}

            {
                ultimoSetFinalizadoIncorretamente && (
                    <Alert
                        severity="warning"
                        sx={{ mb: 3 }}
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={
                                    continuarSet
                                }
                            >
                                Continuar set
                            </Button>
                        }
                    >
                        O último set foi marcado
                        como finalizado, mas o
                        placar ainda não atende
                        aos critérios de
                        encerramento.
                    </Alert>
                )
            }

            {/* PLACAR DO SET */}

            {
                setAtual &&
                partida.status ===
                "Em andamento" && (
                    <Paper
                        sx={{
                            p: 4,
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="h5"
                            align="center"
                            sx={{
                                fontWeight:
                                    700,
                                mb: 3,
                            }}
                        >
                            Set{" "}
                            {
                                setAtual.numero
                            }
                        </Typography>

                        <Box
                            sx={{
                                display:
                                    "grid",
                                gridTemplateColumns:
                                {
                                    xs: "1fr",
                                    md: "1fr auto 1fr",
                                },
                                gap: 3,
                                alignItems:
                                    "center",
                            }}
                        >
                            <Box
                                sx={{
                                    textAlign:
                                        "center",
                                }}
                            >
                                <Typography variant="h6">
                                    {equipe?.nome ??
                                        "Equipe"}
                                </Typography>

                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontWeight:
                                            700,
                                        my: 2,
                                    }}
                                >
                                    {
                                        setAtual.pontosEquipe
                                    }
                                </Typography>

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "center",
                                        gap: 1,
                                        flexWrap:
                                            "wrap",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={
                                            <AddIcon />
                                        }
                                        onClick={() =>
                                            atualizarPonto(
                                                "equipe",
                                                1,
                                            )
                                        }
                                    >
                                        Ponto
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            <RemoveIcon />
                                        }
                                        disabled={
                                            setAtual.pontosEquipe ===
                                            0
                                        }
                                        onClick={() =>
                                            atualizarPonto(
                                                "equipe",
                                                -1,
                                            )
                                        }
                                    >
                                        Desfazer
                                    </Button>
                                </Box>
                            </Box>

                            <Typography
                                variant="h3"
                                color="text.secondary"
                                sx={{
                                    textAlign:
                                        "center",
                                }}
                            >
                                ×
                            </Typography>

                            <Box
                                sx={{
                                    textAlign:
                                        "center",
                                }}
                            >
                                <Typography variant="h6">
                                    {
                                        partida.adversario
                                    }
                                </Typography>

                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontWeight:
                                            700,
                                        my: 2,
                                    }}
                                >
                                    {
                                        setAtual.pontosAdversario
                                    }
                                </Typography>

                                <Box
                                    sx={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "center",
                                        gap: 1,
                                        flexWrap:
                                            "wrap",
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={
                                            <AddIcon />
                                        }
                                        onClick={() =>
                                            atualizarPonto(
                                                "adversario",
                                                1,
                                            )
                                        }
                                    >
                                        Ponto
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={
                                            <RemoveIcon />
                                        }
                                        disabled={
                                            setAtual.pontosAdversario ===
                                            0
                                        }
                                        onClick={() =>
                                            atualizarPonto(
                                                "adversario",
                                                -1,
                                            )
                                        }
                                    >
                                        Desfazer
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Paper>
                )
            }

            {/* HISTÓRICO */}

            <Paper
                variant="outlined"
                sx={{
                    p: 3,
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        mb: 2,
                    }}
                >
                    Histórico de sets
                </Typography>

                {setsDaPartida.length ===
                    0 ? (
                    <Typography
                        color="text.secondary"
                    >
                        A partida ainda não
                        possui sets.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap:
                                "wrap",
                        }}
                    >
                        {setsDaPartida.map(
                            (set) => (
                                <Card
                                    key={
                                        set.id
                                    }
                                    variant="outlined"
                                    sx={{
                                        minWidth:
                                            160,
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            sx={{
                                                fontWeight:
                                                    600,
                                            }}
                                        >
                                            Set{" "}
                                            {
                                                set.numero
                                            }
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            sx={{
                                                my: 1,
                                            }}
                                        >
                                            {
                                                set.pontosEquipe
                                            }{" "}
                                            x{" "}
                                            {
                                                set.pontosAdversario
                                            }
                                        </Typography>

                                        <Chip
                                            label={
                                                set.status
                                            }
                                            size="small"
                                            color={
                                                set.status ===
                                                    "Finalizado"
                                                    ? "success"
                                                    : "warning"
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            ),
                        )}
                    </Box>
                )}
            </Paper>
        </>
    );
}

export default CentroPartida;