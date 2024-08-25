import { createEnv } from '@questpie/shared/env/create-env'
import { Type, type StringOptions, type TransformOptions } from '@sinclair/typebox'

const StringInt = (opts: StringOptions = {}) =>
  Type.Transform(Type.String(opts))
    .Decode((v) => Number.parseInt(v, 10))
    .Encode(String)
const StringBoolean = (opts: StringOptions = {}) =>
  Type.Transform(Type.String(opts))
    .Decode((v) => v === 'true')
    .Encode(String)

export const env = createEnv(
  Type.Object({
    PORT: StringInt({ default: 3000 }),

    // database
    DATABASE_URL: Type.String(),

    S3_ENDPOINT: Type.String(),
    S3_PORT: StringInt(),
    S3_SSL: StringBoolean({ default: true }),
    S3_BUCKET: Type.String(),
    S3_ACCESS_KEY: Type.String(),
    S3_SECRET_KEY: Type.String(),

    // redis
    REDIS_HOST: Type.String(),
    REDIS_PORT: StringInt({ default: 6379 }),
    REDIS_PASSWORD: Type.Optional(Type.String()),
    REDIS_DB: Type.Optional(StringInt({ default: 0 })),
  }),
  Bun.env
)
