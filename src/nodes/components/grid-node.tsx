import type { NodeProps } from '@xyflow/react'
import { Building2 } from 'lucide-react'
import { GenericDeviceNode } from './generic-device-node'

export function GridNode(props: NodeProps): JSX.Element {
  return (
    <GenericDeviceNode
      {...props}
      icon={Building2}
      accentColor="#dcfce7"
      iconColor="#16a34a"
      defaultLabel="市电接入"
    />
  )
}
