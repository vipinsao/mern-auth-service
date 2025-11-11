import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { JwtPayload } from "jsonwebtoken";
import { TokenService } from "../services/TokenService";
import createHttpError from "http-errors";
import { CredentialService } from "../services/CredentialService";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
    private tokenService: TokenService,
    private credentialService: CredentialService,
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
      const newRefreshToken =
        await this.tokenService.persistRefreshToken(savedUser);

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

  async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }
    const { email, password } = req.body;
    this.logger.debug("New Request to login a user", {
      email,
      password: "*********",
    });

    //Check if email exits in database
    //compare password
    //generate tokens
    //add tokens to cookies
    //return the response

    try {
      const savedUser = await this.userService.findByEmail(email);

      if (!savedUser) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      const passwordMatch = this.credentialService.comparePassword(
        password,
        savedUser.password,
      );

      if (!passwordMatch) {
        const error = createHttpError(400, "Email or password does not match");
        next(error);
        return;
      }

      const payload: JwtPayload = {
        sub: String(savedUser.id),
        role: savedUser.role,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);

      //persist the refreshToken
      const newRefreshToken =
        await this.tokenService.persistRefreshToken(savedUser);

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

      this.logger.info("User has been logged in :)", { userId: savedUser.id });
      res.status(201).json({ userId: savedUser.id });
    } catch (err) {
      next(err);

      return;
    }
  }
}
