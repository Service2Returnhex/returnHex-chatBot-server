import dotenv from 'dotenv'
dotenv.config();

const config = {

    node_env : process.env.NODE_ENV,
    port : process.env.PORT,
    db_url : process.env.DB_URL,
}

export {config};

