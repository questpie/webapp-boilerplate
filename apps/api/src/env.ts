import { createEnv } from '@questpie/shared/env/create-env'
import { Type, type StringOptions } from '@sinclair/typebox'

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

    // if no s3 needed, remove this
    S3_ENDPOINT: Type.String(),
    S3_PORT: StringInt(),
    S3_SSL: StringBoolean({ default: true }),
    S3_BUCKET: Type.String(),
    S3_ACCESS_KEY: Type.String(),
    S3_SECRET_KEY: Type.String(),

    //if no redis needed, remove this
    REDIS_URL: Type.String(),

    // Pusher/Soketi -> if no ws needed, remove this
    PUSHER_APP_ID: Type.String(),
    PUSHER_KEY: Type.String(),
    PUSHER_SECRET: Type.String(),
    PUSHER_HOST: Type.String(),
    PUSHER_PORT: StringInt(),
    PUSHER_USE_TLS: StringBoolean({ default: false }),
  }),
  Bun.env
)
