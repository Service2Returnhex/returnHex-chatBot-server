import app from "./app";
import { config } from "./App/config/config";
import { connectDB } from "./App/config/databas";

const PORT = config.port;

async function start() {
  await connectDB();
  const PORT = process.env.PORT || 3002;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});
