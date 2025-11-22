## Esse arquivo tem como objetivo definir um passo a passo para execução do projeto

### Front-end

**Você precisará ter o NodeJS e o Angular/CLI instalado em seu computador**

- Abra o diretório glitch_frontend no prompt de comando
- Digite o comando `npm install` para instalação das dependências
- Digite o comando: `npm start` ou `ng serve` para inicializar o projeto


### Back-end

**Você precisará ter o NodeJS instalado em seu computador**

- Na pasta raiz do projeto (glitch_backend) crie um arquivo denominado `.env`
- Insira nele os dados conforme informado abaixo, alterando os dados para o seu caso
- Abra o diretório glitch_backend no prompt de comando
- Digite o comando `npm install` para instalação das dependências
- Digite o comando `npm run dev` para inicializar o backend em modo desenvolvimento

### Banco de dados

**Você precisará do Docker ou Postgres instalado no seu computador**
**Recomendado Docker**

- (apenas docker) Execute no prompt de comando o comando para criação do container do Postgres:
`docker run --name postgres-glitch -e POSTGRES_PASSWORD={sua senha} -d -p 5432:5432 -v postgres-glitch:/dados postgres`

- Aguarde o container ser criado
- Entre no SGBD e conecte no banco de dados
- Utilize o comando `create database db_glitch` e execute-o para criar o banco de dados
- Abra o diretório glitch_backend no prompt de comando
- Execute o comando `npx sequelize-cli db:migrate`
- Aguarde a criação das tabelas
- \#\# Em desenvolvimento \#\# Executar o comando de seed para os dados iniciais do sistema

  ### Estrutura do arquivo .env

PORT=<porta>
NODE_ENV=<ambiente_do_banco>
DB_NAME=<nome_do_banco>
DB_PORT=<porta_do_banco>
DB_HOST=<host_do_banco>
DB_USER=<usuario_do_banco>
DB_PASS=<senha_do_banco>
JWT_SECRET=<frase_aleatoria_JWT>
JWT_EXPIRATION=<string_expiracao_token>
SALT_ROUNDS=<numero_rounds_salt>
  
