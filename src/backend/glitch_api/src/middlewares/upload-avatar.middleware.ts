import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

const multer = require("multer");

const DIRETORIO_AVATARES = path.resolve(process.cwd(), "uploads", "avatars");
const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"]);
const TAMANHO_MAXIMO_BYTES = 2 * 1024 * 1024;

if (!fs.existsSync(DIRETORIO_AVATARES)) {
  fs.mkdirSync(DIRETORIO_AVATARES, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: Request, _file: any, cb: any) => {
    cb(null, DIRETORIO_AVATARES);
  },
  filename: (_req: Request, file: any, cb: any) => {
    const ext = path.extname(file?.originalname ?? "").toLowerCase();
    const nomeArquivo = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext || ".jpg"}`;
    cb(null, nomeArquivo);
  },
});

const uploader = multer({
  storage,
  limits: { fileSize: TAMANHO_MAXIMO_BYTES },
  fileFilter: (_req: Request, file: any, cb: any) => {
    if (TIPOS_PERMITIDOS.has(file?.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Formato de imagem inválido. Use JPG, PNG ou WEBP."));
  },
}).single("avatar");

const uploadAvatarMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  uploader(req, res, (err: any) => {
    if (!err) {
      next();
      return;
    }

    if (err?.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "Avatar deve ter no máximo 2MB." });
      return;
    }

    res.status(400).json({
      message: err?.message || "Erro ao enviar avatar.",
    });
  });
};

export default uploadAvatarMiddleware;

