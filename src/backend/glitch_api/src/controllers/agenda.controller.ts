import { Request, Response } from "express";
import agendaService from "../services/agenda.service";

class AgendaController {
  async listarMinhasNotificacoes(req: Request, res: Response): Promise<any> {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ message: "Necessario estar logado" });
    }

    try {
      const queryString = (valor: any): string | undefined => {
        const valorNormalizado = Array.isArray(valor) ? valor[0] : valor;
        if (valorNormalizado === undefined || valorNormalizado === null) {
          return undefined;
        }

        const texto = String(valorNormalizado).trim();
        return texto.length ? texto : undefined;
      };

      const apenasNaoLidasRaw =
        queryString(req.query.apenasNaoLidas) ?? queryString(req.query.nao_lidas);
      const apenasNaoLidas = !(
        apenasNaoLidasRaw &&
        ["false", "0", "nao", "n"].includes(apenasNaoLidasRaw.toLowerCase())
      );

      const limiteRaw = queryString(req.query.limite) ?? "20";
      const limite = Math.max(1, parseInt(limiteRaw, 10) || 20);

      await agendaService.processarLembretesDiariosHojePorUsuario(usuarioId);

      const notificacoes = await agendaService.listarNotificacoesUsuario(
        usuarioId,
        apenasNaoLidas,
        limite,
      );

      return res.status(200).json(notificacoes);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async marcarNotificacaoComoLida(req: Request, res: Response): Promise<any> {
    const usuarioId = req.usuario?.id;
    const notificacaoId = req.params.id;

    if (!usuarioId) {
      return res.status(401).json({ message: "Necessário estar logado" });
    }

    if (!notificacaoId) {
      return res.status(400).json({ message: "Necessário informar notificação" });
    }

    try {
      const marcada = await agendaService.marcarNotificacaoComoLida(
        usuarioId,
        notificacaoId,
      );

      if (!marcada) {
        return res.status(404).json({ message: "Notificação não encontrada" });
      }

      return res.status(200).json({ message: "ok" });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async marcarTodasNotificacoesComoLidas(
    req: Request,
    res: Response,
  ): Promise<any> {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ message: "Necessário estar logado" });
    }

    try {
      const qtdAtualizada =
        await agendaService.marcarTodasNotificacoesComoLidas(usuarioId);
      return res.status(200).json({
        message: "ok",
        atualizadas: qtdAtualizada,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export default new AgendaController();
