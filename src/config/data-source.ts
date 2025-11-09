import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User.js";
import { Config } from "./index.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST as string,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME as string,
  password: Config.DB_PASSWORD as string,
  database: Config.DB_NAME as string,

  //Dont use this in production - may lose data
  synchronize: Config.NODE_ENV === "test" || Config.NODE_ENV === "dev",
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
