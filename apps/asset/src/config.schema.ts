import * as Joi from 'joi';

export const ConfigSchemaValidation = Joi.object({
    ENV: Joi.string().default('DEV').required(),
    HTTP_PORT: Joi.number().default(4444).required(),
    TCP_PORT: Joi.number().default(4445).required(),
    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.string().default('5432').required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRE_IN: Joi.string().required(),
    REFRESH_JWT_SECRET: Joi.string().required(),
    REFRESH_JWT_EXPIRE_IN: Joi.string().required(),
    AUTH_TCP_PORT: Joi.string().required(),
    AUTH_TCP_HOST: Joi.string().required(),
    // Supabase config
    SUPABASE_URL: Joi.string().uri().required(),
    SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

    STORAGE_AVATARS_BUCKET: Joi.string().default('avatars-public').required(),
    STORAGE_PORTFOLIO_BUCKET: Joi.string()
        .default('portfolio-public')
        .required(),
    STORAGE_PRIVATE_BUCKET: Joi.string().default('private-assets').required(),

    ASSET_SIGNED_READ_URL_EXPIRES_IN: Joi.number().default(3600).required(),
    ASSET_SIGNED_UPLOAD_URL_EXPIRES_IN: Joi.number().default(7200).required(),

    NEXT_APP_URL: Joi.string().required(),
});
