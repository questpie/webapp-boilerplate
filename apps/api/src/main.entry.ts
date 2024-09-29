import { runBootstrapSeeders } from '@questpie/api/db/seed'
import { envApi } from '@questpie/api/env'
import { bootApi } from '@questpie/api/server.entry'
import { bootWorker } from '@questpie/api/worker.entry'

async function run() {
  if (envApi.RUN_BOOTSTRAP_SEEDERS) {
    await runBootstrapSeeders()
  }

  switch (envApi.RUNTIME_MODE) {
    case 'all':
      await bootApi()
      await bootWorker()
      break
    case 'api':
      await bootApi()
      break
    case 'worker':
      await bootWorker()
      break
    default:
      throw new Error('Invalid runtime mode, pick one of "all", "api" or "worker"')
  }
}
run()
