import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import torneioController from "../controllers/torneio.controller";

const router = Router()

router.post("/adicionar", authMiddleware.verificaAutenticacao, torneioController.addTorneio)

router.get('/torneios', torneioController.getAllTorneios)
router.get('/torneios/em-andamento', authMiddleware.verificaAutenticacao, torneioController.getTorneiosEmAndamento)
router.get('/torneios/proximos', authMiddleware.verificaAutenticacao, torneioController.getProximosTorneios)

router.delete('/remove/:id', authMiddleware.verificaAutenticacao, torneioController.deleteTorneio)

router.get('/torneio/:id', authMiddleware.verificaAutenticacao, torneioController.getTorneioById)

router.put('/update', authMiddleware.verificaAutenticacao, torneioController.updateTorneio)

router.post('/ingressar/individual',authMiddleware.verificaAutenticacao,torneioController.ingressarEmTorneioIndividual)

router.post('/ingressar/equipe',authMiddleware.verificaAutenticacao,torneioController.ingressarEmTorneioEquipe)
router.post('/agenda/espectador', authMiddleware.verificaAutenticacao, torneioController.adicionarTorneioAgendaEspectador)

router.get('/partidas/:torneio', authMiddleware.verificaAutenticacao, torneioController.getPartidasDoTorneio)

router.post('/gerarPartidas', authMiddleware.verificaAutenticacao, torneioController.gerarPartidas)

router.get('/partida/:id', authMiddleware.verificaAutenticacao, torneioController.getPartidaById)

router.put('/finalizarTorneio', authMiddleware.verificaAutenticacao, torneioController.finalizarTorneio)

router.get('/torneiosDoUsuario', authMiddleware.verificaAutenticacao, torneioController.buscarTorneiosDoUsuario)

router.get('/resultados', torneioController.getResultadosTorneios)

router.get('/ranking', torneioController.getRanking)

// * Nova rota: retorna partidas finalizadas do jogador para o relatório do dashboard
router.get('/partidas-jogador', authMiddleware.verificaAutenticacao, torneioController.getPartidasDoJogador)
router.get('/partidas-jogador/:usuarioId', authMiddleware.verificaAutenticacao, torneioController.getPartidasDoJogadorPorUsuarioId)

module.exports = router;
