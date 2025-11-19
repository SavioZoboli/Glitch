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


}

export default new TorneioController();