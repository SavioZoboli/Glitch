import Router, { Request, Response } from "express";

// * Índice de rotas, que irá redirecionar para cada rota específica


//Arquivos de roteamento
const usuarioRouter = require("./usuario.route");

// Roteador
const router = Router();

// Rota de testes só para verificar se a API está acessível
router.use("test", (req: Request, res: Response) => {
  res.status(200).json({ message: "Acessível" });
});


router.use("/usuario",usuarioRouter);


// Exporta o roteador para ser utilizado no servidor
export default router;
