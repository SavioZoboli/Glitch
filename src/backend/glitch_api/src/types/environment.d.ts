export {};

declare global {
    namespace NodeJs{
        // Declara os tipos de dados das variáveis de ambiente
        interface ProcessEnv{
            PORT?:string;
            NODE_ENV?:'development'|'production'|'test';
            DB_NAME?:string;
            DB_PORT?:string;
            DB_HOST?:string;
            DB_USER?:string;
            DB_PASS?:string;
            USER_DEFAULT_PASSWORD:string;
            SALT_ROUNDS:number
        }
    }
}