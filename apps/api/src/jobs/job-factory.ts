import { redisManager } from '@quesspie/api/redis/redis-clients'
import { JobFactory } from '@questpie/jobs/job-factory'

export const jobFactory = new JobFactory(redisManager.get('queue'), { verbose: true })
