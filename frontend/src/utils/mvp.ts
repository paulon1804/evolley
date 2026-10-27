import type { ScoutEvent } from "../types/ScoutEvent";

/*
 * Pesos usados para calcular a nota de cada atleta na partida.
 * Considera só o que foi pedido: pontos, bons passes,
 * bons levantamentos e boas defesas.
 */
export const PESOS_MVP = {
    ponto: 3,
    passeA: 2,
    passeB: 1,
    levantamento: 2,
    defesa: 2,
} as const;

export interface DesempenhoAtleta {
    atletaId: string;
    equipeId: string;
    pontos: number;
    passesA: number;
    passesB: number;
    levantamentosBons: number;
    defesasBoas: number;
    erros: number;
    acoes: number;
    nota: number;
}

export function calcularDesempenho(
    eventos: ScoutEvent[],
    equipePadraoId: string,
): DesempenhoAtleta[] {
    const mapa = new Map<string, DesempenhoAtleta>();

    eventos.forEach((evento) => {
        let item = mapa.get(evento.atletaId);

        if (!item) {
            item = {
                atletaId: evento.atletaId,
                equipeId: evento.equipeId ?? equipePadraoId,
                pontos: 0,
                passesA: 0,
                passesB: 0,
                levantamentosBons: 0,
                defesasBoas: 0,
                erros: 0,
                acoes: 0,
                nota: 0,
            };

            mapa.set(evento.atletaId, item);
        }

        item.acoes += 1;

        if (
            evento.resultado === "Ponto" ||
            evento.resultado === "Ace"
        ) {
            item.pontos += 1;
        }

        if (evento.fundamento === "Recepção") {
            if (evento.resultado === "A") {
                item.passesA += 1;
            }

            if (evento.resultado === "B") {
                item.passesB += 1;
            }
        }

        if (
            evento.fundamento === "Levantamento" &&
            evento.resultado === "Positivo"
        ) {
            item.levantamentosBons += 1;
        }

        if (
            evento.fundamento === "Defesa" &&
            evento.resultado === "Positivo"
        ) {
            item.defesasBoas += 1;
        }

        if (evento.resultado === "Erro") {
            item.erros += 1;
        }
    });

    const lista = Array.from(mapa.values());

    lista.forEach((item) => {
        item.nota =
            item.pontos * PESOS_MVP.ponto +
            item.passesA * PESOS_MVP.passeA +
            item.passesB * PESOS_MVP.passeB +
            item.levantamentosBons * PESOS_MVP.levantamento +
            item.defesasBoas * PESOS_MVP.defesa;
    });

    /*
     * Ordem: maior nota; em empate, menos erros,
     * depois mais pontos e por fim mais ações.
     */
    return lista.sort(
        (a, b) =>
            b.nota - a.nota ||
            a.erros - b.erros ||
            b.pontos - a.pontos ||
            b.acoes - a.acoes,
    );
}

export function escolherMvp(
    desempenhos: DesempenhoAtleta[],
): DesempenhoAtleta | undefined {
    const primeiro = desempenhos[0];

    return primeiro && primeiro.nota > 0
        ? primeiro
        : undefined;
}
