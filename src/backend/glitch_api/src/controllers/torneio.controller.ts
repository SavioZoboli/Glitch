import { Request, Response } from "express";
import torneioService, { TorneioService } from "../services/torneio.service";

export class TorneioController {
  async addTorneio(req: Request, res: Response): Promise<any> {
    let dados = req.body;
    console.log("Dados recebidos", dados);
    if (
      dados.jogo_id &&
      dados.usuario_responsavel &&
      dados.nome &&
      dados.dt_inicio &&
      dados.inscricao.dt_fim &&
      dados.inscricao.max_participantes &&
      dados.inscricao.modo_inscricao
    ) {
      try {
        await torneioService.addTorneio(dados);

        return res.status(201).json({
          message: "Criado",
        });
      } catch (e) {
        return res.status(500).json({
          message: "Erro interno",
        });
      }
    }

    return res.status(400).json({
      message: "Informações faltantes",
    });
  }


  async getAllTorneios(req: Request, res: Response): Promise<any> {
    try {
      const queryString = (valor: any): string | undefined => {
        const valorNormalizado = Array.isArray(valor) ? valor[0] : valor;
        if (valorNormalizado === undefined || valorNormalizado === null) {
          return undefined;
        }

        const texto = String(valorNormalizado).trim();
        return texto.length ? texto : undefined;
      };

      const paginaRaw = queryString(req.query.page) ?? queryString(req.query.pagina) ?? "1";
      const pagina = Math.max(1, parseInt(paginaRaw, 10) || 1);

      const nomeJogo =
        queryString(req.query.jogo) ??
        queryString(req.query.nomeJogo) ??
        queryString(req.query.nome_jogo);

      const data = queryString(req.query.data) ?? queryString(req.query.dt_inicio);
      const dataInicio =
        queryString(req.query.data_inicio) ?? queryString(req.query.dataInicio);
      const dataFim =
        queryString(req.query.data_fim) ?? queryString(req.query.dataFim);

      const isDataValida = (valor: string): boolean => {
        return !Number.isNaN(new Date(valor).getTime());
      };

      // Não permitir usar data única junto com intervalo
      if (data && (dataInicio || dataFim)) {
        return res.status(400).json({
          message: "Use apenas 'data' OU o intervalo 'dataInicio/dataFim'.",
        });
      }
   
      // Validar data única
      if (data && !isDataValida(data)) {
        return res.status(400).json({
          message: "Data inválida no parâmetro 'data'.",
        });
      }

      // Validar data inicial
      if (dataInicio && !isDataValida(dataInicio)) {
        return res.status(400).json({
          message: "Data inválida no parâmetro 'dataInicio'.",
        });
      }

      // Validar data final
      if (dataFim && !isDataValida(dataFim)) {
        return res.status(400).json({
          message: "Data inválida no parâmetro 'dataFim'.",
        });
      }

      // Validar intervalo
      if (
        dataInicio &&
        dataFim &&
        new Date(dataInicio).getTime() > new Date(dataFim).getTime()
      ) {
        return res.status(400).json({
          message: "'data_inicio' não pode ser maior que 'data_fim'.",
        });
      }

      let torneios = await torneioService.getAllTorneios(pagina, {
        nomeJogo,
        data,
        dataInicio,
        dataFim,
      });
      return res.status(200).json(torneios);
    } catch (e) {
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
  
  async deleteTorneio(req: Request, res: Response): Promise<any> {
    let id = req.params.id;
    if (!id) {
      res.status(400).json({ message: "Codigo faltante" });
      return;
    }
    try {
      let status = await torneioService.removeTorneio(id);
      switch (status) {
        case 200:
          res.status(200).json({ message: "removido" });
          break;
        case 404:
          res.status(404).json({ message: "Não encontrado" });
          break;
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getTorneioById(req: Request, res: Response): Promise<any> {
    let id = req.params.id;
    if (!id) {
      res.status(400).json({ message: "Dados incompletos" });
      return;
    }
    try {
      let torneio = await torneioService.getTorneioById(id);
      if (!torneio) {
        res.status(404).json({ message: "Torneio nao encontrado" });
        return;
      }
      res.status(200).json(torneio);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Erro do servidor" });
    }
  }

  async updateTorneio(req: Request, res: Response): Promise<any> {
    let dados = req.body;
    if (
      !dados.id ||
      !dados.nome ||
      !dados.dt_inicio ||
      !dados.inscricao.max_participantes ||
      !dados.inscricao.dt_fim ||
      !dados.inscricao.modo_inscricao
    ) {
      res.status(400).json({ message: "Dados faltando" });
      return;
    }
    try {
      await torneioService.updateTorneio(dados);
      res.status(200).json({ message: "Ok" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async ingressarEmTorneioIndividual(
    req: Request,
    res: Response,
  ): Promise<any> {
    let torneio = req.body.torneio;
    let usuario = req.usuario?.id;
    if (!torneio || !usuario) {
      res.status(400).json({ message: "Dados faltando" });
      return;
    }
    try {
      let status = await torneioService.ingressarEmTorneioIndividual(
        torneio,
        usuario,
      );
      res.status(200).json({ message: "entrou" });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Erro interno do servidor";
      const normalized = message
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      if (
        normalized.includes("limite de participantes") ||
        normalized.includes("não aceita ingresso")
      ) {
        res.status(400).json({ message });
        return;
      }
      if (
        normalized.includes("não foi encontrado") ||
        normalized.includes("não encontrado")
      ) {
        res.status(404).json({ message });
        return;
      }
      res.status(500).json({ message });
      console.log(e);
    }
  }

  async ingressarEmTorneioEquipe(req: Request, res: Response): Promise<any> {
    let torneio = req.body.torneio;
    let equipe = req.body.equipe;
    if (!torneio || !equipe) {
      res.status(400).json({ message: "Dados faltando" });
      return;
    }
    try {
      let status = await torneioService.ingressarEmTorneioEquipe(
        torneio,
        equipe,
      );
      res.status(200).json({ message: "entrou" });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Erro interno do servidor";
      const normalized = message
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
      if (
        normalized.includes("limite de participantes") ||
        normalized.includes("nao aceita ingresso")
      ) {
        res.status(400).json({ message });
        return;
      }
      if (
        normalized.includes("nao foi encontrado") ||
        normalized.includes("nao encontrado")
      ) {
        res.status(404).json({ message });
        return;
      }
      res.status(500).json({ message });
      console.log(e);
    }
  }

  async getPartidasDoTorneio(req: Request, res: Response) {
    let torneio = req.params.torneio;
    if (!torneio) {
      res.status(400).json({ message: "Necessário informar o torneio" });
      return;
    }
    try {
      let partidas = await torneioService.getPartidasTorneio(torneio);
      res.status(200).json(partidas);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async gerarPartidas(req: Request, res: Response) {
    let torneio = req.body.torneio;
    if (!torneio) {
      res.status(400).json({ message: "Necessário informar a partida" });
      return;
    }
    try {
      let status = await torneioService.gerarPartidas(torneio);
      res.status(200).json({ message: "Gerado" });
    } catch (e) {
      console.log(e);

      const message =
        e instanceof Error ? e.message : "Erro interno ao gerar partidas";

      const normalized = message
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (normalized.includes("torneio nao encontrado")) {
        res.status(404).json({ message });
        return;
      }

      if (normalized.includes("ja foram geradas")) {
        res.status(409).json({ message });
        return;
      }

      if (
        normalized.includes("Não há participantes") ||
        normalized.includes("pelo menos 2 participantes") ||
        normalized.includes("impossível jogar")
      ) {
        res.status(400).json({ message });
        return;
      }

      res.status(500).json({ message });
    }
  }

  async getPartidaById(req: Request, res: Response): Promise<any> {
    let partida_id = req.params.id;
    if (!partida_id) {
      res.status(400).json({ message: "Necessário informar a partida" });
      return;
    }
    try {
      let partida = await torneioService.getPartidaTorneio(partida_id);
      res.status(200).json(partida);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async finalizarTorneio(req: Request, res: Response): Promise<any> {
    let torneio = req.body.torneio;
    if (!torneio) {
      res.status(400).json({ message: "Dados faltando" });
      return;
    }
    try {
      await torneioService.finalizarTorneio(torneio);
      res.status(200).json({ message: "ok" });
    } catch (e) {
      console.log(e);
      const message =
        e instanceof Error ? e.message : "Erro interno do servidor";

      const normalized = message
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      if (
        normalized.includes("partidas agendadas") ||
        normalized.includes("iniciada sem pontuacao")
      ) {
        res.status(400).json({ message });
        return;
      }

      if (normalized.includes("torneio nao encontrado")) {
        res.status(404).json({ message });
        return;
      }

      res.status(500).json({ message });
    }
  }

  async buscarTorneiosDoUsuario(req: Request, res: Response) {
    let usuario = req.usuario?.id;
    if (!usuario) {
      res.status(400).json({ message: "Necessário estar logado" });
      return;
    }
    try {
      let torneios = await torneioService.buscarTorneiosDoUsuario(usuario);
      res.status(200).json(torneios);
    } catch (e) {
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

  async getResultadosTorneios(req: Request, res: Response): Promise<any> {
    try {
      const resultado = await torneioService.getResultadosTorneios();
      res.status(200).json(resultado);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }

  async getRanking(req: Request, res: Response): Promise<any> {
    try {
      const ranking = await torneioService.getRanking();
      res.status(200).json(ranking);
    } catch (e) {
      res.status(500).json({ error: e });
    }
  }

  // * Retorna partidas finalizadas do jogador logado para o relatório do dashboard
  async getPartidasDoJogador(req: Request, res: Response): Promise<any> {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ message: "Necessário estar logado" });
    }
    try {
      const partidas = await torneioService.getPartidasDoJogador(usuarioId);
      res.status(200).json(partidas);
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}

export default new TorneioController();
