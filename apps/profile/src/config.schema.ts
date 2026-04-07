import * as Joi from 'joi';

export const ConfigSchemaValidation = Joi.object({
    ENV: Joi.string().default('DEV').required(),
    HTTP_PORT: Joi.number().default(7777).required(),
    TCP_PORT: Joi.number().default(7770).required(),

    AUTH_TCP_HOST: Joi.string().default('localhost').required(),
    AUTH_TCP_PORT: Joi.number().default(3001).required(),

    ASSET_TCP_HOST: Joi.string().default('localhost').required(),
    ASSET_TCP_PORT: Joi.number().default(4445).required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.string().default('5432').required(),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRE_IN: Joi.string().required(),
    REFRESH_JWT_SECRET: Joi.string().required(),
    REFRESH_JWT_EXPIRE_IN: Joi.string().required(),
    NEXT_APP_URL: Joi.string().required(),

    REDIS_HOST: Joi.string().default('localhost').required(),
    REDIS_PORT: Joi.number().default(6379).required(),
    REDIS_DB: Joi.number().default(0).required(),
    REDIS_PASSWORD: Joi.string().allow('', null).optional(),

    AI_CLASSIFIER_BASE_URL: Joi.string()
        .default('http://localhost:8000')
        .required(),
    AI_CLASSIFIER_TIMEOUT_MS: Joi.number().default(20000).required(),
    AI_CLASSIFIER_TOP_K: Joi.number().default(3).required(),
});
