import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    ListItemText,
    MenuItem,
    TextField,
} from "@mui/material";

import type { Equipe } from "../../types/Equipe";
import type { PontosPorSet } from "../../types/Partida";
import type {
    FormatoTorneio,
    StatusTorneio,
    Torneio,
} from "../../types/Torneio";

const formatosTorneio: FormatoTorneio[] = [
    "2x2",
    "4x4",
    "6x6",
];

const statusTorneio: StatusTorneio[] = [
    "Planejado",
    "Em andamento",
    "Finalizado",
    "Cancelado",
];

export interface DadosTorneio {
    nome: string;
    formato: FormatoTorneio;
    pontosPorSet: PontosPorSet;
    equipesIds: string[];
    local: string;
    dataInicio: string;
    dataFim: string;
    status: StatusTorneio;
    observacoes: string;
}

const formularioInicial: DadosTorneio = {
    nome: "",
    formato: "4x4",
    pontosPorSet: 15,
    equipesIds: [],
    local: "",
    dataInicio: "",
    dataFim: "",
    status: "Planejado",
    observacoes: "",
};

interface TorneioDialogProps {
    aberto: boolean;
    equipes: Equipe[];
    torneio: Torneio | null;
    aoFechar: () => void;
    aoSalvar: (dados: DadosTorneio) => void;
}

