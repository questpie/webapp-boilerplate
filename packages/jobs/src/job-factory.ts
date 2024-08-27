import type { Static, TSchema } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'
import {
  Queue,
  Worker,
  type BulkJobOptions,
  type ConnectionOptions,
  type Job,
  type JobsOptions,
  type QueueOptions,
  type WorkerOptions,
} from 'bullmq'

export type BaseJobOptions<T extends TSchema> = {
  name: string
  schema?: T
  run: (job: Job<Static<T>>) => Promise<any>
  onCompleted?: (job: Job<Static<T>>) => Promise<any>
  onFailed?: (job?: Job<Static<T>>, err?: Error) => Promise<any>
  onProgress?: (job: Job<Static<T>>) => Promise<any>
  onActive?: (job: Job<Static<T>>) => Promise<any>
  onStalled?: (jobId: string) => Promise<any>
  workerOptions?: Omit<WorkerOptions, 'connection' | 'prefix'>
  queueOptions?: Omit<QueueOptions, 'connection' | 'prefix'>
}

type JobFactoryOptions = {
  debug?: boolean
}

export class JobFactory {
  constructor(
    private readonly connection: ConnectionOptions,
    private readonly options: JobFactoryOptions = {}
  ) {}

  private debug(message: string) {
    if (this.options.debug) {
      // biome-ignore lint/suspicious/noConsoleLog: <explanation>
      console.log(message)
    }
  }

  createJob<T extends TSchema>(options: BaseJobOptions<T>) {
    const _scopedGlobal = global as any

    let worker: Worker | null = null

    const createWorker = () => {
      worker = new Worker(
        options.name,
        async (job) => {
          this.debug(`[${job.name}]: Processing job ${job.id}`)

          if (options.schema) {
            this.debug(`[${job.name}]: Validating job ${job.id}`)
            try {
              job.data = Value.Check(options.schema, job.data)
                ? job.data
                : Value.Cast(options.schema, job.data)
            } catch (err) {
              console.error(err)
              throw err
            }
          }

          try {
            this.debug(`Running job ${job.id}`)
            await options.run(job)
          } catch (err) {
            this.debug(
              `[${job.name}]: Job ${job.id} failed ${'message' in (err as any) ? (err as any).message : ''}`
            )

            throw err
          }

          this.debug(`[${job.name}]: Job ${job.id} completed`)
        },
        {
          ...options.workerOptions,
          prefix: 'bull',
          connection: this.connection,
        }
      )

      if (options.onProgress) worker.on('progress', options.onProgress)
      if (options.onFailed) worker.on('failed', options.onFailed)
      if (options.onCompleted) worker.on('completed', options.onCompleted)
      if (options.onActive) worker.on('active', options.onActive)
      if (options.onStalled) worker.on('stalled', (jobId) => options.onStalled?.(jobId))
    }

    const registerWorker = () => {
      /**
       * This makes sure HMR works in development
       */

      if (process.env.NODE_ENV === 'production') {
        createWorker()
        return
      }
      const key = `worker_${options.name}`

      if (_scopedGlobal[key]) return _scopedGlobal[key]
      // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
      return (_scopedGlobal[key] = createWorker())
    }

    const createQueue = () => {
      return new Queue(options.name, {
        ...options.queueOptions,
        connection: this.connection,
        prefix: 'bull',
      })
    }

    /**
     * This makes sure HMR works in development
     */
    let queue: Queue
    if (process.env.NODE_ENV === 'production') {
      queue = createQueue()
    } else {
      const key = `queue_${options.name}`

      if (_scopedGlobal[key]) {
        queue = _scopedGlobal[key]
      } else {
        queue = createQueue()
        _scopedGlobal[key] = queue
      }
    }

    const invoke = async (data: Static<T>, opts: JobsOptions = {}) => {
      if (options.schema) {
        if (!Value.Check(options.schema, data)) {
          throw new Error('Invalid job data')
        }
      }

      await queue.add(options.name, data, opts)
    }

    const invokeBulk = async (jobs: { data: Static<T>; opts?: BulkJobOptions }[]) => {
      const payload: Parameters<typeof queue.addBulk>[0] = jobs.map((j) => {
        if (options.schema) {
          if (!Value.Check(options.schema, j.data)) {
            throw new Error('Invalid job data')
          }
        }

        return { name: options.name, data: j.data, opts: j.opts }
      })

      await queue.addBulk(payload)
    }

    const removeAll = async () => {
      await queue.obliterate({ force: true })
    }

    const remove = async (jobId: string) => {
      await queue.remove(jobId)
    }

    const shutdown = async () => {
      if (worker) {
        await worker.close()
      }
      await queue.close()
    }

    return {
      registerWorker,
      invoke,
      invokeBulk,
      removeAll,
      remove,
      shutdown,
      _queue: queue,
    }
  }
}
