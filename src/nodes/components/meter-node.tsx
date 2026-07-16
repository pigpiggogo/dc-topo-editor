import type { NodeProps } from '@xyflow/react'
import { Gauge } from 'lucide-react'
import { GenericDeviceNode } from './generic-device-node'

export function MeterNode(props: NodeProps): JSX.Element {
  return (
    <GenericDeviceNode
      {...props}
      icon={Gauge}
      accentColor="#f3e8ff"
      iconColor="#9333ea"
      defaultLabel="智能电表"
    />
  )
}
