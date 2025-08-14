import bcrypt from "bcryptjs";

// * Classe com os métodos de criptografia de dados
class CriptoService {

  // Faz o hash da senha
  public async hashPassword(password: string): Promise<string> {
    // * Define quantos rounds de salt serão feitos
    const saltRounds = process.env.SALT_ROUNDS
      ? parseInt(process.env.SALT_ROUNDS)
      : 10;
    const salt = await bcrypt.genSalt(saltRounds); // * Gera o salt
    const hashedPassword = await bcrypt.hash(password, salt); // * Gera o hash
    return hashedPassword;
  }

  // * Verifica se a senha informada é igual ao hash
  public async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword); // * Retorna verdadeiro ou falso com base na comparação
  }
}

// * exporta a instância do serviço
export default new CriptoService();
