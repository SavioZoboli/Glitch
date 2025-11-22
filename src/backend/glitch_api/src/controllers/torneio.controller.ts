import { Request, Response } from "express";
import torneioService, { TorneioService } from "../services/torneio.service";

export class TorneioController {

    async addTorneio(req: Request, res: Response): Promise<any> {
        let dados = req.body;
        console.log('Dados recebidos', dados)
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
                if (status == 200) {
                    res.status(201).json({ message: 'Criado' })
                } else {
                    res.status(500).json({ message: 'Erro no servidor' })
                }
            } catch (e) {
                res.status(500).json({ message: "Erro interno" })
            }
        } else {
            res.status(400).json({ message: "Informações faltantes" })
        }


    }

    async getAllTorneios(req: Request, res: Response): Promise<any> {
        try {
            let torneios = await torneioService.getAllTorneios()
            res.status(200).json(torneios)
        } catch (e) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    async deleteTorneio(req: Request, res: Response): Promise<any> {
        let id = req.params.id;
        if (!id) {
            res.status(400).json({ message: 'Codigo faltante' })
            return;
        }
        try {
            let status = await torneioService.removeTorneio(id);
            switch (status) {
                case 200:
                    res.status(200).json({ message: 'removido' })
                    break;
                case 404:
                    res.status(404).json({ message: 'Não encontrado' })
                    break;
            }

        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Erro interno do servidor" })
        }
    }

    async getTorneioById(req: Request, res: Response): Promise<any> {
        let id = req.params.id;
        if (!id) {
            res.status(400).json({ message: 'Dados incompletos' })
            return;
        }

        try {
            let torneio = await torneioService.getTorneioById(id);
            res.status(200).json(torneio)
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: 'Erro do servidor' })
        }
    }

    async updateTorneio(req: Request, res: Response): Promise<any> {
        let dados = req.body;
        if (!dados.id || !dados.nome || !dados.dt_inicio || !dados.inscricao.max_participantes || !dados.inscricao.dt_fim || !dados.inscricao.modo_inscricao) {
            res.status(400).json({ message: "Dados faltando" })
            return;
        }
        try {
            await torneioService.updateTorneio(dados)
            res.status(200).json({ message: 'Ok' })
        } catch (e) {
            console.log(e)
            res.status(500).json({ message: "Erro interno do servidor" })
        }
    }

    async ingressarEmTorneio(req:Request,res:Response):Promise<any>{
        let torneio = req.body.torneio
        let usuario = req.body.usuario
        if(!torneio || !usuario){
            res.status(400).json({message:'Dados faltando'})
            return;
        }
        try{
            let status = await torneioService.ingressarEmTorneio(torneio,usuario);

            switch (status) {
                case 200:
                    res.status(200).json({ message: 'removido' })
                    break;
                case 400:
                    res.status(400).json({ message: 'Limite atingido' })
                    break;
                case 404:
                    res.status(404).json({ message: 'Não encontrado' })
                    break;
            }


        }catch(e){
            console.log(e)
            res.status(500).json({message:'Erro interno do servidor'})
        }
    }

    async getPartidasDoTorneio(req:Request,res:Response){
        let torneio = req.params.torneio
        if(!torneio){
            res.status(400).json({message:"Necessário informar o torneio"})
            return;
        }
        try{
            let partidas = await torneioService.getPartidasTorneio(torneio);
            res.status(200).json(partidas)
        }catch(e){
            console.log(e)
            res.status(500).json({message:"Erro interno do servidor"})
        }
    }

    async gerarPartidas(req:Request,res:Response){
        let torneio = req.body.torneio;
        if(!torneio){
            res.status(400).json({message:"Necessário informar a partida"})
            return;
        }
        try{

            let status = await torneioService.gerarPartidas(torneio);

            switch (status) {
                case 200:
                    res.status(200).json({ message: 'Gerado' })
                    break;
                case 404:
                    res.status(404).json({ message: 'Não encontrado' })
                    break;
            }

        }catch(e){
            console.log(e)
            res.status(500).json({message:'Erro ao gerar partidas'})
        }
    }

    async getPartidaById(req:Request,res:Response):Promise<any>{
        let partida_id = req.params.id;
        if(!partida_id){
            res.status(400).json({message:"Necessário informar a partida"})
            return;
        }

        try{
            let partida = await torneioService.getPartidaTorneio(partida_id)
            res.status(200).json(partida)
        }catch(e){
            console.log(e)
            res.status(500).json({message:"Erro interno do servidor"})
        }
    }

    async finalizarTorneio(req:Request,res:Response):Promise<any>{
        let torneio = req.body.torneio;
        if(!torneio){
            res.status(400).json({message:"Dados faltando"})
            return;
        }

        try{
            await torneioService.finalizarTorneio(torneio)
            res.status(200).json({message:"ok"})
        }catch(e){
            console.log(e)
            res.status(500).json({message:"Erro interno do servidor"})
        }
    }


}

export default new TorneioController();