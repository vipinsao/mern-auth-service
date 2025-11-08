import { config } from "dotenv";

config({ debug: false });

const { PORT, NODE_ENV } = process.env;

export const Config = {
  PORT,
  NODE_ENV,
};
