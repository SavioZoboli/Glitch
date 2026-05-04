import { Request, Response } from "express";
import jogoService from "../services/jogo.service";

export class JogoController {
  async getJogos(req: Request, res: Response) {
    try {
      let jogos = await jogoService.getAllJogos();
      res.status(200).json(jogos);
    } catch (e) {
      res.status(500).json({ message: "Erro interno do servidor" });
      console.log(e);
    }
  }
}

export default new JogoController();
