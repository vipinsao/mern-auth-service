import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";

import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entity/RefreshToken";
import { TokenService } from "../services/TokenService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
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

      const payload: JwtPayload = {
        sub: String(savedUser.id),
        role: savedUser.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      //persist the refreshToken
      const MS_IN_YEAR = 1000 * (60 * 60 * 24 * 365); //1year->(leap year)
      const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
      const newRefreshToken = await refreshTokenRepository.save({
        user: savedUser,
        userId: savedUser.id,
        expiresAt: new Date(Date.now() + MS_IN_YEAR),
      });

      const refreshToken = this.tokenService.generateRefreshToken({
        ...payload,
        id: String(newRefreshToken.id),
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
