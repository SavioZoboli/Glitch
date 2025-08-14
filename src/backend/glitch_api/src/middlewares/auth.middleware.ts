import { NextFunction, Request,Response } from "express";
import { PayloadUsuario } from "../services/auth.service";
import authService from "../services/auth.service";

// * Adiciona o usuário como payload nos tipos do TypeScript, desse jeito é possível chamar req.usuario nos controllers
declare module "express" {
  export interface Request {
    usuario?: PayloadUsuario;
  }
}

// * Middleware que cuida da verificação dos tokens
class AuthMiddleware {

  // * Método de verificação dos tokens
  public async verificaAutenticacao(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> {
    // ! Essa parte será alterada para receber a autorização por cookie httponly
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Token não fornecido ou formato inválido" });
    }

    const token = header.split(" ")[1];

    // ! Fim da parte a ser alterada
    try {
      // * Busca o usuário decodificado do token, caso o usuário for validado
      // * Caso não for validado, irá usar throws para erro
      const decodedUser: PayloadUsuario = authService.validarToken(token);
      // * Adiciona o usuário para ser usado pelos controllers
      req.usuario = decodedUser;
      // * Permite a continuação da execução
      next();
    } catch (error: any) {
      if (error.message === "Token expirado.") {
        return res.status(401).json({ message: "Token expirado." });
      }
      if (error.message === "Token inválido.") {
        return res.status(401).json({ message: "Token inválido." });
      }
      if (error.message === "Chave secreta JWT não definida.") {
        // Erro interno do servidor, chave não configurada
        return res
          .status(500)
          .json({
            message: "Erro de configuração do servidor (JWT_SECRET ausente).",
          });
      }
      // Outros erros inesperados
      console.error("Erro inesperado no AuthMiddleware:", error);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  }
}

// * Exporta a instância da classe para ser usada
export default new AuthMiddleware();
