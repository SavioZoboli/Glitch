import { Router } from "express";
import equipeController from "../controllers/equipe.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post('/add',authMiddleware.verificaAutenticacao,equipeController.addEquipe)

router.post('/invite',authMiddleware.verificaAutenticacao,equipeController.inviteJogador)


module.exports = router