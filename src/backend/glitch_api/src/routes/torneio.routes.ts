import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import torneioController from "../controllers/torneio.controller";

const router = Router()

router.post("/adicionar",authMiddleware.verificaAutenticacao,torneioController.addTorneio)

router.get('/torneios',authMiddleware.verificaAutenticacao,torneioController.getAllTorneios)

module.exports = router;