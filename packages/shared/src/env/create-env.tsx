/**
 *  taken from https://github.com/jcwillox/typebox-x/blob/main/src/env/env.ts
 */
import { type MergedValueError, mergeErrors } from '@questpie/shared/error/typebox-errors'
import { type StaticDecode, type TSchema, TypeBoxError } from '@sinclair/typebox'
import type { ValueError } from '@sinclair/typebox/errors'
import { TransformDecodeCheckError, Value } from '@sinclair/typebox/value'

const RED = '\x1b[31m'
const RESET = '\x1b[0m'
const YELLOW = '\x1b[33m'
const CYAN = '\x1b[36m'
const GREEN = '\x1b[32m'

const formatError = (e: MergedValueError) =>
  `  - ${GREEN}${e.path.slice(1)}${RESET}: ${YELLOW}${e.value}${RESET}, ${CYAN}` +
  `${e.errors.map((x) => x.message).join(`${RESET}, ${CYAN}`)}${RESET}`

export class TypeBoxDecodeEnvError extends TypeBoxError {
  readonly error: ValueError
  constructor(message: string, error: ValueError) {
    super(message)
    this.error = error
  }
}

/**
 * Create an object from environment variables.
 *
 * Function will clean, convert, default and decode the environment variables.
 *
 * Pulls the values from `process.env` by default.
 *
 * @example
 * const env = createEnv(
 *   t.Object({
 *     APP_ENV: t.Optional(t.String()),
 *     NODE_ENV: t.String({ default: "development" }),
 *     BOOL_FLAG: t.Boolean(),
 *   }),
 * );
 */
export function createEnv<T extends TSchema>(
  schema: T,
  env: Record<string, string | undefined> = Bun.env
): StaticDecode<T> {
  let value = Value.Clean(schema, { ...env })
  value = Value.Convert(schema, value)
  value = Value.Default(schema, value)
  try {
    return Value.Decode(schema, value)
  } catch (err) {
    if (err instanceof TransformDecodeCheckError) {
      console.error(
        `${RED}Configuration is not valid:${RESET}\n${mergeErrors(Value.Errors(schema, value))
          .map((x) => formatError(x))
          .join('\n')}\n`
      )
      throw new TypeBoxDecodeEnvError(err.message, err.error)
    }
    throw err
  }
}
