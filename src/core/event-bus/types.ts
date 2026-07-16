import type { EventPayloadMap } from '../../types/index.ts'

export type EventHandler<T extends keyof EventPayloadMap> = (payload: EventPayloadMap[T]) => void

export type WildcardEventHandler = (type: string | number | symbol, payload: unknown) => void

export type AnyEventHandler = WildcardEventHandler | EventHandler<keyof EventPayloadMap>

export type Unsubscribe = () => void