function TorneioDialog({
    aberto,
    equipes,
    torneio,
    aoFechar,
    aoSalvar,
}: TorneioDialogProps) {
    const [formulario, setFormulario] =
        useState<DadosTorneio>(formularioInicial);

    useEffect(() => {
        if (!aberto) {
            return;
        }

        if (torneio) {
            setFormulario({
                nome: torneio.nome,
                formato: torneio.formato,
                pontosPorSet: torneio.pontosPorSet ?? 15,
                equipesIds: torneio.equipesIds ?? [],
                local: torneio.local ?? "",
                dataInicio: torneio.dataInicio ?? "",
                dataFim: torneio.dataFim ?? "",
                status: torneio.status,
                observacoes: torneio.observacoes ?? "",
            });
        } else {
            setFormulario(formularioInicial);
        }
    }, [aberto, torneio]);

    const periodoInvalido =
        formulario.dataInicio.length > 0 &&
        formulario.dataFim.length > 0 &&
        formulario.dataFim < formulario.dataInicio;

    const formularioValido =
        formulario.nome.trim().length > 0 &&
        !periodoInvalido;

    function atualizar<K extends keyof DadosTorneio>(
        campo: K,
        valor: DadosTorneio[K],
    ) {
        setFormulario((atual) => ({
            ...atual,
            [campo]: valor,
        }));
    }

    return (
        <Dialog
            open={aberto}
            onClose={aoFechar}
            fullWidth
            maxWidth="md"
        >
            <DialogTitle>
                {torneio ? "Editar torneio" : "Novo torneio"}
            </DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                        },
                        gap: 2,
                        mt: 1,
                    }}
                >
                    <TextField
                        label="Nome do torneio"
                        value={formulario.nome}
                        onChange={(evento) =>
                            atualizar("nome", evento.target.value)
                        }
                        required
                        autoFocus
                        fullWidth
                        sx={{
                            gridColumn: {
                                xs: "1",
                                sm: "1 / -1",
                            },
                        }}
                    />

                    <TextField
                        select
                        label="Formato"
                        value={formulario.formato}
                        onChange={(evento) =>
                            atualizar(
                                "formato",
                                evento.target.value as FormatoTorneio,
                            )
                        }
                        fullWidth
                    >
                        {formatosTorneio.map((formato) => (
                            <MenuItem key={formato} value={formato}>
                                {formato.replace("x", " x ")}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Pontos por set"
                        value={formulario.pontosPorSet}
                        onChange={(evento) =>
                            atualizar(
                                "pontosPorSet",
                                Number(evento.target.value) as PontosPorSet,
                            )
                        }
                        helperText="Cada partida do torneio é de set único. Na final, você pode escolher melhor de 3."
                        fullWidth
                    >
                        <MenuItem value={12}>12 pontos</MenuItem>
                        <MenuItem value={15}>15 pontos</MenuItem>
                    </TextField>

                    <TextField
                        select
                        label="Status"
                        value={formulario.status}
                        onChange={(evento) =>
                            atualizar(
                                "status",
                                evento.target.value as StatusTorneio,
                            )
                        }
                        fullWidth
                    >
                        {statusTorneio.map((status) => (
                            <MenuItem key={status} value={status}>
                                {status}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Equipes participantes"
                        value={formulario.equipesIds}
                        onChange={(evento) => {
                            const valor = evento.target.value as unknown;

                            atualizar(
                                "equipesIds",
                                typeof valor === "string"
                                    ? valor.split(",")
                                    : (valor as string[]),
                            );
                        }}
                        slotProps={{
                            select: {
                                multiple: true,
                                renderValue: (selecionados) =>
                                    (selecionados as string[])
                                        .map(
                                            (id) =>
                                                equipes.find(
                                                    (equipe) =>
                                                        equipe.id === id,
                                                )?.nome ?? "Equipe removida",
                                        )
                                        .join(", "),
                            },
                        }}
                        helperText={
                            equipes.length === 0
                                ? "Cadastre equipes antes para alocá-las ao torneio."
                                : `${formulario.equipesIds.length} equipe(s) selecionada(s). Só elas poderão ser escolhidas nas partidas do torneio.`
                        }
                        fullWidth
                        sx={{
                            gridColumn: {
                                xs: "1",
                                sm: "1 / -1",
                            },
                        }}
                    >
                        {equipes
                            .filter(
                                (equipe) =>
                                    equipe.ativa ||
                                    formulario.equipesIds.includes(
                                        equipe.id,
                                    ),
                            )
                            .map((equipe) => (
                                <MenuItem
                                    key={equipe.id}
                                    value={equipe.id}
                                >
                                    <Checkbox
                                        checked={formulario.equipesIds.includes(
                                            equipe.id,
                                        )}
                                    />

                                    <ListItemText
                                        primary={equipe.nome}
                                        secondary={equipe.categoria}
                                    />
                                </MenuItem>
                            ))}
                    </TextField>

                    <TextField
                        label="Local"
                        value={formulario.local}
                        onChange={(evento) =>
                            atualizar("local", evento.target.value)
                        }
                        fullWidth
                    />

                    <TextField
                        label="Data de início"
                        type="date"
                        value={formulario.dataInicio}
                        onChange={(evento) =>
                            atualizar("dataInicio", evento.target.value)
                        }
                        slotProps={{
                            inputLabel: { shrink: true },
                        }}
                        fullWidth
                    />

                    <TextField
                        label="Data de término"
                        type="date"
                        value={formulario.dataFim}
                        onChange={(evento) =>
                            atualizar("dataFim", evento.target.value)
                        }
                        error={periodoInvalido}
                        helperText={
                            periodoInvalido
                                ? "O término não pode ser anterior ao início."
                                : "Deixe igual ao início se for de um dia só."
                        }
                        slotProps={{
                            inputLabel: { shrink: true },
                        }}
                        fullWidth
                    />

                    <TextField
                        label="Observações"
                        value={formulario.observacoes}
                        onChange={(evento) =>
                            atualizar("observacoes", evento.target.value)
                        }
                        multiline
                        minRows={3}
                        fullWidth
                        sx={{
                            gridColumn: {
                                xs: "1",
                                sm: "1 / -1",
                            },
                        }}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={aoFechar}>Cancelar</Button>

                <Button
                    variant="contained"
                    onClick={() => aoSalvar(formulario)}
                    disabled={!formularioValido}
                >
                    {torneio ? "Salvar alterações" : "Salvar torneio"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default TorneioDialog;
