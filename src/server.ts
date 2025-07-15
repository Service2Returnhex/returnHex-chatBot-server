import app from "./app";
import { config } from "./App/config/config";
import { connectDB } from "./App/config/databas";

const PORT = config.port;
connectDB();

//server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server is listening at: http://localhost:${PORT}`);
});
