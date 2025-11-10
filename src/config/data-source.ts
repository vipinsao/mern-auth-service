import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entity/User.js";
import { Config } from "./index.js";
import { RefreshToken } from "../entity/RefreshToken.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST as string,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME as string,
  password: Config.DB_PASSWORD as string,
  database: Config.DB_NAME as string,

  //Dont use this in production - may lose data
  //always keep it false
  synchronize: false,
  entities: [User, RefreshToken],
  migrations: [],
  subscribers: [],
});
