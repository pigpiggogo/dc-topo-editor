import type { Node, Edge } from '@xyflow/react'
import type { ValidationIssue, PortDefinition } from '@/types'
import { pluginManager } from '@/engine/plugin-instance'

function getNodePorts(node: Node): PortDefinition[] {
  const data = node.data as Record<string, unknown> | undefined
  const ports = data?.ports as PortDefinition[] | undefined
  if (ports && ports.length > 0) return ports

  const plugin = pluginManager.getPlugin(node.type ?? '')
  if (plugin) {
    return plugin.getPorts()
  }
  return []
}

function getNodeVoltage(node: Node, deviceData: Map<string, Record<string, unknown>>): number {
  const data = deviceData.get(node.id)
  if (data && typeof data.ratedVoltage === 'number') {
    return data.ratedVoltage
  }
  const nodeData = node.data as Record<string, unknown> | undefined
  const nodeVoltage = nodeData?.ratedVoltage as number | undefined
  return nodeVoltage ?? 0
}

function getNodeName(node: Node): string {
  const nodeData = node.data as Record<string, unknown> | undefined
  const name = nodeData?.name as string | undefined
  return name ?? node.id
}

export interface ValidationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: 'error' | 'warning' | 'info'
  validate(
    nodes: Node[],
    edges: Edge[],
    deviceData: Map<string, Record<string, unknown>>,
  ): ValidationIssue[]
}

export function createUnconnectedPortsRule(): ValidationRule {
  return {
    id: 'unconnected-ports',
    name: '未连接端口检测',
    description: '检测设备上未连接的端口',
    enabled: true,
    severity: 'warning',
    validate(nodes, edges) {
      const issues: ValidationIssue[] = []
      for (const node of nodes) {
        const ports = getNodePorts(node)
        const nodeName = getNodeName(node)
        for (const port of ports) {
          const connected = edges.some(
            (e) =>
              (e.source === node.id && e.sourceHandle === port.id) ||
              (e.target === node.id && e.targetHandle === port.id),
          )
          if (!connected) {
            issues.push({
              id: `unconnected-${node.id}-${port.id}`,
              type: 'warning',
              message: `设备 "${nodeName}" 的端口 "${port.id}" 未连接`,
              nodeId: node.id,
            })
          }
        }
      }
      return issues
    },
  }
}

export function createLoopDetectionRule(): ValidationRule {
  return {
    id: 'loop-detection',
    name: '环路检测',
    description: '检测拓扑中是否存在环路',
    enabled: true,
    severity: 'error',
    validate(nodes, edges) {
      const issues: ValidationIssue[] = []
      const adj = new Map<string, Set<string>>()
      for (const node of nodes) {
        adj.set(node.id, new Set())
      }
      for (const edge of edges) {
        if (adj.has(edge.source)) {
          adj.get(edge.source)!.add(edge.target)
        }
      }

      const visited = new Set<string>()
      const recStack = new Set<string>()

      function dfs(nodeId: string): boolean {
        visited.add(nodeId)
        recStack.add(nodeId)

        const neighbors = adj.get(nodeId) ?? new Set<string>()
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            if (dfs(neighbor)) return true
          } else if (recStack.has(neighbor)) {
            return true
          }
        }

        recStack.delete(nodeId)
        return false
      }

      let hasLoop = false
      for (const node of nodes) {
        if (!visited.has(node.id)) {
          if (dfs(node.id)) {
            hasLoop = true
            break
          }
        }
      }

      if (hasLoop) {
        issues.push({
          id: 'loop-detected',
          type: 'error',
          message: '拓扑中存在环路，请检查连线',
        })
      }

      return issues
    },
  }
}

