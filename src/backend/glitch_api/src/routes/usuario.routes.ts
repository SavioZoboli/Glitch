import { Router} from "express";
import usuarioController from "../controllers/usuario.controller";
import authMiddleware from "../middlewares/auth.middleware";

// Roteador
const router = Router();

router.get('/usuarios', usuarioController.buscarTodos)

router.get('/resumo', authMiddleware.verificaAutenticacao, usuarioController.buscarResumo)

router.post('/add', usuarioController.add)

router.post('/login', usuarioController.login);

router.post('/alteraSenha', usuarioController.alteraSenha)

router.put('/update', authMiddleware.verificaAutenticacao, usuarioController.update)

router.delete('/delete', authMiddleware.verificaAutenticacao, usuarioController.deleteUsuario)

router.get('/eu', authMiddleware.verificaAutenticacao, usuarioController.meusDados)

router.get('/dadosUpdate', authMiddleware.verificaAutenticacao, usuarioController.buscaDadosUpdate)

// * Nova rota: retorna todos os dados do painel do jogador
router.get('/dashboard', authMiddleware.verificaAutenticacao, usuarioController.getDashboard)

// Exporta o roteador
module.exports = router;