import { Request, Response } from "express";
import equipeService from "../services/equipe.service";

class EquipeController {
    public async addEquipe(req:Request,res:Response):Promise<any>{
        if(!req.usuario){
            res.status(401).json({message:"Não autorizado"})
            return;
        }
        if(!req.body.nome){
            res.status(400).json({message:"Faltam informações"})
            return;
        }
        let nome = req.body.nome;
        try{
            let equipe = await equipeService.addEquipe(nome,req.usuario.id);
            
            res.status(201).json({message:'Criado',equipe:equipe.dataValues.id})
        }catch(e){
            res.status(500).json({message:"Erro interno do servidor"})
            console.log(e)
        }
    }

    public async inviteJogador(req:Request,res:Response):Promise<any>{
        let equipe:string = req.body.equipe
        let jogador:string = req.body.nickname
        if(!equipe || !jogador){
            res.status(400).json({message:'Requisição mal formada'})
            return;
        }
        try{
            await equipeService.convidarJogador(equipe,jogador);
            res.status(200).json({message:"Jogador convidado"})
        }catch(e){
            res.status(500).json({message:"Erro ao convidar"})
        }
    }

    public async getEquipes(req:Request,res:Response):Promise<any>{
        if(!req.usuario){
            res.status(401).json({message:'Não autorizado'})
            return;
        }
        try{
            let equipes = await equipeService.getEquipes()
            res.status(200).json(equipes)
        }catch(e){
            res.status(500).json({message:'Erro interno do servidor'})
        }
    }




}

export default new EquipeController();