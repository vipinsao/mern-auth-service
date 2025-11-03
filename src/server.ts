import { Config } from "./config/index.js";
import app from "./app.js";

const startServer = () => {
  const PORT = Config.PORT;
  try {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();
