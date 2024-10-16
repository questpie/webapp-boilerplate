import Elysia from 'elysia'
import { HttpError } from 'elysia-http-error'

export const httpError = () =>
  new Elysia({ name: 'elysia-http-error' })
    .error({
      ELYSIA_HTTP_ERROR: HttpError,
    })
    .onError({ as: 'global' }, ({ code, error, set }) => {
      if (code === 'ELYSIA_HTTP_ERROR') {
        set.status = error.statusCode
        return {
          error: true,
          code: error.statusCode,
          message: error.message,
          data: error.errorData,
        }
      }
    })
