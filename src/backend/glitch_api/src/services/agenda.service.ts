import { Op } from "sequelize";
import models from "../models/index.models";

type TipoAlertaAgenda = "DIA_09H" | "ANTES_5MIN";

type CompromissoAgendaAtivo = {
  usuario_id: string;
  evento_id: string;
  evento_titulo: string;
  evento_inicio: Date;
  papel: string;
};

class AgendaService {
  private formatarDataReferencia(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }

  private formatarHoraMinuto(data: Date): string {
    const hora = String(data.getHours()).padStart(2, "0");
    const minuto = String(data.getMinutes()).padStart(2, "0");
    return `${hora}:${minuto}`;
  }

  private montarMensagemLembreteDiario(params: {
    eventoTitulo: string;
    eventoInicio: Date;
    agora: Date;
  }): { titulo: string; mensagem: string } {
    const hora = this.formatarHoraMinuto(params.eventoInicio);
    const jaComecou = params.eventoInicio.getTime() <= params.agora.getTime();

    if (jaComecou) {
      return {
        titulo: "Torneio já começou:",
        mensagem: `O torneio ${params.eventoTitulo} já começou (inicio previsto: ${hora}).`,
      };
    }

    return {
      titulo: "Lembrete de hoje:",
      mensagem: `Hoje às ${hora} você tem: ${params.eventoTitulo}.`,
    };
  }

  private async buscarCompromissosAtivosNoIntervalo(
    inicio: Date,
    fim: Date,
    usuarioId?: string,
  ): Promise<CompromissoAgendaAtivo[]> {
    const whereAgendaUsuario: any = {
      is_ativo: true,
      dt_removido: null,
    };

    if (usuarioId) {
      whereAgendaUsuario.usuario_id = usuarioId;
    }

    const linhas = (await models.AgendaUsuarios.findAll({
      attributes: ["usuario_id", "evento_id", "papel"],
      where: whereAgendaUsuario,
      include: [
        {
          model: models.AgendaEventos,
          as: "evento",
          attributes: ["id", "titulo_snapshot", "inicio_snapshot"],
          required: true,
          where: {
            is_ativo: true,
            status: "ATIVO",
            inicio_snapshot: {
              [Op.between]: [inicio, fim],
            },
          },
        },
      ],
      raw: true,
      nest: true,
    })) as unknown as Array<{
      usuario_id?: string;
      evento_id?: string;
      papel?: string;
      evento?: {
        id?: string;
        titulo_snapshot?: string;
        inicio_snapshot?: Date | string;
      };
    }>;

    const unicos = new Map<string, CompromissoAgendaAtivo>();

    for (const linha of linhas) {
      const usuarioId = String(linha?.usuario_id ?? "").trim();
      const eventoId = String(linha?.evento?.id ?? linha?.evento_id ?? "").trim();
      const titulo = String(linha?.evento?.titulo_snapshot ?? "").trim();
      const papel = String(linha?.papel ?? "").trim().toUpperCase();
      const inicioBruto = linha?.evento?.inicio_snapshot;
      const inicioData = inicioBruto ? new Date(inicioBruto) : null;

      if (!usuarioId || !eventoId || !titulo || !inicioData || !papel) continue;
      if (Number.isNaN(inicioData.getTime())) continue;

      const chave = `${usuarioId}:${eventoId}`;
      if (unicos.has(chave)) continue;

      unicos.set(chave, {
        usuario_id: usuarioId,
        evento_id: eventoId,
        evento_titulo: titulo,
        evento_inicio: inicioData,
        papel,
      });
    }

    return Array.from(unicos.values());
  }

  private async criarNotificacaoSeNaoExiste(params: {
    usuarioId: string;
    eventoId: string;
    tipoAlerta: TipoAlertaAgenda;
    titulo: string;
    mensagem: string;
    referenciaData: string;
    dtEvento: Date;
    reativarSeEventoMudou?: boolean;
  }): Promise<boolean> {
    const [notificacao, criada] = await models.AgendaNotificacoes.findOrCreate({
      where: {
        usuario_id: params.usuarioId,
        evento_id: params.eventoId,
        tipo_alerta: params.tipoAlerta,
        referencia_data: params.referenciaData,
      },
      defaults: {
        usuario_id: params.usuarioId,
        evento_id: params.eventoId,
        tipo_alerta: params.tipoAlerta,
        titulo: params.titulo,
        mensagem: params.mensagem,
        referencia_data: params.referenciaData,
        dt_evento: params.dtEvento,
        is_lida: false,
        dt_criacao: new Date(),
      },
    });

    if (criada) return true;

    if (!params.reativarSeEventoMudou) {
      return false;
    }

    const notificacaoExistente = notificacao as any;
    const dtEventoExistenteBruta = notificacaoExistente?.dataValues?.dt_evento;
    const dtEventoExistente = dtEventoExistenteBruta
      ? new Date(dtEventoExistenteBruta)
      : null;

    if (!dtEventoExistente || Number.isNaN(dtEventoExistente.getTime())) {
      return false;
    }

    if (dtEventoExistente.getTime() === params.dtEvento.getTime()) {
      return false;
    }

    await notificacaoExistente.update({
      titulo: params.titulo,
      mensagem: params.mensagem,
      dt_evento: params.dtEvento,
      is_lida: false,
      dt_lida: null,
    });

    return true;
  }

