import { useEffect, useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Paper,
    Typography,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";

import PageHeader from "../../components/common/PageHeader";

import {
    armazenamentoEstaProtegido,
    baixarBackup,
    lerArquivoBackup,
    restaurarDados,
    ultimoBackup,
} from "../../utils/backup";

function Configuracoes() {
    const inputRef = useRef<HTMLInputElement>(null);

    const [ultimo, setUltimo] = useState<Date | null>(
        ultimoBackup(),
    );

    const [protegido, setProtegido] = useState<boolean | null>(
        null,
    );

    useEffect(() => {
        armazenamentoEstaProtegido().then(setProtegido);
    }, []);

    const [mensagem, setMensagem] = useState<{
        tipo: "success" | "error";
        texto: string;
    } | null>(null);

    function exportarBackup() {
        const total = baixarBackup();

        if (total === 0) {
            setMensagem({
                tipo: "error",
                texto: "Não há dados do Evolley neste navegador para exportar.",
            });

            return;
        }

        setUltimo(ultimoBackup());

        setMensagem({
            tipo: "success",
            texto: `Backup exportado (${total} conjuntos de dados).`,
        });
    }

    async function importarBackup(
        arquivo: File | undefined,
    ) {
        if (!arquivo) {
            return;
        }

        try {
            const dados = await lerArquivoBackup(arquivo);

            const confirmado = window.confirm(
                "Restaurar este backup vai SUBSTITUIR os dados atuais do Evolley neste navegador. Deseja continuar?",
            );

            if (!confirmado) {
                return;
            }

            restaurarDados(dados);

            setMensagem({
                tipo: "success",
                texto: "Backup restaurado. Recarregando...",
            });

            setTimeout(() => window.location.reload(), 800);
        } catch {
            setMensagem({
                tipo: "error",
                texto: "Não foi possível ler o arquivo. Use um backup gerado pelo Evolley.",
            });
        } finally {
            if (inputRef.current) {
                inputRef.current.value = "";
            }
        }
    }

    return (
        <>
            <PageHeader
                titulo="Configurações"
                subtitulo="Backup e restauração dos dados salvos neste navegador."
            />

            <Paper sx={{ p: 3, maxWidth: 720 }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, mb: 1 }}
                >
                    Backup dos dados
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Os dados ficam salvos apenas neste navegador.
                    Exporte um backup entre as rodadas para não
                    perder jogos e scouts caso o navegador seja
                    limpo ou o aparelho trocado.
                </Typography>

                <Typography
                    variant="body2"
                    sx={{ mb: 2 }}
                >
                    Último backup:{" "}
                    {ultimo
                        ? ultimo.toLocaleString("pt-BR")
                        : "nenhum ainda"}
                    {protegido !== null &&
                        ` · Proteção do navegador contra limpeza automática: ${protegido ? "ativa" : "não concedida"}`}
                </Typography>

                {mensagem && (
                    <Alert
                        severity={mensagem.tipo}
                        sx={{ mb: 3 }}
                        onClose={() => setMensagem(null)}
                    >
                        {mensagem.texto}
                    </Alert>
                )}

                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={exportarBackup}
                    >
                        Exportar backup
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => inputRef.current?.click()}
                    >
                        Restaurar backup
                    </Button>

                    <input
                        ref={inputRef}
                        type="file"
                        accept="application/json,.json"
                        hidden
                        onChange={(evento) =>
                            importarBackup(
                                evento.target.files?.[0],
                            )
                        }
                    />
                </Box>
            </Paper>
        </>
    );
}

export default Configuracoes;