export function createVoltageMismatchRule(): ValidationRule {
  return {
    id: 'voltage-mismatch',
    name: '电压匹配检测',
    description: '检测相连设备之间的电压等级是否兼容',
    enabled: true,
    severity: 'warning',
    validate(nodes, edges, deviceData) {
      const issues: ValidationIssue[] = []
      const nodeMap = new Map(nodes.map((n) => [n.id, n] as [string, Node]))

      for (const edge of edges) {
        const sourceNode = nodeMap.get(edge.source)
        const targetNode = nodeMap.get(edge.target)
        if (!sourceNode || !targetNode) continue

        const sourceVoltage = getNodeVoltage(sourceNode, deviceData)
        const targetVoltage = getNodeVoltage(targetNode, deviceData)

        if (sourceVoltage > 0 && targetVoltage > 0 && sourceVoltage !== targetVoltage) {
          const tolerance = Math.max(sourceVoltage, targetVoltage) * 0.1
          if (Math.abs(sourceVoltage - targetVoltage) > tolerance) {
            issues.push({
              id: `voltage-mismatch-${edge.id}`,
              type: 'warning',
              message: `连线 "${edge.id}" 两端电压不匹配：源端 ${sourceVoltage}V，目标端 ${targetVoltage}V`,
              edgeId: edge.id,
              nodeId: sourceNode.id,
            })
          }
        }
      }
      return issues
    },
  }
}

export function createIslandDetectionRule(): ValidationRule {
  return {
    id: 'island-detection',
    name: '孤岛检测',
    description: '检测未连接到电源的孤立设备组',
    enabled: true,
    severity: 'error',
    validate(nodes, edges) {
      const issues: ValidationIssue[] = []
      if (nodes.length === 0) return issues

      const adj = new Map<string, Set<string>>()
      for (const node of nodes) {
        adj.set(node.id, new Set())
      }
      for (const edge of edges) {
        adj.get(edge.source)?.add(edge.target)
        adj.get(edge.target)?.add(edge.source)
      }

      const visited = new Set<string>()
      const components: string[][] = []

      for (const node of nodes) {
        if (visited.has(node.id)) continue
        const stack: string[] = [node.id]
        const component: string[] = []
        visited.add(node.id)
        while (stack.length > 0) {
          const current = stack.pop()
          if (current === undefined) continue
          component.push(current)
          const neighbors = adj.get(current) ?? new Set()
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              visited.add(neighbor)
              stack.push(neighbor)
            }
          }
        }
        components.push(component)
      }

      for (const component of components) {
        const hasPowerSource = component.some((nodeId) => {
          const node = nodes.find((n) => n.id === nodeId)
          if (!node) return false
          const nodeData = node.data as Record<string, unknown> | undefined
          const category = nodeData?.category as string | undefined
          return category === 'power'
        })
        if (!hasPowerSource) {
          const firstNode = nodes.find((n) => n.id === component[0])
          const firstNodeName = firstNode ? getNodeName(firstNode) : '未知'
          issues.push({
            id: `island-${component[0]}`,
            type: 'error',
            message: `发现孤岛：${component.length} 个设备未连接到电源（${firstNodeName}）`,
            nodeId: component[0],
          })
        }
      }

      return issues
    },
  }
}

function getNodeData(node: Node, deviceData: Map<string, Record<string, unknown>>): Record<string, unknown> {
  return deviceData.get(node.id) ?? (node.data as Record<string, unknown> | undefined) ?? {}
}

function getNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key]
  if (typeof value === 'number') return value
  return 0
}

function getString(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key]
  if (typeof value === 'string' && value.length > 0) return value
  return undefined
}

const DEVICE_TYPE_LABELS: Record<string, string> = {
  pv_panel: '光伏组件',
  battery: '储能电池',
  sscb: '固态断路器',
  dcdc_converter: 'DC/DC变换器',
  dc_bus: '直流母线',
  load: '直流负载',
  rectifier: '整流器',
  inverter: '逆变器',
  charger: '充电桩',
  meter: '智能电表',
  grid: '市电接入',
  sst: '固态变压器',
  acdc_converter: 'AC/DC变换器',
}

function getRangeLabel(values: number[], unit: string): string {
  const valid = values.filter((v) => v > 0)
  if (valid.length === 0) return '-'
  const min = Math.min(...valid)
  const max = Math.max(...valid)
  return min === max ? `${min} ${unit}` : `${min} ~ ${max} ${unit}`
}

function collectNodeNames(nodes: Node[]): string {
  const names = nodes
    .map((node) => ({ name: getNodeName(node), id: node.id }))
    .filter(({ name, id }) => name && name !== id)
    .map(({ name }) => name)
  if (names.length === 0) return ''
  if (names.length <= 3) return `（${names.join('、')}）`
  return `（${names.slice(0, 3).join('、')} 等）`
}

