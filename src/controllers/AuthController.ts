import type { NextFunction, Response } from "express";
import type { RegisterUserRequest } from "../types/index";
import { UserService } from "../services/UserService";
import { Logger } from "winston";

export class AuthController {
  constructor(
    private userService: UserService,
    private logger: Logger,
  ) {
    this.userService = userService;
  }
  async register(req: RegisterUserRequest, res: Response, next: NextFunction) {
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
