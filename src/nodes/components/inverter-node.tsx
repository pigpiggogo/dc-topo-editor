import type { NodeProps } from '@xyflow/react'
import { ArrowUp } from 'lucide-react'
import { GenericDeviceNode } from './generic-device-node'

export function InverterNode(props: NodeProps): JSX.Element {
  return (
    <GenericDeviceNode
      {...props}
      icon={ArrowUp}
      accentColor="#fef9c3"
      iconColor="#ca8a04"
      defaultLabel="逆变器"
    />
  )
}
