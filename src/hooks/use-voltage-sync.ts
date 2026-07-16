import { useEffect } from 'react'
import { useBoundStore } from '@/store'
import { eventBus } from '@/core/event-bus/event-bus'
import { getVoltageColor } from '@/constants/voltage-colors'

/**
 * Hook that synchronizes voltage-related property changes
 * to node data and updates voltage color indicators.
 */
export function useVoltageSync(): void {
  const setNodes = useBoundStore((state) => state.setNodes)

  useEffect(() => {
    const handler = (payload: {
      nodeId: string
      key: string
      value: unknown
    }): void => {
      const voltageKeys = [
        'ratedVoltage',
        'voltageLevel',
        'inputVoltage',
        'outputVoltage',
        'voc',
      ]

      if (!voltageKeys.includes(payload.key)) return

      setNodes((nds) => {
        const node = nds.find((n) => n.id === payload.nodeId)
        if (!node) return nds

        const voltage = payload.value as number
        const voltageColor = getVoltageColor(voltage)

        return nds.map((n) =>
          n.id === payload.nodeId
            ? {
                ...n,
                data: {
                  ...n.data,
                  [payload.key]: payload.value,
                  _voltageColor: voltageColor,
                },
              }
            : n,
        )
      })
    }

    eventBus.on('device.propertyChanged', handler)
    return () => {
      eventBus.off('device.propertyChanged', handler)
    }
  }, [setNodes])
}
