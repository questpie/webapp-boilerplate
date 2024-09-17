import { envApi } from '@questpie/api/env'
import { DriveManager } from 'flydrive'
import { FSDriver } from 'flydrive/drivers/fs'
import { S3Driver } from 'flydrive/drivers/s3'

export const drive = new DriveManager({
  /**
   * Name of the default service. It must be defined inside
   * the service object
   */
  default: envApi.DEFAULT_DRIVER,

  /**
   * A collection of services you plan to use in your application
   */
  services: {
    fs: () => {
      return new FSDriver({
        location: new URL('./uploads', import.meta.url),
        visibility: 'public',
      })
    },
    s3: () => {
      return new S3Driver({
        credentials: {
          accessKeyId: envApi.S3_ACCESS_KEY,
          secretAccessKey: envApi.S3_SECRET_KEY,
        },
        region: envApi.S3_REGION,
        bucket: envApi.S3_BUCKET,
        visibility: 'public',
      })
    },
  },
})
