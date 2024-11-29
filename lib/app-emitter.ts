import { Site } from '@penxio/types'
import mitt from 'mitt'

export type AppEvent = {
  SITE_UPDATED: Site
}

export const appEmitter = mitt<AppEvent>()
