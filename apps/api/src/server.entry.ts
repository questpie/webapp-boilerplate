import { api } from '@questpie/api/index'
import { Elysia } from 'elysia'

/**
 * TODO: if you want to listen to the api from next.js,
 * you can import the server from index.ts and use it in next.js and delete this file after
 */
new Elysia().use(api).listen(3000)

// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log(`🦊 Elyria is running at ${api.server?.hostname}:${api.server?.port}`)
