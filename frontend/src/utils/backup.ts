const PREFIXO_STORAGE = "evolley-";
const VERSAO_BACKUP = 1;
const CHAVE_ULTIMO_BACKUP = "evolley-ultimo-backup";

interface ArquivoBackup {
    app: "evolley";
    versao: number;
    exportadoEm: string;
    dados: Record<string, string>;
}

export function coletarDados() {
    const dados: Record<string, string> = {};

    for (let i = 0; i < localStorage.length; i++) {
        const chave = localStorage.key(i);

        if (
            chave &&
            chave.startsWith(PREFIXO_STORAGE) &&
            chave !== CHAVE_ULTIMO_BACKUP
        ) {
            const valor = localStorage.getItem(chave);

            if (valor !== null) {
                dados[chave] = valor;
            }
        }
    }

    return dados;
}

export function temDadosParaBackup() {
    return Object.keys(coletarDados()).length > 0;
}

export function ultimoBackup(): Date | null {
    const valor = localStorage.getItem(CHAVE_ULTIMO_BACKUP);

    if (!valor) {
        return null;
    }

    const data = new Date(valor);

    return Number.isNaN(data.getTime()) ? null : data;
}

/* Baixa o arquivo de backup. Retorna quantos conjuntos de dados foram salvos. */
export function baixarBackup(): number {
    const dados = coletarDados();
    const total = Object.keys(dados).length;

    if (total === 0) {
        return 0;
    }

    const backup: ArquivoBackup = {
        app: "evolley",
        versao: VERSAO_BACKUP,
        exportadoEm: new Date().toISOString(),
        dados,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const carimbo = new Date()
        .toISOString()
        .slice(0, 16)
        .replace("T", "_")
        .replace(":", "-");

    link.href = url;
    link.download = `evolley-backup-${carimbo}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    try {
        localStorage.setItem(
            CHAVE_ULTIMO_BACKUP,
            new Date().toISOString(),
        );
    } catch {
        // Sem espaço: o backup já foi baixado, só não registramos a data.
    }

    return total;
}

/*
 * Lê e valida o arquivo. Lança erro se não for um backup
 * do Evolley. Não altera nada até o chamador confirmar.
 */
export async function lerArquivoBackup(
    arquivo: File,
): Promise<Record<string, string>> {
    const backup = JSON.parse(
        await arquivo.text(),
    ) as ArquivoBackup;

    if (
        backup.app !== "evolley" ||
        typeof backup.dados !== "object" ||
        backup.dados === null
    ) {
        throw new Error("Arquivo inválido");
    }

    const dados: Record<string, string> = {};

    Object.keys(backup.dados).forEach((chave) => {
        if (
            chave.startsWith(PREFIXO_STORAGE) &&
            typeof backup.dados[chave] === "string"
        ) {
            dados[chave] = backup.dados[chave];
        }
    });

    if (Object.keys(dados).length === 0) {
        throw new Error("Backup vazio");
    }

    return dados;
}

export function restaurarDados(dados: Record<string, string>) {
    Object.keys(coletarDados()).forEach((chave) =>
        localStorage.removeItem(chave),
    );

    Object.keys(dados).forEach((chave) =>
        localStorage.setItem(chave, dados[chave]),
    );
}

/*
 * Pede ao navegador para não apagar os dados do app sozinho
 * quando faltar espaço. Não impede o usuário de limpar manualmente.
 */
export async function pedirArmazenamentoPersistente() {
    try {
        if (navigator.storage?.persist) {
            return await navigator.storage.persist();
        }
    } catch {
        // Navegador sem suporte.
    }

    return false;
}

export async function armazenamentoEstaProtegido() {
    try {
        if (navigator.storage?.persisted) {
            return await navigator.storage.persisted();
        }
    } catch {
        // Navegador sem suporte.
    }

    return false;
}
