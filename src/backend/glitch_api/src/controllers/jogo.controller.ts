import { Request, Response } from "express";
import jogoService from "../services/jogo.service";

export class JogoController{

    async getJogos(req:Request,res:Response){
        let jogos = await jogoService.getAllJogos()
        res.status(200).json(jogos)
    }

}

export default new JogoController();