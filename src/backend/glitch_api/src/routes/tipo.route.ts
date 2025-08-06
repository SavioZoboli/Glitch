import { Router } from "express";
import tipoUsuarioController from "../controllers/tipoUsuario.controller";
import authMiddleware from "../middlewares/auth.middleware";

// Roteador
const router = Router();


// Rota do tipo get para buscar os tipos de usuário
// Rota inteira é /api/tipo/usuario
router.get("/usuario",authMiddleware.verificaAutenticacao,tipoUsuarioController.buscarTodos)

// Exporta o roteador para ser usado no index.routes
module.exports = router;