import type { NodeProps } from '@xyflow/react'
import { ArrowDown } from 'lucide-react'
import { GenericDeviceNode } from './generic-device-node'

export function RectifierNode(props: NodeProps): JSX.Element {
  return (
    <GenericDeviceNode
      {...props}
      icon={ArrowDown}
      accentColor="#fef9c3"
      iconColor="#ca8a04"
      defaultLabel="整流器"
    />
  )
}
