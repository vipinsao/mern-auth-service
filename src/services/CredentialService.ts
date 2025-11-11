import bcrypt from "bcrypt";

export class CredentialService {
  async comparePassword(userPassword: string, hashedpassword: string) {
    return await bcrypt.compare(userPassword, hashedpassword);
  }
}