  async processarLembretesDiariosHoje(): Promise<number> {
    const agora = new Date();
    const inicioHoje = new Date(agora);
    inicioHoje.setHours(0, 0, 0, 0);
    const fimHoje = new Date(agora);
    fimHoje.setHours(23, 59, 59, 999);

    const compromissosHoje = await this.buscarCompromissosAtivosNoIntervalo(
      inicioHoje,
      fimHoje,
    );
    const compromissosJaIniciados = await this.buscarCompromissosAtivosNoIntervalo(
      new Date(0),
      agora,
    );
    const compromissos = Array.from(
      new Map(
        [...compromissosHoje, ...compromissosJaIniciados].map((compromisso) => [
          `${compromisso.usuario_id}:${compromisso.evento_id}`,
          compromisso,
        ]),
      ).values(),
    );

    let totalCriadas = 0;
    for (const compromisso of compromissos) {
      const { titulo, mensagem } = this.montarMensagemLembreteDiario({
        eventoTitulo: compromisso.evento_titulo,
        eventoInicio: compromisso.evento_inicio,
        agora,
      });

      const referenciaData = this.formatarDataReferencia(compromisso.evento_inicio);
      const criada = await this.criarNotificacaoSeNaoExiste({
        usuarioId: compromisso.usuario_id,
        eventoId: compromisso.evento_id,
        tipoAlerta: "DIA_09H",
        titulo,
        mensagem,
        referenciaData,
        dtEvento: compromisso.evento_inicio,
      });

      if (criada) totalCriadas++;
    }

    return totalCriadas;
  }
  async processarLembretesDiariosHojePorUsuario(
    usuarioId: string,
  ): Promise<number> {
    const agora = new Date();
    const inicioHoje = new Date(agora);
    inicioHoje.setHours(0, 0, 0, 0);
    const fimHoje = new Date(agora);
    fimHoje.setHours(23, 59, 59, 999);

    const compromissosHoje = await this.buscarCompromissosAtivosNoIntervalo(
      inicioHoje,
      fimHoje,
      usuarioId,
    );
    const compromissosJaIniciados = await this.buscarCompromissosAtivosNoIntervalo(
      new Date(0),
      agora,
      usuarioId,
    );
    const compromissos = Array.from(
      new Map(
        [...compromissosHoje, ...compromissosJaIniciados].map((compromisso) => [
          `${compromisso.usuario_id}:${compromisso.evento_id}`,
          compromisso,
        ]),
      ).values(),
    );

    let totalCriadas = 0;
    for (const compromisso of compromissos) {
      const { titulo, mensagem } = this.montarMensagemLembreteDiario({
        eventoTitulo: compromisso.evento_titulo,
        eventoInicio: compromisso.evento_inicio,
        agora,
      });

      const referenciaData = this.formatarDataReferencia(compromisso.evento_inicio);
      const criada = await this.criarNotificacaoSeNaoExiste({
        usuarioId: compromisso.usuario_id,
        eventoId: compromisso.evento_id,
        tipoAlerta: "DIA_09H",
        titulo,
        mensagem,
        referenciaData,
        dtEvento: compromisso.evento_inicio,
      });

      if (criada) totalCriadas++;
    }

    return totalCriadas;
  }
  async processarLembretesCincoMinutosAntes(): Promise<number> {
    const agora = new Date();
    const inicioJanela = new Date(agora.getTime() + 4 * 60 * 1000);
    const fimJanela = new Date(agora.getTime() + 6 * 60 * 1000);

    const compromissos = await this.buscarCompromissosAtivosNoIntervalo(
      inicioJanela,
      fimJanela,
    );

    let totalCriadas = 0;
    for (const compromisso of compromissos) {
      if (compromisso.papel === "ORGANIZADOR") {
        continue;
      }

      const referenciaData = this.formatarDataReferencia(compromisso.evento_inicio);
      const criada = await this.criarNotificacaoSeNaoExiste({
        usuarioId: compromisso.usuario_id,
        eventoId: compromisso.evento_id,
        tipoAlerta: "ANTES_5MIN",
        titulo: "Lembrete de inicio:",
        mensagem: `Faltam 5 minutos para comecar: ${compromisso.evento_titulo}.`,
        referenciaData,
        dtEvento: compromisso.evento_inicio,
        reativarSeEventoMudou: true,
      });

      if (criada) totalCriadas++;
    }

    const inicioHoje = new Date(agora);
    inicioHoje.setHours(0, 0, 0, 0);

    const compromissosJaIniciados = await this.buscarCompromissosAtivosNoIntervalo(
      inicioHoje,
      agora,
    );

    for (const compromisso of compromissosJaIniciados) {
      if (compromisso.papel === "ORGANIZADOR") {
        continue;
      }

      const referenciaData = this.formatarDataReferencia(compromisso.evento_inicio);
      const criada = await this.criarNotificacaoSeNaoExiste({
        usuarioId: compromisso.usuario_id,
        eventoId: compromisso.evento_id,
        tipoAlerta: "ANTES_5MIN",
        titulo: "Torneio ja comecou:",
        mensagem: `O torneio ${compromisso.evento_titulo} ja comecou.`,
        referenciaData,
        dtEvento: compromisso.evento_inicio,
        reativarSeEventoMudou: true,
      });

      if (criada) totalCriadas++;
    }

    return totalCriadas;
  }
  async listarNotificacoesUsuario(
    usuarioId: string,
    apenasNaoLidas: boolean = true,
    limite: number = 20,
  ): Promise<any[]> {
    const where: any = { usuario_id: usuarioId };
    if (apenasNaoLidas) {
      where.is_lida = false;
    }

    const maxLimite = Math.min(Math.max(limite, 1), 100);

    const notificacoes = await models.AgendaNotificacoes.findAll({
      where,
      include: [
        {
          model: models.AgendaEventos,
          as: "evento",
          attributes: ["origem_tipo", "origem_id"],
          required: false,
        },
      ],
      attributes: [
        "id",
        "evento_id",
        "tipo_alerta",
        "titulo",
        "mensagem",
        "dt_evento",
        "is_lida",
        "dt_lida",
        "dt_criacao",
      ],
      order: [["dt_criacao", "DESC"]],
      limit: maxLimite,
    });

    const notificacoesJson = notificacoes.map((notificacao: any) =>
      notificacao.toJSON(),
    );

    const eventoIds = Array.from(
      new Set(
        notificacoesJson
          .map((notificacao: any) => String(notificacao?.evento_id ?? "").trim())
          .filter((eventoId: string) => eventoId.length > 0),
      ),
    );

    const papeisPorEvento = new Map<string, string>();
    if (eventoIds.length > 0) {
      const vinculosAgenda = (await models.AgendaUsuarios.findAll({
        attributes: ["evento_id", "papel"],
        where: {
          usuario_id: usuarioId,
          is_ativo: true,
          dt_removido: null,
          evento_id: { [Op.in]: eventoIds },
        },
        raw: true,
      })) as unknown as Array<{ evento_id?: string; papel?: string }>;

      const prioridadePapel: Record<string, number> = {
        ORGANIZADOR: 3,
        INSCRITO: 2,
        ESPECTADOR: 1,
      };

      for (const vinculo of vinculosAgenda) {
        const eventoId = String(vinculo?.evento_id ?? "").trim();
        const papel = String(vinculo?.papel ?? "").trim();
        if (!eventoId || !papel) continue;

        const papelAtual = papeisPorEvento.get(eventoId);
        if (!papelAtual) {
          papeisPorEvento.set(eventoId, papel);
          continue;
        }

        const prioridadeAtual = prioridadePapel[papelAtual] ?? 0;
        const prioridadeNova = prioridadePapel[papel] ?? 0;
        if (prioridadeNova > prioridadeAtual) {
          papeisPorEvento.set(eventoId, papel);
        }
      }
    }

    return notificacoesJson.map((notificacao: any) => ({
      id: notificacao.id,
      tipo_alerta: notificacao.tipo_alerta,
      titulo: notificacao.titulo,
      mensagem: notificacao.mensagem,
      dt_evento: notificacao.dt_evento,
      is_lida: notificacao.is_lida,
      dt_lida: notificacao.dt_lida,
      dt_criacao: notificacao.dt_criacao,
      papel: papeisPorEvento.get(String(notificacao?.evento_id ?? "").trim()) ?? null,
      origem: {
        tipo: notificacao?.evento?.origem_tipo ?? null,
        id: notificacao?.evento?.origem_id ?? null,
      },
    }));
  }

  async marcarNotificacaoComoLida(
    usuarioId: string,
    notificacaoId: string,
  ): Promise<boolean> {
    const [qtdAtualizada] = await models.AgendaNotificacoes.update(
      {
        is_lida: true,
        dt_lida: new Date(),
      },
      {
        where: {
          id: notificacaoId,
          usuario_id: usuarioId,
          is_lida: false,
        },
      },
    );

    return qtdAtualizada > 0;
  }

  async marcarTodasNotificacoesComoLidas(usuarioId: string): Promise<number> {
    const [qtdAtualizada] = await models.AgendaNotificacoes.update(
      {
        is_lida: true,
        dt_lida: new Date(),
      },
      {
        where: {
          usuario_id: usuarioId,
          is_lida: false,
        },
      },
    );

    return qtdAtualizada;
  }
}

export default new AgendaService();
