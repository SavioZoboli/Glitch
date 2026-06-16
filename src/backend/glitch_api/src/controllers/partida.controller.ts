import { Request, Response } from "express";
import partidaService from "../services/partida.service";

export class PartidaController{

    async computarMorte(req:Request,res:Response){
        let vitima = req.body.vitima;
        let culpado = req.body.culpado;
        let partida = req.body.partida

        if(!vitima || !culpado || !partida){
            res.status(400).json({message:"Dados faltando"})
            return;
        }

        try{
            let log = await partidaService.registraLog(vitima,culpado,partida,'kill','Situação normal')
            res.status(200).json(log)
        }catch(e){
            console.log(e)
            res.status(500).json({message:"Erro interno do servidor"})
        }
    }

    async buscaLogs(req:Request,res:Response){
        let partida = req.params.partida;

        if(!partida){
            res.status(400).json({message:"Dados faltando"})
            return;
        }

        try{
            let logs = await partidaService.buscaLogs(partida)
            res.status(200).json(logs)
        }catch(e){  
            console.log(e)
            res.status(500).json({message:"Erro interno do servidor"})
        }
    }


    async atualizaPontuacao(req:Request,res:Response){
        let jogador = req.body.jogador
        let chave = req.body.chave
        let novaPontuacao = req.body.novaPontuacao
        if(!jogador || !chave || !novaPontuacao){
            res.status(400).json({message:"Dados faltando"})
            return;
        }

        try{
            let chaveamento = await partidaService.alteraPontuacao(jogador,chave,novaPontuacao)
            res.status(200).json(chaveamento)
        }catch(e){
            res.status(500).json({message:"Erro ao salvar pontuação"})
        }
    }

    async iniciarPartida(req:Request,res:Response){
        let partida = req.body.partida;

        if(!partida){
            res.status(400).json({message:"Necessário informar a partida"})
            return;
        }

        try{
            let atualizado = await partidaService.iniciarPartida(partida);
            res.status(200).json(atualizado)
        }catch(e){
            console.log(e)
            res.status(500).json({message:'Erro ao iniciar a partida'})
        }
    }


    async finalizarPartida(req:Request,res:Response):Promise<any>{
        let etapa = req.body.etapa;
        let partida = req.body.partida;
        let chave = req.body.chaveamento;
        let vencedor = req.body.vencedor;
        if(!etapa || !partida || !chave || !vencedor){
            res.status(400).json({message:"Dados faltando"})
            return;
        }

        try{
            await partidaService.finalizarPartida(etapa,partida,chave,vencedor);
            res.status(200).json({message:'ok'})
        }catch(e){
            const message = e instanceof Error ? e.message : 'Erro interno do servidor';
            const normalized = message
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase();

            if (
              normalized.includes('dados nao encontrados') ||
              normalized.includes('vencedor nao esta na lista') ||
              normalized.includes('quantidade impar')
            ) {
              res.status(400).json({ message });
              return;
            }

            res.status(500).json({message})
        }
    }

    async finalizarEtapa(req:Request,res:Response){
        let etapa = req.body.etapa;
        if(!etapa){
            res.status(400).json({message:'Faltam dados'})
            return;
        }
        try{
            const resultado = await partidaService.finalizaEtapa(etapa)
            res.status(200).json({message:'ok', resultado})
        }catch(e){
            console.log(e)
            const message = e instanceof Error ? e.message : 'Erro interno no servidor';
            const normalized = message
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase();

            if (
              normalized.includes('etapa nao encontrada') ||
              normalized.includes('sem vencedores') ||
              normalized.includes('quantidade impar')
            ) {
              res.status(400).json({ message });
              return;
            }

            res.status(500).json({message})
        }
    }




}

export default new PartidaController();
