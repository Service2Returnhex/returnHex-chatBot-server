import dotenv from "dotenv";
dotenv.config();
// 
import app from './app';
import { config } from './App/config/config';
import { connectDB } from './App/config/databas';

const PORT = config.port;
connectDB();


//server
app.listen(PORT, () => {
    console.log(`Server is listening at: http://localhost:${PORT}`);
})