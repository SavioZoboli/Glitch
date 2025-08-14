const dotenv = require('dotenv')
const jwt = require('jsonwebtoken');

// * Adiciona as variáveis de ambiente
dotenv.config();

// * Armazena em uma variável os dados para serem usados
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h'; // Caso não ache um horário para expirar, usa 1h

// * Define o formado do payload do usuário
export interface PayloadUsuario{
    id:string;
    nome:string;
    email:string;
    tipo:string;
}

// * Classe que terá os métodos de autenticação
// ? Mudar para cá a função de login
class AuthService{

    // * Função que gera um token
    public geraToken(usuario: PayloadUsuario,expiration:string|null = null): string {
        if(!JWT_SECRET) {
          // ! Se não tiver definido o Secret, não pode continuar
            throw new Error('Chave secreta não definida');
        }
        // A função pode definir uma data de expiração para o token, caso não for definida, usa a da variavel de ambiente
        if(!expiration){
          expiration = JWT_EXPIRATION;
        }
        // * Retorna o token
        return jwt.sign(usuario, JWT_SECRET,{expiresIn: JWT_EXPIRATION});
    }


    public validarToken(token: string): PayloadUsuario {
    if (!JWT_SECRET) {
      // ! Só consegue validar a chave se ela for definida no ambiente
      throw new Error('Chave secreta JWT não definida.');
    }

    try {
      // * Decodifica o token e gera o payload do usuário
      const decoded = jwt.verify(token, JWT_SECRET) as PayloadUsuario;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        // ! Se o token estiver expirado, manda um erro
        throw new Error('Token expirado.');
      }
      throw new Error('Token inválido.');
    }
  }


}

// * Exporta a instância do serviço de autenticação
export default new AuthService();