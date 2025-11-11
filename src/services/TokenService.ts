import jwt, { JwtPayload } from "jsonwebtoken";
import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import { Config } from "../config/index.js";
import { User } from "../entity/User.js";
import { RefreshToken } from "../entity/RefreshToken.js";
import { Repository } from "typeorm";
import { fileURLToPath } from "url";

const { sign } = jwt;

// ✅ Recreate __dirname safely for ESM modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Safe resolver that works in dev + test
function resolvePrivateKeyPath(): string {
  // Allow override through env variable
  const envPath = process.env.PRIVATE_KEY_PATH || "certs/private.pem";
  return path.resolve(process.cwd(), envPath);
}

export class TokenService {
  constructor(private refreshTokenRepository: Repository<RefreshToken>) {}
  generateAccessToken(payload: JwtPayload) {
    let privateKey: Buffer;

    try {
      // privateKey = fs.readFileSync(
      //   path.join(__dirname, "../../certs/private.pem"),
      // );

      // ✅ Always resolve from project root
      const privateKeyPath = resolvePrivateKeyPath();
      privateKey = fs.readFileSync(privateKeyPath);
    } catch (err) {
      console.error("❌ Failed to read private key:", err);
      const error = createHttpError(500, "Error while reading private key");
      throw error;
    }
    const accessToken = sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "1h",
      issuer: "auth-service",
    });
    return accessToken;
  }

  generateRefreshToken(payload: JwtPayload) {
    const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
      algorithm: "HS256",
      expiresIn: "1y",
      issuer: "auth-service",
      jwtid: String(payload.id),
    });
    return refreshToken;
  }

  async persistRefreshToken(user: User) {
    const MS_IN_YEAR = 1000 * (60 * 60 * 24 * 365); //1year->(leap year)
    // const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
    const newRefreshToken = await this.refreshTokenRepository.save({
      user: user,
      userId: user.id,
      expiresAt: new Date(Date.now() + MS_IN_YEAR),
    });
    return newRefreshToken;
  }
}
