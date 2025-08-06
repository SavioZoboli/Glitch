import express, { Application,Request,Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.routes';

/* ### Configuração inicial ### */

//Carrega as variaveis do dotenv
dotenv.config();

//Cria a aplicação express
const app:Application = express();

/* ### Configurações e middlewares ### */

//Configuração do CORS
// ! Configuração vazia, para produção isso precisa ser mudado
app.use(cors());

//Configuração para uso do json
app.use(express.json());

/* ### Rotas ### */

//Rota de teste

app.get('/',(req:Request,res:Response)=>{
    res.status(200).json({message:"API está acessível!"})
})

// Redireciona para o index.routes.ts
app.use('/api',apiRoutes)

// Caso alguma coisa dê errado na requisição, retorna status 500
app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
    console.log(err.stack);
    res.status(500).send("Algo deu errado");
})

// Exporta o app
export default app;