import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import agendaController from "../controllers/agenda.controller";

const router = Router();

router.get(
  "/compromissos",
  authMiddleware.verificaAutenticacao,
  agendaController.listarMeusCompromissos,
);

router.get(
  "/notificacoes",
  authMiddleware.verificaAutenticacao,
  agendaController.listarMinhasNotificacoes,
);

router.put(
  "/notificacoes/:id/lida",
  authMiddleware.verificaAutenticacao,
  agendaController.marcarNotificacaoComoLida,
);

router.put(
  "/notificacoes/lidas",
  authMiddleware.verificaAutenticacao,
  agendaController.marcarTodasNotificacoesComoLidas,
);

module.exports = router;
