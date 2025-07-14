import app from './app';
import { connectDB } from './App/config/databas';
import { config } from './App/config/config'

const PORT = config.port;
connectDB();

//server
app.listen(PORT, () => {
    console.log(`Server is listening at: http://localhost:${PORT}`);
})