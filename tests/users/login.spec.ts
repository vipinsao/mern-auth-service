import request from "supertest";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";

import app from "../../src/app.js";

describe("POST /auth/login", () => {
  let connection: DataSource;

  beforeAll(async () => {
    connection = await AppDataSource.initialize();
  });

  //before running any test always clean the db first

  beforeEach(async () => {
    await connection.dropDatabase();
    await connection.synchronize();
  });

  afterAll(async () => {
    await connection.destroy();
  });

  describe("Given all fields", () => {
    it("should return the 201 status code", async () => {
      //before testing login things
      //we know that everytime test runs
      //so we automatically clean the database
      //so how would any user will be present there,
      //thats why make sure we register on user before hand

      const registerData = {
        firstName: "Vipin",
        lastName: "Sao",
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      //Act
      await request(app).post("/auth/register").send(registerData);

      //AAA
      //Arrange
      const userData = {
        email: "vipinsao3@gmail.com",
        password: "secret123",
      };

      //Act
      const response = await request(app).post("/auth/login").send(userData);

      //Assert
      expect(response.statusCode).toBe(201);
      //   expect(response.body).toHaveProperty()
    });
  });
});
