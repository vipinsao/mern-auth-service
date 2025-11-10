import request from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/entity/User.js";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import { truncateTables } from "../utils/index.js";
import { describe, it, expect } from "@jest/globals";
import { Roles } from "../../src/constants/index.js";

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
        password: "secret",
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
        password: "secret",
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
        password: "secret",
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
        password: "secret",
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
        password: "secret",
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
        password: "secret",
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
        password: "secret",
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
  });

  describe("Fileds are missing", () => {
    it("should return 400 status code if email field is missing", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "",
        password: "secret",
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
    it("should trim the email field", async () => {
      //AAA
      //Arrange
      const userData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: " vipinsao3@gmail.com ",
        password: "secret",
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
  });
});
