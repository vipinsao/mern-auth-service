import request from "supertest";
import app from "../../src/app.js";
import { User } from "../../src/entity/User.js";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source.js";
import { truncateTables } from "../utils/index.js";
import { describe, it, expect } from "@jest/globals";

describe("POST /auth/register", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  //very important to clean db before each test
  beforeEach(async () => {
    //Database truncate
    await truncateTables(connection);
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
  });
});
