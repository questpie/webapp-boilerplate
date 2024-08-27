import { api } from '@questpie/api/index'
import { Elysia } from 'elysia'
import logixlysia from 'logixlysia'

/**
 * TODO: if you want to listen to the api from next.js,
 * you can import the server from index.ts and use it in next.js and delete this file after
 */
const app = new Elysia().use(api).listen(3000)

// biome-ignore lint/suspicious/noConsoleLog: <explanation>
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
