import { Router} from "express";
import usuarioController from "../controllers/usuario.controller";
import authMiddleware from "../middlewares/auth.middleware";

// Roteador
const router = Router();

// Adiciona o middleware para tratar as requisições

router.get('/usuarios',usuarioController.buscarTodos)

router.post('/add',usuarioController.add)

router.post('/login',usuarioController.login);

router.post('/alteraSenha',usuarioController.alteraSenha)

router.put('/update',authMiddleware.verificaAutenticacao,usuarioController.update)

router.delete('/delete/:id',authMiddleware.verificaAutenticacao,usuarioController.deleteUsuario) // o :id é o parâmetro

router.get('/eu',authMiddleware.verificaAutenticacao,usuarioController.meusDados)

router.get('/dadosUpdate',authMiddleware.verificaAutenticacao,usuarioController.buscaDadosUpdate); // Só pode fazer o update do proprio usuario

// Exporta o roteador
module.exports = router;