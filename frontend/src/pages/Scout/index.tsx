import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import {
    Alert,
    Box,
    Button,
    Chip,
    IconButton,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";

import type { Atleta } from "../../types/Atleta";
import type { Equipe } from "../../types/Equipe";
import type { Partida } from "../../types/Partida";
import type { ScoutEvent } from "../../types/ScoutEvent";
import type { Torneio } from "../../types/Torneio";

import {
    calcularDesempenho,
    escolherMvp,
    PESOS_MVP,
} from "../../utils/mvp";

function ler<T>(chave: string): T[] {
    try {
        const bruto = localStorage.getItem(chave);

        return bruto ? (JSON.parse(bruto) as T[]) : [];
    } catch {
        return [];
    }
}

function Scout() {
    const navigate = useNavigate();
    const [parametros] = useSearchParams();

    const [partidas, setPartidas] = useState<Partida[]>([]);
    const [equipes, setEquipes] = useState<Equipe[]>([]);
    const [atletas, setAtletas] = useState<Atleta[]>([]);
    const [torneios, setTorneios] = useState<Torneio[]>([]);
    const [eventos, setEventos] = useState<ScoutEvent[]>([]);

    const [torneioId, setTorneioId] = useState("todos");
    const [equipeId, setEquipeId] = useState("todas");
    const [partidaId, setPartidaId] = useState(
        parametros.get("partida") ?? "todas",
    );

    useEffect(() => {
        setPartidas(ler<Partida>("evolley-partidas"));
        setEquipes(ler<Equipe>("evolley-equipes"));
        setAtletas(ler<Atleta>("evolley-atletas"));
        setTorneios(ler<Torneio>("evolley-torneios"));
        setEventos(ler<ScoutEvent>("evolley-scout-events"));
    }, []);

    const partidasDoTorneio = useMemo(
        () =>
            partidas.filter(
                (partida) =>
                    torneioId === "todos" ||
                    partida.torneioId === torneioId,
            ),
        [partidas, torneioId],
    );

    const partidasFiltradas = useMemo(
        () =>
            partidasDoTorneio.filter(
                (partida) =>
                    partidaId === "todas" ||
                    partida.id === partidaId,
            ),
        [partidasDoTorneio, partidaId],
    );

    /*
     * Eventos antigos não têm equipeId: pertencem à equipe
     * da partida. Aqui o equipeId já é resolvido.
     */
    const eventosFiltrados = useMemo(() => {
        const porId = new Map(
            partidasFiltradas.map((partida) => [
                partida.id,
                partida,
            ]),
        );

        return eventos
            .filter((evento) => porId.has(evento.partidaId))
            .map((evento) => ({
                ...evento,
                equipeId:
                    evento.equipeId ??
                    porId.get(evento.partidaId)?.equipeId,
            }))
            .filter(
                (evento) =>
                    equipeId === "todas" ||
                    evento.equipeId === equipeId,
            );
    }, [eventos, partidasFiltradas, equipeId]);

    const ranking = useMemo(() => {
        const desempenhos = calcularDesempenho(
            eventosFiltrados,
            "",
        );

        const jogos = new Map<string, Set<string>>();

        eventosFiltrados.forEach((evento) => {
            const conjunto =
                jogos.get(evento.atletaId) ?? new Set<string>();

            conjunto.add(evento.partidaId);
            jogos.set(evento.atletaId, conjunto);
        });

        const mvps = new Map<string, number>();

        partidasFiltradas
            .filter((partida) => partida.status === "Finalizada")
            .forEach((partida) => {
                const eventosDaPartida = eventos
                    .filter(
                        (evento) => evento.partidaId === partida.id,
                    )
                    .map((evento) => ({
                        ...evento,
                        equipeId:
                            evento.equipeId ?? partida.equipeId,
                    }));

                const mvp = escolherMvp(
                    calcularDesempenho(
                        eventosDaPartida,
                        partida.equipeId,
                    ),
                );

                if (mvp) {
                    mvps.set(
                        mvp.atletaId,
                        (mvps.get(mvp.atletaId) ?? 0) + 1,
                    );
                }
            });

        return desempenhos.map((item) => ({
            ...item,
            partidas: jogos.get(item.atletaId)?.size ?? 0,
            mvps: mvps.get(item.atletaId) ?? 0,
        }));
    }, [eventosFiltrados, eventos, partidasFiltradas]);

    const grupos = useMemo(() => {
        const mapa = new Map<string, typeof ranking>();

        ranking.forEach((item) => {
            const lista = mapa.get(item.equipeId) ?? [];

            lista.push(item);
            mapa.set(item.equipeId, lista);
        });

        return Array.from(mapa.entries())
            .map(([id, jogadores]) => ({
                equipeId: id,
                nome:
                    equipes.find((equipe) => equipe.id === id)
                        ?.nome ?? "Equipe",
                jogadores,
                total: {
                    pontos: jogadores.reduce((x, i) => x + i.pontos, 0),
                    passesA: jogadores.reduce((x, i) => x + i.passesA, 0),
                    passesB: jogadores.reduce((x, i) => x + i.passesB, 0),
                    levantamentos: jogadores.reduce(
                        (x, i) => x + i.levantamentosBons,
                        0,
                    ),
                    defesas: jogadores.reduce(
                        (x, i) => x + i.defesasBoas,
                        0,
                    ),
                    erros: jogadores.reduce((x, i) => x + i.erros, 0),
                    nota: jogadores.reduce((x, i) => x + i.nota, 0),
                },
            }))
            .sort((a, b) => a.nome.localeCompare(b.nome));
    }, [ranking, equipes]);

    const emAndamento = partidas.filter(
        (partida) =>
            partida.status === "Em andamento" ||
            partida.status === "Agendada",
    );

    function nomeEquipe(id?: string) {
        return (
            equipes.find((equipe) => equipe.id === id)?.nome ??
            "Equipe"
        );
    }

    const partidasComScout = new Set(
        eventosFiltrados.map((evento) => evento.partidaId),
    ).size;

    const totalPontos = ranking.reduce(
        (soma, item) => soma + item.pontos,
        0,
    );

    return (
        <>
            <PageHeader
                titulo="Scout"
                subtitulo="Estatísticas e ranking dos atletas a partir do scout das partidas."
            />

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                <StatCard
                    titulo="Ações"
                    valor={eventosFiltrados.length}
                    descricao="Ações registradas"
                />

                <StatCard
                    titulo="Partidas"
                    valor={partidasComScout}
                    descricao="Com scout registrado"
                />

                <StatCard
                    titulo="Atletas"
                    valor={ranking.length}
                    descricao="Com ações no scout"
                />

                <StatCard
                    titulo="Pontos"
                    valor={totalPontos}
                    descricao="Ace, ataque e bloqueio"
                />
            </Box>

            {emAndamento.length > 0 && (
                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 1 }}
                    >
                        Partidas para marcar scout
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        {emAndamento.map((partida) => (
                            <Box
                                key={partida.id}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: 2,
                                }}
                            >
                                <Typography>
                                    {nomeEquipe(partida.equipeId)} x{" "}
                                    {partida.adversario}
                                    {partida.competicao
                                        ? ` · ${partida.competicao}`
                                        : ""}
                                </Typography>

                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                    }}
                                >
                                    <Chip
                                        size="small"
                                        label={partida.status}
                                        color={
                                            partida.status ===
                                                "Em andamento"
                                                ? "warning"
                                                : "info"
                                        }
                                    />

                                    <Tooltip title="Abrir Centro de Partida">
                                        <IconButton
                                            color="success"
                                            onClick={() =>
                                                navigate(
                                                    `/jogos/${partida.id}/centro`,
                                                )
                                            }
                                        >
                                            <PlayArrowIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Paper>
            )}

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(3, 1fr)",
                    },
                    gap: 2,
                    mb: 3,
                    maxWidth: 1000,
                }}
            >
                <TextField
                    select
                    label="Torneio"
                    value={torneioId}
                    onChange={(evento) => {
                        setTorneioId(evento.target.value);
                        setPartidaId("todas");
                    }}
                >
                    <MenuItem value="todos">Todos</MenuItem>

                    {torneios.map((torneio) => (
                        <MenuItem
                            key={torneio.id}
                            value={torneio.id}
                        >
                            {torneio.nome}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Partida"
                    value={partidaId}
                    onChange={(evento) =>
                        setPartidaId(evento.target.value)
                    }
                >
                    <MenuItem value="todas">Todas</MenuItem>

                    {partidasDoTorneio.map((partida) => (
                        <MenuItem key={partida.id} value={partida.id}>
                            {nomeEquipe(partida.equipeId)} x{" "}
                            {partida.adversario}
                            {partida.data
                                ? ` · ${new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${partida.data}T00:00:00`))}`
                                : ""}
                        </MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Equipe"
                    value={equipeId}
                    onChange={(evento) =>
                        setEquipeId(evento.target.value)
                    }
                >
                    <MenuItem value="todas">Todas</MenuItem>

                    {equipes.map((equipe) => (
                        <MenuItem key={equipe.id} value={equipe.id}>
                            {equipe.nome}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {ranking.length === 0 ? (
                <Alert severity="info">
                    Nenhuma ação de scout registrada
                    {torneioId !== "todos" ||
                        partidaId !== "todas" ||
                        equipeId !== "todas"
                        ? " para este filtro"
                        : ""}
                    . Para registrar: em Jogos, abra a partida
                    (botão ▶), inicie a partida, confirme a escalação
                    de cada equipe e use o Scout rápido.
                </Alert>
            ) : (
                <>
                    <Typography
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        Nota = pontos ×{PESOS_MVP.ponto} · passe A ×
                        {PESOS_MVP.passeA} · passe B ×
                        {PESOS_MVP.passeB} · levantamento positivo ×
                        {PESOS_MVP.levantamento} · defesa positiva ×
                        {PESOS_MVP.defesa}
                    </Typography>

                    {grupos.map((grupo) => (
                        <Paper
                            key={grupo.equipeId}
                            sx={{ mb: 3, overflow: "hidden" }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    flexWrap: "wrap",
                                    gap: 1,
                                    px: 2,
                                    py: 1.5,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: 700 }}
                                >
                                    {grupo.nome}
                                </Typography>

                                <Chip
                                    label={`${grupo.jogadores.length} jogador(es) · ${grupo.total.pontos} pontos`}
                                    size="small"
                                />
                            </Box>

                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Jogador</TableCell>
                                            <TableCell align="right">Jogos</TableCell>
                                            <TableCell align="right">Pontos</TableCell>
                                            <TableCell align="right">Passe A</TableCell>
                                            <TableCell align="right">Passe B</TableCell>
                                            <TableCell align="right">Lev. +</TableCell>
                                            <TableCell align="right">Defesas +</TableCell>
                                            <TableCell align="right">Erros</TableCell>
                                            <TableCell align="right">MVPs</TableCell>
                                            <TableCell align="right">Nota</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {grupo.jogadores.map((item, indice) => {
                                            const atleta = atletas.find(
                                                (a) => a.id === item.atletaId,
                                            );

                                            return (
                                                <TableRow key={item.atletaId} hover>
                                                    <TableCell>{indice + 1}</TableCell>

                                                    <TableCell sx={{ fontWeight: 600 }}>
                                                        {atleta
                                                            ? `#${atleta.numero} ${atleta.nome}`
                                                            : "Atleta removido"}
                                                    </TableCell>

                                                    <TableCell align="right">{item.partidas}</TableCell>
                                                    <TableCell align="right">{item.pontos}</TableCell>
                                                    <TableCell align="right">{item.passesA}</TableCell>
                                                    <TableCell align="right">{item.passesB}</TableCell>
                                                    <TableCell align="right">{item.levantamentosBons}</TableCell>
                                                    <TableCell align="right">{item.defesasBoas}</TableCell>
                                                    <TableCell align="right">{item.erros}</TableCell>
                                                    <TableCell align="right">{item.mvps}</TableCell>

                                                    <TableCell
                                                        align="right"
                                                        sx={{ fontWeight: 700 }}
                                                    >
                                                        {item.nota}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}

                                        <TableRow>
                                            <TableCell />

                                            <TableCell sx={{ fontWeight: 700 }}>
                                                Total da equipe
                                            </TableCell>

                                            <TableCell />

                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {grupo.total.pontos}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {grupo.total.passesA}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {grupo.total.passesB}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {grupo.total.levantamentos}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {grupo.total.defesas}
                                            </TableCell>

                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {grupo.total.erros}
                                            </TableCell>

                                            <TableCell />

                                            <TableCell align="right" sx={{ fontWeight: 700 }}>
                                                {grupo.total.nota}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    ))}
                </>
            )}

            <Box sx={{ mt: 2 }}>
                <Button onClick={() => navigate("/jogos")}>
                    Ir para Jogos
                </Button>
            </Box>
        </>
    );
}

export default Scout;
