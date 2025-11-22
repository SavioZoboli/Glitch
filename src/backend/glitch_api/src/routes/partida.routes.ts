import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import partidaController from "../controllers/partida.controller";

const router = Router()


router.post('/computarMorte',authMiddleware.verificaAutenticacao,partidaController.computarMorte)

router.get("/logs/:partida",authMiddleware.verificaAutenticacao,partidaController.buscaLogs)

router.put("/alteraPontuacao",authMiddleware.verificaAutenticacao,partidaController.atualizaPontuacao)

router.put("/iniciarPartida",authMiddleware.verificaAutenticacao,partidaController.iniciarPartida)

router.put("/finalizarPartida",authMiddleware.verificaAutenticacao,partidaController.finalizarPartida)

router.put("/finalizarEtapa",authMiddleware.verificaAutenticacao,partidaController.finalizarEtapa)

module.exports = router;
