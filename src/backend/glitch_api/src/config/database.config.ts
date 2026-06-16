import { Sequelize } from "sequelize";
require('dotenv').config();

// * Busca as configurações do arquivo de variáveis de ambiente (.env)
const db_name = process.env.DB_NAME as string;
const db_host = process.env.DB_HOST as string;
const db_port = process.env.DB_PORT?parseInt(process.env.DB_PORT):5432;
const db_user = process.env.DB_USER as string;
const db_pass = process.env.DB_PASS as string;
const dialect = process.env.DB_DIALECT || 'postgres';

// * Exporta uma instância da classe Sequelize com a configuração
export const sequelize = new Sequelize(db_name,db_user,db_pass,{
    host:db_host,
    port:db_port,
    dialect:dialect as any,
    logging:false,
    dialectOptions:{}
})

const sync = async()=>{
    try{
        await sequelize.sync({alter:true});
        console.log("[SEQUELIZE] Sincronizado")
        return true;
    }catch(e){
        console.error("[SEQUELIZE] Erro ao sincronizar.")
        console.error(e);
    }
}

// * Função assíncrona de conexão com o banco de dados.
export const connectDB = async()=>{
    try{
        await sequelize.authenticate();
        console.log("[SEQUELIZE] Conectado");
        await sync();
    }catch(error){
        console.log("[SEQUELIZE] Não foi possível conectar ao banco de dados",error);
        process.exit(1);
    }
}


