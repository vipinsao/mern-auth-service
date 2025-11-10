import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index";
import { UserService } from "../services/UserService";
import { Logger } from "winston";
import { validationResult } from "express-validator";
import { error } from "console";

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
      res.status(201).json({ userId: savedUser.id });
    } catch (err) {
      next(err);

      return;
    }
  }
}
