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

    DATABASE_URL: Type.String(),

    JWT_SECRET: Type.String(),
    JWT_EXPIRES_IN: Type.String(),

    S3_ENDPOINT: Type.String(),
    S3_PORT: StringInt(),
    S3_SSL: StringBoolean({ default: true }),
    S3_BUCKET: Type.String(),
    S3_ACCESS_KEY: Type.String(),
    S3_SECRET_KEY: Type.String(),
  }),
  Bun.env
)
