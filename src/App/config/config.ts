import dotenv from 'dotenv'
dotenv.config();

const config = {

    node_env : process.env.NODE_ENV,
    port : process.env.PORT,

    db_url : process.env.DB_URL,

    soltRound: process.env.SLTR,

    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_refresh_secret: process.env.JWT_REFRESH_REFRESH_SECRET,
    jwt_access_expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refresh_expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    
    reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,
}

export {config};

