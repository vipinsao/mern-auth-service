import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

//this is necessary to get __dirname in ES module scope
//in commonjs __dirname is available by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({
  path: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
  debug: false,
});

const { PORT, NODE_ENV, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME } =
  process.env;

export const Config = {
  PORT,
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
};
