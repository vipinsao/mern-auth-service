import request from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/entity/User.js";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import { isJwt } from "../utils/index.js";
import { describe, it, expect } from "@jest/globals";
import { Roles } from "../../src/constants/index.js";
import { RefreshToken } from "../../src/entity/RefreshToken.js";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  //very important to clean db before each test
  beforeEach(async () => {
    //previosuly used //Database truncate

    // await truncateTables(connection);

    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return the 201 status code", async () => {
      //AAA Pattern
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.statusCode).toBe(201);
    });

    it("should return valid json", async () => {
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      const response = await request(app).post("/auth/register").send(userData);

      expect(response.headers["content-type"]).toContain("json");
    });

    it("should persist the user in the database", async () => {
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      //Act
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(1);
      expect(users[0].firstName).toBe(userData.firstName);
      expect(users[0].lastName).toBe(userData.lastName);
      expect(users[0].email).toBe(userData.email);
    });

    it("should return an userId of the present User", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.body).toHaveProperty("userId");
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect((response.body as Record<string, string>).userId).toBe(
        users[0].id,
      );
    });

    it("should assign a customer role", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0]).toHaveProperty("role");
      expect(users[0].role).toBe(Roles.CUSTOMER);
    });

    it("should store the hashed password in the database", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users[0].password).not.toBe(userData.password);
      expect(users[0].password).toHaveLength(60);
      expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
    });

    it("should return 400 status code if email is already exists", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
        role: Roles.CUSTOMER,
      };
      const userRepository = connection.getRepository(User);
      await userRepository.save(userData);

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const users = await userRepository.find();
      expect(response.statusCode).toBe(400);
      expect(users).toHaveLength(1);
    });

    it("should return the access token and refresh token inside a cookie", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert

      //adding interface

      let accessToken = null;
      let refreshToken = null;
      const rawCookie = response.headers["set-cookie"];
      const cookies: string[] = Array.isArray(rawCookie)
        ? rawCookie
        : rawCookie
          ? [rawCookie]
          : [];

      cookies.forEach((cookie) => {
        if (cookie.startsWith("accessToken")) {
          accessToken = cookie.split(";")[0].split("=")[1];
        }

        if (cookie.startsWith("refreshToken")) {
          refreshToken = cookie.split(";")[0].split("=")[1];
        }
      });
      expect(accessToken).not.toBeNull;
      expect(refreshToken).not.toBeNull;

      expect(isJwt(accessToken)).toBeTruthy();
      expect(isJwt(refreshToken)).toBeTruthy();
    });

    it("should store the refresh token in the database", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const refreshTokenRepo = connection.getRepository(RefreshToken);
      // const refreshTokens = await refreshTokenRepo.find();
      // expect(refreshTokens).toHaveLength(1);

      const tokens = await refreshTokenRepo
        .createQueryBuilder("refreshToken")
        .where("refreshToken.userId= :userId", {
          userId: (response.body as Record<string, string>).userId,
        })
        .getMany();

      expect(tokens).toHaveLength(1);
    });
  });

  describe("Fileds are missing", () => {
    it("should return 400 status code if email field is missing", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "",
        password: "secret123",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();

      expect(users).toHaveLength(0);
    });

    it("should return 400 status code if firstName is missing", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "",
        lastName: "Sao",
        email: " vipinsao3@gmail.com ",
        password: "secret123",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 status code if lastName is missing", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "",
        email: " vipinsao3@gmail.com ",
        password: "secret123",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 status code if password is missing", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });
  });

  describe("Fields are not in proper format", () => {
    //we are checking for sanitization of email
    //sanization mean cleaning/transforming input into a safe or
    //normalized from before saving or using it.
    it("should trim the email field", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: " vipinsao3@gmail.com ",
        password: "secret123",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      const user = users[0];
      expect(user.email).toBe("vipinsao3@gmail.com");
    });

    it("should return 400 status code if email is not a valid email", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3",
        password: "secret123",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it("should return 400 status code if password is less than 8 characters", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3",
        password: "pass",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      expect(response.statusCode).toBe(400);
      //Assert
      const userRepository = connection.getRepository(User);
      const users = await userRepository.find();
      expect(users).toHaveLength(0);
    });

    it("should return array of error messages if email is missing", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3",
        password: "pass",
        role: Roles.CUSTOMER,
      };

      //ACT
      const response = await request(app).post("/auth/register").send(userData);

      //Assert
      expect(response.body).toHaveProperty("errors");
      expect(
        (response.body as Record<string, string>).errors.length,
      ).toBeGreaterThan(0);
    });
  });
});
