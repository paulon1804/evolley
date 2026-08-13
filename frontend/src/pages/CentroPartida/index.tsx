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

function CentroPartida() {
    const { partidaId } = useParams();
    const navigate = useNavigate();

    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [atletas, setAtletas] = useState<Atleta[]>([]);
    const [sets, setSets] = useState<SetPartida[]>([]);
    const [escalacoes, setEscalacoes] = useState<EscalacaoPartida[]>([]);
    const [formacoes, setFormacoes] = useState<Formacao[]>([]);

    const [escalacaoAtual, setEscalacaoAtual] =
        useState<AtletaEscalado[]>([]);

    const [erro, setErro] = useState("");

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

            if (partidasSalvas) {
                setPartidas(JSON.parse(partidasSalvas));
            }

            if (equipesSalvas) {
                setEquipes(JSON.parse(equipesSalvas));
            }

            if (atletasSalvos) {
                setAtletas(JSON.parse(atletasSalvos));
            }

            if (setsSalvos) {
                setSets(JSON.parse(setsSalvos));
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
        } catch {
            setErro(
                "Não foi possível carregar os dados da partida.",
            );
        }
    }, []);

    const partida = useMemo(
        () =>
            partidas.find(
                (item) => item.id === partidaId,
            ),
        [partidas, partidaId],
    );

    const equipe = useMemo(
        () =>
            equipes.find(
                (item) => item.id === partida?.equipeId,
            ),
        [equipes, partida],
    );

    const atletasDaEquipe = useMemo(
        () =>
            atletas.filter(
                (atleta) =>
                    atleta.equipeId === partida?.equipeId &&
                    atleta.ativo,
            ),
        [atletas, partida],
    );

    const setsDaPartida = useMemo(
        () =>
            sets
                .filter(
                    (item) => item.partidaId === partidaId,
                )
                .sort(
                    (a, b) => a.numero - b.numero,
                ),
        [sets, partidaId],
    );

    const setAtual = useMemo(
        () =>
            setsDaPartida.find(
                (set) => set.status === "Em andamento",
            ),
        [setsDaPartida],
    );

    const escalacaoSalva = useMemo(
        () =>
            escalacoes.find(
                (item) => item.partidaId === partidaId,
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
                (item) => item.funcao === "Titular",
            ),
        [escalacaoAtual],
    );

    const formacaoAtual = useMemo(
        () =>
            formacoes.find(
                (formacao) =>
                    formacao.setId === setAtual?.id,
            ),
        [formacoes, setAtual],
    );

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
                    set.partidaId === partidaId &&
                    set.status === "Finalizado",
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
                        updatedAt: agora,
                    }
                    : item,
            );

        salvarPartidas(
            partidasAtualizadas,
        );

        if (setsDaPartida.length === 0) {
            const primeiroSet: SetPartida = {
                id: crypto.randomUUID(),
                partidaId: partida.id,
                numero: 1,
                pontosEquipe: 0,
                pontosAdversario: 0,
                status: "Em andamento",
                iniciadoEm: agora,
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

    function atualizarPonto(
        lado:
            | "equipe"
            | "adversario",
        incremento: number,
    ) {
        if (
            !partida ||
            !setAtual ||
            partida.status !==
            "Em andamento"
        ) {
            return;
        }

        const novosSets =
            sets.map((set) => {
                if (
                    set.id !== setAtual.id
                ) {
                    return set;
                }

                const novosPontosEquipe =
                    lado === "equipe"
                        ? Math.max(
                            0,
                            set.pontosEquipe +
                            incremento,
                        )
                        : set.pontosEquipe;

                const novosPontosAdversario =
                    lado === "adversario"
                        ? Math.max(
                            0,
                            set.pontosAdversario +
                            incremento,
                        )
                        : set.pontosAdversario;

                return {
                    ...set,
                    pontosEquipe:
                        novosPontosEquipe,
                    pontosAdversario:
                        novosPontosAdversario,
                };
            });

        const setAtualizado =
            novosSets.find(
                (set) =>
                    set.id === setAtual.id,
            );

        if (!setAtualizado) {
            return;
        }

        const terminou =
            setTerminou(
                setAtualizado.pontosEquipe,
                setAtualizado.pontosAdversario,
                setAtualizado.numero,
            );

        if (!terminou) {
            salvarSets(
                novosSets,
            );

            return;
        }

        const agora =
            new Date().toISOString();

        const setsComFinalizacao =
            novosSets.map((set) =>
                set.id === setAtualizado.id
                    ? {
                        ...set,
                        status:
                            "Finalizado" as const,
                        finalizadoEm: agora,
                    }
                    : set,
            );

        const placar =
            contarSetsVencidos(
                setsComFinalizacao,
            );

        const setsNecessarios =
            quantidadeSetsParaVencer();

        const partidaTerminou =
            placar.equipeVenceu >=
            setsNecessarios ||
            placar.adversarioVenceu >=
            setsNecessarios;

        if (partidaTerminou) {
            salvarSets(
                setsComFinalizacao,
            );

            const partidasAtualizadas =
                partidas.map((item) =>
                    item.id === partida.id
                        ? {
                            ...item,
                            status:
                                "Finalizada" as const,
                            updatedAt: agora,
                        }
                        : item,
                );

            salvarPartidas(
                partidasAtualizadas,
            );

            return;
        }

        const proximoNumero =
            setAtualizado.numero + 1;

        const novoSet: SetPartida = {
            id: crypto.randomUUID(),
            partidaId: partida.id,
            numero: proximoNumero,
            pontosEquipe: 0,
            pontosAdversario: 0,
            status: "Em andamento",
            iniciadoEm: agora,
        };

        salvarSets([
            ...setsComFinalizacao,
            novoSet,
        ]);
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
                        updatedAt: agora,
                    }
                    : item,
            );

        salvarPartidas(
            partidasAtualizadas,
        );
    }

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
                    item.funcao === "Titular",
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
                escalacoes.map((item) =>
                    item.id ===
                        escalacaoSalva.id
                        ? {
                            ...item,
                            atletas:
                                escalacaoAtual,
                            confirmada: true,
                            updatedAt: agora,
                        }
                        : item,
                );

            salvarEscalacoes(
                listaAtualizada,
            );

            setErro("");

            return;
        }

        const novaEscalacao: EscalacaoPartida = {
            id: crypto.randomUUID(),
            partidaId: partida.id,
            atletas:
                escalacaoAtual,
            confirmada: true,
            createdAt: agora,
            updatedAt: agora,
        };

        salvarEscalacoes([
            ...escalacoes,
            novaEscalacao,
        ]);

        setErro("");
    }

    function criarFormacaoInicial() {
        if (!partida || !setAtual) {
            return;
        }

        if (titulares.length !== 6) {
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
                (titular, indice) => ({
                    atletaId:
                        titular.atletaId,
                    posicao:
                        (indice +
                            1) as PosicaoQuadra,
                }),
            );

        const novaFormacao: Formacao = {
            id: crypto.randomUUID(),
            partidaId: partida.id,
            setId: setAtual.id,
            jogadores,
            createdAt: agora,
            updatedAt: agora,
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
            formacoes.map((formacao) =>
                formacao.id ===
                    formacaoAtual.id
                    ? {
                        ...formacao,
                        jogadores,
                        updatedAt: agora,
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
                        navigate("/jogos")
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
            setsDaPartida.length - 1
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
                                        key={dados.id}
                                        value={dados.id}
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
                            {partida.adversario}
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            {partida.tipo} · Melhor
                            de {partida.melhorDe} sets
                        </Typography>
                    </Box>

                    <Chip
                        label={partida.status}
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

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(3, 1fr)",
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
                            {setsVencidosEquipe}
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
                            {setsVencidosEquipe}
                            {" x "}
                            {setsVencidosAdversario}
                        </Typography>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Typography
                            color="text.secondary"
                        >
                            {partida.adversario}
                        </Typography>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            {setsVencidosAdversario}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

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
                            Selecione os atletas que
                            participarão da partida.
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
                        Esta equipe não possui
                        atletas ativos.
                    </Alert>
                ) : (
                    <>
                        <Box
                            sx={{
                                display: "grid",
                                gap: 2,
                            }}
                        >
                            {atletasDaEquipe.map(
                                (atleta) => {
                                    const atletaEscalado =
                                        escalacaoAtual.find(
                                            (item) =>
                                                item.atletaId ===
                                                atleta.id,
                                        );

                                    const selecionado =
                                        Boolean(
                                            atletaEscalado,
                                        );

                                    return (
                                        <Paper
                                            key={atleta.id}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                display: "grid",
                                                gridTemplateColumns: {
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
                                display: "flex",
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
                            titulares no set atual.
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
                        Inicie um set para montar
                        a formação.
                    </Alert>
                ) : titulares.length !== 6 ? (
                    <Alert severity="warning">
                        Defina exatamente 6
                        titulares na escalação
                        antes de montar a formação.
                    </Alert>
                ) : !formacaoAtual ? (
                    <Box
                        sx={{
                            textAlign: "center",
                            py: 3,
                        }}
                    >
                        <Typography
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            A formação inicial deste
                            set ainda não foi criada.
                        </Typography>

                        <Button
                            variant="contained"
                            onClick={
                                criarFormacaoInicial
                            }
                        >
                            Montar formação inicial
                        </Button>
                    </Box>
                ) : (
                    <>
                        <Typography
                            align="center"
                            sx={{
                                fontWeight: 700,
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
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        md: "repeat(3, 1fr)",
                                    },
                                    gap: 2,
                                    mb: 2,
                                }}
                            >
                                {renderPosicaoQuadra(4)}
                                {renderPosicaoQuadra(3)}
                                {renderPosicaoQuadra(2)}
                            </Box>

                            <Divider
                                sx={{ my: 3 }}
                            />

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        md: "repeat(3, 1fr)",
                                    },
                                    gap: 2,
                                }}
                            >
                                {renderPosicaoQuadra(5)}
                                {renderPosicaoQuadra(6)}
                                {renderPosicaoQuadra(1)}
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

            {ultimoSetFinalizadoIncorretamente && (
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
                    O último set foi marcado como
                    finalizado, mas o placar ainda
                    não atende aos critérios de
                    encerramento.
                </Alert>
            )}

            {setAtual &&
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
                                fontWeight: 700,
                                mb: 3,
                            }}
                        >
                            Set {setAtual.numero}
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "1fr auto 1fr",
                                },
                                gap: 3,
                                alignItems: "center",
                            }}
                        >
                            <Box
                                sx={{
                                    textAlign: "center",
                                }}
                            >
                                <Typography variant="h6">
                                    {equipe?.nome ??
                                        "Equipe"}
                                </Typography>

                                <Typography
                                    variant="h1"
                                    sx={{
                                        fontWeight: 700,
                                        my: 2,
                                    }}
                                >
                                    {
                                        setAtual.pontosEquipe
                                    }
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent:
                                            "center",
                                        gap: 1,
                                        flexWrap: "wrap",
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
                                    textAlign: "center",
                                }}
                            >
                                ×
                            </Typography>

                            <Box
                                sx={{
                                    textAlign: "center",
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
                                        fontWeight: 700,
                                        my: 2,
                                    }}
                                >
                                    {
                                        setAtual.pontosAdversario
                                    }
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent:
                                            "center",
                                        gap: 1,
                                        flexWrap: "wrap",
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
                )}

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
                        A partida ainda não possui
                        sets.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            flexWrap: "wrap",
                        }}
                    >
                        {setsDaPartida.map(
                            (set) => (
                                <Card
                                    key={set.id}
                                    variant="outlined"
                                    sx={{
                                        minWidth: 160,
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                            }}
                                        >
                                            Set {set.numero}
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