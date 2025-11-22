import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import torneioController from "../controllers/torneio.controller";

const router = Router()

router.post("/adicionar",authMiddleware.verificaAutenticacao,torneioController.addTorneio)

router.get('/torneios',authMiddleware.verificaAutenticacao,torneioController.getAllTorneios)

router.delete('/remove/:id',authMiddleware.verificaAutenticacao,torneioController.deleteTorneio)

router.get('/torneio/:id',authMiddleware.verificaAutenticacao,torneioController.getTorneioById)

router.put('/update',authMiddleware.verificaAutenticacao,torneioController.updateTorneio)

router.post('/ingressar',authMiddleware.verificaAutenticacao,torneioController.ingressarEmTorneio)

router.get('/partidas/:torneio',authMiddleware.verificaAutenticacao,torneioController.getPartidasDoTorneio)

router.post('/gerarPartidas',authMiddleware.verificaAutenticacao,torneioController.gerarPartidas)

router.get('/partida/:id',authMiddleware.verificaAutenticacao,torneioController.getPartidaById)

router.put('/finalizarTorneio',authMiddleware.verificaAutenticacao,torneioController.finalizarTorneio)
module.exports = router;