import { envApi } from '@questpie/api/env'
import { bootApi } from '@questpie/api/server.entry'
import { bootWorker } from '@questpie/api/worker.entry'

await function run() {
  switch (envApi.RUNTIME_MODE) {
    case 'all':
      bootApi()
      bootWorker()
      break
    case 'api':
      bootApi()
      break
    case 'worker':
      bootWorker()
      break
    default:
      throw new Error('Invalid runtime mode, pick one of "all", "api" or "worker"')
  }
}
