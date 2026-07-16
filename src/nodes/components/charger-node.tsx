import type { NodeProps } from '@xyflow/react'
import { EvCharger } from 'lucide-react'
import { GenericDeviceNode } from './generic-device-node'

export function ChargerNode(props: NodeProps): JSX.Element {
  return (
    <GenericDeviceNode
      {...props}
      icon={EvCharger}
      accentColor="#fee2e2"
      iconColor="#dc2626"
      defaultLabel="充电桩"
    />
  )
}
