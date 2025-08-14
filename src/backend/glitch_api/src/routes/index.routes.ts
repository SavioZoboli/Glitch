import Router, { Request, Response } from "express";

// * Índice de rotas, que irá redirecionar para cada rota específica


//Arquivos de roteamento
const bancadaRouter = require("./bancada.route");
const filialRouter = require("./filial.route");
const usuarioRouter = require("./usuario.route");
const tipoRouter = require("./tipo.route")

// Roteador
const router = Router();

// Rota de testes só para verificar se a API está acessível
router.use("test", (req: Request, res: Response) => {
  res.status(200).json({ message: "Acessível" });
});

router.use("/bancada", bancadaRouter);

router.use("/filial", filialRouter);

router.use("/usuario",usuarioRouter);

router.use("/tipo",tipoRouter)

// Exporta o roteador para ser utilizado no servidor
export default router;
