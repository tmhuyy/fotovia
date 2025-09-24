import * as Joi from 'joi';

export const ConfigSchemaValidation = Joi.object({
  ENV: Joi.string().default('DEV').required(),
  PORT: Joi.number().default(3000).required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.string().default('542').required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRE_IN: Joi.string().required(),
  REFRESH_JWT_SECRET: Joi.string().required(),
  REFRESH_JWT_EXPIRE_IN: Joi.string().required(),
});
