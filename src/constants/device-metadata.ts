import type { DeviceCategoryMeta } from '../types/index.ts'

export const DEVICE_CATEGORIES: DeviceCategoryMeta[] = [
  {
    id: 'power',
    name: '电源',
    description: '光伏发电、储能电池、市电接入等能源设备',
    color: '#dcfce7',
    icon: 'Zap',
  },
  {
    id: 'converter',
    name: '变换',
    description: 'AC/DC、DC/DC、逆变器等电力变换设备',
    color: '#fef9c3',
    icon: 'ArrowLeftRight',
  },
  {
    id: 'distribution',
    name: '配电',
    description: '直流母线、断路器、熔断器等配电设备',
    color: '#dbeafe',
    icon: 'GitBranch',
  },
  {
    id: 'load',
    name: '负载',
    description: '充电桩、照明、空调等用电设备',
    color: '#fee2e2',
    icon: 'Plug',
  },
  {
    id: 'auxiliary',
    name: '辅助',
    description: '电表、传感器、监控等辅助设备',
    color: '#f3e8ff',
    icon: 'Gauge',
  },
]

export const DEVICE_METADATA: Record<string, { name: string; category: string; icon: string; description: string }> = {
  pv_panel: { name: '光伏组件', category: 'power', icon: 'Sun', description: '光伏发电单元' },
  battery: { name: '储能电池', category: 'power', icon: 'Battery', description: '储能单元' },
  sscb: { name: '固态断路器', category: 'distribution', icon: 'Shield', description: '保护开关' },
  dcdc_converter: { name: 'DC/DC变换器', category: 'converter', icon: 'ArrowLeftRight', description: '直流变换器' },
  dc_bus: { name: '直流母线', category: 'distribution', icon: 'Minus', description: '直流配电母线' },
  load: { name: '直流负载', category: 'load', icon: 'Plug', description: '用电设备' },
  rectifier: { name: '整流器', category: 'converter', icon: 'ArrowDown', description: 'AC/DC整流' },
  inverter: { name: '逆变器', category: 'converter', icon: 'ArrowUp', description: 'DC/AC逆变' },
  charger: { name: '充电桩', category: 'load', icon: 'EvCharger', description: '电动汽车充电' },
  meter: { name: '智能电表', category: 'auxiliary', icon: 'Gauge', description: '计量监测' },
  grid: { name: '市电接入', category: 'power', icon: 'Building2', description: '电网连接' },
  sst: { name: '固态变压器', category: 'power', icon: 'Cpu', description: '固态变压器(SST)' },
  acdc_converter: { name: 'AC/DC变换器', category: 'power', icon: 'ArrowRightLeft', description: '交直流变换器' },
}
