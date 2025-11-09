import { Router } from "express";
import equipeController from "../controllers/equipe.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post('/add',authMiddleware.verificaAutenticacao,equipeController.addEquipe)

router.post('/invite',authMiddleware.verificaAutenticacao,equipeController.inviteJogador)

router.get('/equipes',authMiddleware.verificaAutenticacao,equipeController.getEquipes)

router.get('/equipe/:id',authMiddleware.verificaAutenticacao,equipeController.getEquipePorId)

router.get('/invites',authMiddleware.verificaAutenticacao,equipeController.getInvites)

router.put('/aceitarInvite',authMiddleware.verificaAutenticacao,equipeController.aceitarInvite)

router.put('/recusarInvite',authMiddleware.verificaAutenticacao,equipeController.recusarInvite)

router.put('/update',authMiddleware.verificaAutenticacao,equipeController.updateEquipe)

router.put('/updateMembro',authMiddleware.verificaAutenticacao,equipeController.updateMembro)

router.put('/removeMembro',authMiddleware.verificaAutenticacao,equipeController.removeMembro)

router.delete('/remove/:id',authMiddleware.verificaAutenticacao,equipeController.removeEquipe)

module.exports = router