import { createEnv } from '@questpie/shared/env/create-env'
import { StringBoolean, StringInt } from '@questpie/shared/schemas/misc'
import { Type } from '@sinclair/typebox'

export const env = createEnv(
  Type.Object({
    NODE_ENV: Type.Union(
      [Type.Literal('production'), Type.Literal('development'), Type.Literal('test')],
      {
        default: 'development',
      }
    ),

    // server
    NEXT_PUBLIC_API_URL: Type.String(),

    // pusher
    NEXT_PUBLIC_PUSHER_APP_KEY: Type.String(),
    NEXT_PUBLIC_PUSHER_APP_CLUSTER: Type.String({ default: '' }), // if you are using soketi the cluster is just for pusher-js satisfaction
    NEXT_PUBLIC_PUSHER_HOST: Type.Optional(Type.String()), // if you are using soketi
    NEXT_PUBLIC_PUSHER_PORT: Type.Optional(StringInt()), // if you are using soketi
    NEXT_PUBLIC_PUSHER_USE_TLS: Type.Optional(StringBoolean({ default: false })),
  }),
  Bun.env
)