export function createSystemSummaryRule(): ValidationRule {
  return {
    id: 'system-summary',
    name: '系统信息汇总',
    description: '逐类统计已画系统中所有组件的名称、数量与基本参数',
    enabled: true,
    severity: 'info',
    validate(nodes, edges, deviceData) {
      const issues: ValidationIssue[] = []

      if (nodes.length === 0) {
        issues.push({
          id: 'summary-no-nodes',
          type: 'info',
          message: '当前画布为空，未检测到任何设备',
        })
        return issues
      }

      issues.push({
        id: 'summary-overview',
        type: 'info',
        message: `系统概览：共 ${nodes.length} 个设备节点，${edges.length} 条连线`,
      })

      const nodesByType = new Map<string, Node[]>()
      for (const node of nodes) {
        const type = node.type ?? 'unknown'
        const list = nodesByType.get(type) ?? []
        list.push(node)
        nodesByType.set(type, list)
      }

      const typeOrder = [
        'pv_panel',
        'battery',
        'sscb',
        'dcdc_converter',
        'dc_bus',
        'load',
        'rectifier',
        'inverter',
        'charger',
        'meter',
        'grid',
        'sst',
        'acdc_converter',
      ]

      for (const type of typeOrder) {
        const typeNodes = nodesByType.get(type)
        if (!typeNodes || typeNodes.length === 0) continue

        const label = DEVICE_TYPE_LABELS[type] ?? type
        const count = typeNodes.length
        const nameText = collectNodeNames(typeNodes)
        const dataList = typeNodes.map((n) => getNodeData(n, deviceData))
        let message = `${label}${nameText}：${count} `

        switch (type) {
          case 'pv_panel': {
            let totalPeakPower = 0
            let totalRatedPower = 0
            let totalPanelCount = 0
            for (const data of dataList) {
              const panelCount = getNumber(data, 'panelCount') || 1
              totalPanelCount += panelCount
              totalPeakPower += getNumber(data, 'peakPower') * panelCount
              totalRatedPower += getNumber(data, 'ratedPower') * panelCount
            }
            message += `组（共 ${totalPanelCount} 块），峰值功率合计 ${totalPeakPower.toFixed(1)} kW，额定功率合计 ${totalRatedPower.toFixed(1)} kW，额定电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'ratedVoltage')),
              'V',
            )}`
            break
          }
          case 'battery': {
            let totalCapacity = 0
            let totalChargePower = 0
            let totalDischargePower = 0
            for (const data of dataList) {
              totalCapacity += getNumber(data, 'capacity')
              totalChargePower += getNumber(data, 'maxChargePower')
              totalDischargePower += getNumber(data, 'maxDischargePower')
            }
            message += `组，总容量 ${totalCapacity.toFixed(1)} kWh，额定电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'ratedVoltage')),
              'V',
            )}，最大充/放电功率合计 ${totalChargePower.toFixed(1)} / ${totalDischargePower.toFixed(1)} kW`
            break
          }
          case 'sscb': {
            const models = new Set<string>()
            const ratedCurrents: number[] = []
            const breakingCapacities: number[] = []
            for (const data of dataList) {
              const model = getString(data, 'model')
              if (model) models.add(model)
              ratedCurrents.push(getNumber(data, 'ratedCurrent'))
              breakingCapacities.push(getNumber(data, 'breakingCapacity'))
            }
            const modelText = models.size > 0 ? `，型号 ${[...models].join('、')}` : ''
            message += `台${modelText}，额定电流 ${getRangeLabel(ratedCurrents, 'A')}，分断能力 ${getRangeLabel(
              breakingCapacities,
              'kA',
            )}`
            break
          }
          case 'dcdc_converter': {
            let totalMaxPower = 0
            for (const data of dataList) {
              totalMaxPower += getNumber(data, 'maxPower')
            }
            message += `台，输入电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'inputVoltage')),
              'V',
            )}，输出电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'outputVoltage')),
              'V',
            )}，最大功率合计 ${totalMaxPower.toFixed(1)} kW`
            break
          }
          case 'dc_bus': {
            let totalLength = 0
            let totalBranches = 0
            for (const data of dataList) {
              totalLength += getNumber(data, 'length')
              totalBranches += getNumber(data, 'numBranches')
            }
            message += `条，电压等级 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'voltageLevel')),
              'V',
            )}，总长度 ${totalLength.toFixed(1)} m，分支数合计 ${totalBranches}`
            break
          }
          case 'load': {
            let totalRatedPower = 0
            let totalMaxPower = 0
            const loadTypes = new Set<string>()
            for (const data of dataList) {
              totalRatedPower += getNumber(data, 'ratedPower')
              totalMaxPower += getNumber(data, 'maxPower')
              const loadType = getString(data, 'loadType')
              if (loadType) loadTypes.add(loadType)
            }
            const typeText = loadTypes.size > 0 ? `，类型 ${[...loadTypes].join('、')}` : ''
            message += `个${typeText}，额定功率合计 ${totalRatedPower.toFixed(1)} kW，最大功率合计 ${totalMaxPower.toFixed(1)} kW`
            break
          }
          case 'rectifier': {
            let totalRatedPower = 0
            for (const data of dataList) {
              totalRatedPower += getNumber(data, 'ratedPower')
            }
            message += `台，额定功率合计 ${totalRatedPower.toFixed(1)} kW，效率 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'efficiency')),
              '%',
            )}`
            break
          }
          case 'inverter': {
            let totalRatedPower = 0
            for (const data of dataList) {
              totalRatedPower += getNumber(data, 'ratedPower')
            }
            message += `台，额定功率合计 ${totalRatedPower.toFixed(1)} kW，输出电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'outputVoltage')),
              'V',
            )}，输出频率 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'outputFrequency')),
              'Hz',
            )}`
            break
          }
          case 'charger': {
            let totalRatedPower = 0
            for (const data of dataList) {
              totalRatedPower += getNumber(data, 'ratedPower')
            }
            message += `台，额定功率合计 ${totalRatedPower.toFixed(1)} kW，输出电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'outputVoltage')),
              'V',
            )}，输出电流 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'outputCurrent')),
              'A',
            )}`
            break
          }
          case 'meter': {
            const protocols = new Set<string>()
            for (const data of dataList) {
              const protocol = getString(data, 'communicationProtocol')
              if (protocol) protocols.add(protocol)
            }
            const protocolText = protocols.size > 0 ? `，通信协议 ${[...protocols].join('、')}` : ''
            message += `只${protocolText}，精度 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'accuracy')),
              '%',
            )}`
            break
          }
          case 'grid': {
            let totalShortCircuitCapacity = 0
            for (const data of dataList) {
              totalShortCircuitCapacity += getNumber(data, 'shortCircuitCapacity')
            }
            message += `路，电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'gridVoltage')),
              'V',
            )}，频率 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'gridFrequency')),
              'Hz',
            )}，短路容量合计 ${totalShortCircuitCapacity.toFixed(1)} MVA`
            break
          }
          case 'sst': {
            let totalRatedPower = 0
            for (const data of dataList) {
              totalRatedPower += getNumber(data, 'ratedPower')
            }
            message += `台，一次侧电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'primaryVoltage')),
              'V',
            )}，二次侧电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'secondaryVoltage')),
              'V',
            )}，额定功率合计 ${totalRatedPower.toFixed(1)} kW`
            break
          }
          case 'acdc_converter': {
            let totalRatedPower = 0
            for (const data of dataList) {
              totalRatedPower += getNumber(data, 'ratedPower')
            }
            message += `台，AC电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'acVoltage')),
              'V',
            )}，DC电压 ${getRangeLabel(
              dataList.map((d) => getNumber(d, 'dcVoltage')),
              'V',
            )}，额定功率合计 ${totalRatedPower.toFixed(1)} kW`
            break
          }
          default:
            message += '个/台/组'
        }

        issues.push({
          id: `summary-${type}`,
          type: 'info',
          message,
        })
      }

      const unknownNodes = nodesByType.get('unknown')
      if (unknownNodes && unknownNodes.length > 0) {
        const names = collectNodeNames(unknownNodes)
        issues.push({
          id: 'summary-unknown',
          type: 'info',
          message: `未知类型设备${names}：${unknownNodes.length} 个`,
        })
      }

      return issues
    },
  }
}

export function getDefaultValidationRules(): ValidationRule[] {
  return [createSystemSummaryRule()]
}
