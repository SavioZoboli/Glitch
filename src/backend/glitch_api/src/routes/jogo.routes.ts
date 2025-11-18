import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import jogoController from "../controllers/jogo.controller";

const router = Router()

router.use('/jogos',authMiddleware.verificaAutenticacao,jogoController.getJogos)

module.exports = router;