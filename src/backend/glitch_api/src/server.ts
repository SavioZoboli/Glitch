import app from "./app";
import { connectDB } from "./config/database.config";
import { Server as HTTPServer } from 'http';

// Variáveis de ambiente
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// Cria uma função para ordenar as inicializações e tratar erros
const startServer = async () => {
  // Primeiro ele aguarda a conexão com o banco de dados
  await connectDB();
  // só inicializa o servidor se o banco conectar
  const httpServer: HTTPServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode.`);
    console.log(`Access it at http://localhost:${PORT}`);
  });

}

// Executa a função de carregamento
startServer()
