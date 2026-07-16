import mitt from 'mitt'
import type { EventName, EventPayloadMap } from '../../types/index.ts'
import type { EventHandler, Unsubscribe, WildcardEventHandler } from './types.ts'

export function createEventBus(): {
  on<T extends EventName>(type: T, handler: EventHandler<T>): Unsubscribe
  on(type: '*', handler: WildcardEventHandler): Unsubscribe
  once<T extends EventName>(type: T, handler: EventHandler<T>): Unsubscribe
  once(type: '*', handler: WildcardEventHandler): Unsubscribe
  off<T extends EventName>(type: T, handler: EventHandler<T>): void
  off(type: '*', handler: WildcardEventHandler): void
  emit<T extends EventName>(type: T, payload: EventPayloadMap[T]): void
  getEventNames(): EventName[]
  getListenerCount<T extends EventName>(type: T): number
} {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emitter = mitt<any>()

  return {
    on<T extends EventName>(
      type: T | '*',
      handler: EventHandler<T> | WildcardEventHandler,
    ): Unsubscribe {
      if (type === '*') {
        emitter.on('*', handler as WildcardEventHandler)
        return () => {
          emitter.off('*', handler as WildcardEventHandler)
        }
      }
      emitter.on(type, handler as EventHandler<T>)
      return () => {
        emitter.off(type, handler as EventHandler<T>)
      }
    },

    once<T extends EventName>(
      type: T | '*',
      handler: EventHandler<T> | WildcardEventHandler,
    ): Unsubscribe {
      const wrapper = (payload: EventPayloadMap[T]): void => {
        if (type === '*') {
          ;(handler as WildcardEventHandler)(type, payload)
        } else {
          ;(handler as EventHandler<T>)(payload)
        }
        unsubscribe()
      }

      const unsubscribe = this.on(type as T, wrapper as EventHandler<T> & WildcardEventHandler)
      return unsubscribe
    },

    off<T extends EventName>(type: T | '*', handler: EventHandler<T> | WildcardEventHandler): void {
      if (type === '*') {
        emitter.off('*', handler as WildcardEventHandler)
      } else {
        emitter.off(type, handler as EventHandler<T>)
      }
    },

    emit<T extends EventName>(type: T, payload: EventPayloadMap[T]): void {
      emitter.emit(type, payload)
    },

    getEventNames(): EventName[] {
      const keys = emitter.all.keys()
      return Array.from(keys).filter((k): k is EventName => k !== '*')
    },

    getListenerCount<T extends EventName>(type: T): number {
      const handlers = emitter.all.get(type)
      return handlers ? handlers.length : 0
    },
  }
}

export const eventBus = createEventBus()
