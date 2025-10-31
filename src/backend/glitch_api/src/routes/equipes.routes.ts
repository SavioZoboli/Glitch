import { Router } from "express";
import equipeController from "../controllers/equipe.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post('/add',authMiddleware.verificaAutenticacao,equipeController.addEquipe)

router.post('/invite',authMiddleware.verificaAutenticacao,equipeController.inviteJogador)

router.get('/equipes',authMiddleware.verificaAutenticacao,equipeController.getEquipes)


router.get('/invites',authMiddleware.verificaAutenticacao,equipeController.getInvites)

router.put('/aceitarInvite',authMiddleware.verificaAutenticacao,equipeController.aceitarInvite)

router.put('/recusarInvite',authMiddleware.verificaAutenticacao,equipeController.recusarInvite)

module.exports = router