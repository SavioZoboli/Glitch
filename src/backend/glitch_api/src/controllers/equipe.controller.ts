import { Request, Response } from "express";
import equipeService from "../services/equipe.service";

class EquipeController {
    public async addEquipe(req: Request, res: Response): Promise<any> {
        if (!req.usuario) {
            res.status(401).json({ message: "Não autorizado" })
            return;
        }
        if (!req.body.nome) {
            res.status(400).json({ message: "Faltam informações" })
            return;
        }
        let nome = req.body.nome;
        try {
            let equipe = await equipeService.addEquipe(nome, req.usuario.id);

            res.status(201).json({ message: 'Criado', equipe: equipe.dataValues.id })
        } catch (e) {
            res.status(500).json({ message: "Erro interno do servidor" })
            console.log(e)
        }
    }

    public async inviteJogador(req: Request, res: Response): Promise<any> {
        let equipe: string = req.body.equipe
        let jogador: string = req.body.nickname
        if (!equipe || !jogador) {
            res.status(400).json({ message: 'Requisição mal formada' })
            return;
        }
        try {
            await equipeService.convidarJogador(equipe, jogador);
            res.status(200).json({ message: "Jogador convidado" })
        } catch (e) {
            res.status(500).json({ message: "Erro ao convidar" })
        }
    }

    public async getEquipes(req: Request, res: Response): Promise<any> {
        if (!req.usuario) {
            res.status(401).json({ message: 'Não autorizado' })
            return;
        }
        try {
            let equipes = await equipeService.getEquipes()
            res.status(200).json(equipes)
        } catch (e) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    public async getEquipePorId(req: Request, res: Response): Promise<any> {
        let id = req.params.id;
        if (!id) {
            res.status(400).json({ message: 'Necessário informar o ID' })
            return;
        }
        try {
            let equipe = await equipeService.getEquipePorId(id);
            res.status(200).json(equipe)
        } catch (e) {
            res.status(500).json({ messge: 'Erro do servidor', error: e })
        }
    }

    public async getInvites(req: Request, res: Response) {
        if (!req.usuario) {
            res.status(401).json({ message: 'Não autorizado' })
            return;
        }
        try {
            let invites = await equipeService.getInvites(req.usuario.id)
            res.status(200).json(invites)
        } catch (e) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    public async aceitarInvite(req: Request, res: Response): Promise<any> {
        if (!req.usuario) {
            res.status(401).json({ message: 'Não autorizado' })
            return;
        }
        let usuario = req.usuario.id
        let equipe = req.body.equipe;
        if (!equipe) {
            res.status(400).json({ message: 'Necessário resposta e equipe' })
            return;
        }
        try {
            await equipeService.answerInvite(usuario, equipe, true)
            res.status(200).json({ message: 'OK' })
        } catch (e) {
            res.status(500).json({ message: 'Erro do servidor' })
        }
    }

    public async recusarInvite(req: Request, res: Response): Promise<any> {
        if (!req.usuario) {
            res.status(401).json({ message: 'Não autorizado' })
            return;
        }
        let usuario = req.usuario.id
        let equipe = req.body.equipe;
        if (!equipe) {
            res.status(400).json({ message: 'Necessário resposta e equipe' })
            return;
        }
        try {
            await equipeService.answerInvite(usuario, equipe, false)
            res.status(200).json({ message: 'OK' })
        } catch (e) {
            res.status(500).json({ message: 'Erro do servidor' })
        }
    }

    public async updateEquipe(req: Request, res: Response): Promise<any> {
        const id = req.body.id;
        const novo_nome = req.body.novoNome
        if (!id || !novo_nome) {
            res.status(400).json({ message: 'Dados incompletos' })
            return;
        }
        try {
            switch (await equipeService.updateEquipe(id, novo_nome)) {
                case '200':
                    res.status(200).json({ message: 'Ok' })
                    break;
                case '404':
                    res.status(404).json({ message: 'Não encontrado' })
                    break;
                case '400':
                    res.status(400).json({ message: 'Nome já utilizado' })
            }
        } catch (e) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    public async removeEquipe(req: Request, res: Response): Promise<any> {
        const id = req.params.id
        if (!id) {
            res.status(400).json({ message: 'Dados incompletos' })
            return;
        }
        try {
            await equipeService.removeEquipe(id)
            res.status(200).json({ message: 'Ok' })

        } catch (e) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    public async updateMembro(req: Request, res: Response): Promise<any> {
        const membro = req.body.membro;
        const equipe = req.body.equipe;
        if (!membro.nickname || !equipe) {
            res.status(400).json({ message: 'Dados incompletos' })
            return;
        }
        try {

            switch (await equipeService.updateMembro(membro,equipe)) {
                case '200':
                    res.status(200).json({ message: 'Ok' })
                    break;
                case '404':
                    res.status(404).json({ message: 'Não encontrado' })
                    break;
            }
        } catch (e) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }

    public async removeMembro(req: Request, res: Response): Promise<any> {
        const membro = req.body.membro;
        const equipe = req.body.equipe;
        if (!membro.nickname || !equipe) {
            res.status(400).json({ message: 'Dados incompletos' })
            return;
        }
        try {
            await equipeService.removeMembro(membro,equipe)
            res.status(200).json({ message: 'Ok' })

        } catch (e) {
            res.status(500).json({ message: 'Erro interno do servidor' })
        }
    }




}

export default new EquipeController();