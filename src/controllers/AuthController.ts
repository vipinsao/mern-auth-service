import fs from "fs";
import path from "path";
import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload, sign } from "jsonwebtoken";
import createHttpError from "http-errors";
import { Config } from "../config/index";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {
    this.userService = userService;
  }
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { firstName, lastName, email, password } = req.body;
    this.logger.debug("New Request to register a user", {
      firstName,
      lastName,
      email,
      password: "*********",
    });
    try {
      const savedUser = await this.userService.create({
        firstName,
        lastName,
        email,
        password,
      });
      this.logger.info("User has been registered", { userId: savedUser.id });

      let privateKey: Buffer;

      try {
        privateKey = fs.readFileSync(
          path.join(__dirname, "../../certs/private.pem"),
        );
      } catch (err) {
        const error = createHttpError(500, "Error while reading private key");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(savedUser.id),
        role: savedUser.role,
      };
      const accessToken = sign(payload, privateKey, {
        algorithm: "RS256",
        expiresIn: "1h",
        issuer: "auth-service",
      });
      const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
        algorithm: "HS256",
        expiresIn: "1y",
        issuer: "auth-service",
      });

      res.cookie("accessToken", accessToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60, //one hour
        httpOnly: true, //very important
      });

      res.cookie("refreshToken", refreshToken, {
        domain: "localhost",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 365, //one hour
        httpOnly: true, //very important
      });

      res.status(201).json({ userId: savedUser.id });
    } catch (err) {
      next(err);

      return;
    }
  }
}
