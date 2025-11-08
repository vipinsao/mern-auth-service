import request from "supertest";
import app from "../../src/app";
import { describe, it, expect } from "@jest/globals";

describe("POST /auth/register", () => {
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
    });
  });
});
