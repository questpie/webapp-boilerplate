import { apiReact } from '@questpie/webapp/api/react'
import { env } from '@questpie/webapp/env'
import PusherJs from 'pusher-js'

export type PusherOverrides = {
  appKey?: string
  wsHost?: string
  wsPort?: number
  forceTLS?: boolean
}

export function createPusherInstance(overrides?: PusherOverrides) {
  return new PusherJs(overrides?.appKey || env.NEXT_PUBLIC_PUSHER_APP_KEY, {
    cluster: env.NEXT_PUBLIC_PUSHER_APP_CLUSTER,
    wsPort: env.NEXT_PUBLIC_PUSHER_PORT,
    wsHost: env.NEXT_PUBLIC_PUSHER_HOST,
    forceTLS: env.NEXT_PUBLIC_PUSHER_USE_TLS,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    userAuthentication: {
      customHandler: (params, cb) => {
        apiReact.auth.pusher.user
          .post({
            socketId: params.socketId,
          })
          .then((res) => {
            cb(null, res.data)
          })
          .catch((err) => {
            cb(err, null)
          })
      },
    },
    channelAuthorization: {
      customHandler: (params, cb) => {
        apiReact.auth.pusher.channel
          .post({
            socketId: params.socketId,
            channelName: params.channelName,
          })
          .then((res) => {
            cb(null, res.data)
          })
      },
    },
  })
}
