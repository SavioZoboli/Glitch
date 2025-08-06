import { Router} from "express";
import usuarioController from "../controllers/usuario.controller";
import authMiddleware from "../middlewares/auth.middleware";

// Roteador
const router = Router();

// Adiciona o middleware para tratar as requisições
router.use(authMiddleware.verificaAutenticacao)

router.get('/usuarios',usuarioController.buscarTodos)

router.post('/add',usuarioController.add)

router.post('/login',usuarioController.login);

router.post('/alteraSenha',usuarioController.alteraSenha)

router.put('/update',usuarioController.update)

router.delete('/delete/:id',usuarioController.deleteUsuario) // o :id é o parâmetro

// Exporta o roteador
module.exports = router;