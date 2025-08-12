import dotenv from 'dotenv'
dotenv.config();

const config = {

    node_env : process.env.NODE_ENV,
    port : process.env.PORT,

    db_url : process.env.DB_URL,


    openai_api_key: process.env.OPENAI_API_KEY,
    gemini_api_key: process.env.GEMINI_API_KEY,
    deepseek_api_key: process.env.DEEPSEEK_API_KEY,
    grook_api_key: process.env.GROOK_API_KEY,
    groq_api_key: process.env.GROQ_API_KEY,
    open_router_api_key: process.env.OPEN_ROUTER_API_KEY,

    bcrypt_salt_round: process.env.BCRYPT_SALT_ROUND,

    jwt_access_secret: process.env.JWT_ACCESS_SECRET,
    jwt_refres_secret: process.env.JWT_REFRESS_SECRET,
    jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    jwt_refres_expires_in: process.env.JWT_ACCESS_refresh_IN,

    reset_pass_ui_link: process.env.RESET_PASS_UI_LINK,

    smtp_auth_use: process.env.SMTP_AUTH_USER,
    smtp_auth_pass: process.env.SMTP_AUTH_PASS
}

export {config};

