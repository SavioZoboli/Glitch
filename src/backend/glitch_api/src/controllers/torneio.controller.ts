import { Request, Response } from "express";
import torneioService, { TorneioService } from "../services/torneio.service";

export class TorneioController {

    async addTorneio(req: Request, res: Response): Promise<any> {
        let dados = req.body;
        console.log('Dados recebidos',dados)
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
                let status = await torneioService.addTorneio(dados);
                if(status == 200){
                    res.status(201).json({message:'Criado'})
                }else{
                    res.status(500).json({message:'Erro no servidor'})
                }
            } catch (e) {
                res.status(500).json({message:"Erro interno"})
            }
        } else {
            res.status(400).json({ message: "Informações faltantes" })
        }


    }

    async getAllTorneios(req:Request,res:Response):Promise<any>{
        try{
            let torneios = await torneioService.getAllTorneios()
            res.status(200).json(torneios)
        }catch(e){
            res.status(500).json({message:'Erro interno do servidor'})
        }
    }


}

export default new TorneioController();