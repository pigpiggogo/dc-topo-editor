import type { TemplateDefinition } from './template-types'
import { registerTemplate } from './template-registry'

const solarStorageFlexTemplate: TemplateDefinition = {
  id: 'solar_storage_flex',
  name: '光储直柔系统',
  description:
    '光伏发电+储能电池+直流母线的典型光储直柔微电网拓扑，含双路光伏输入和双路负载输出',
  category: 'microgrid',
  tags: ['光伏', '储能', '直流微电网'],
  nodes: [
    {
      id: 'pv1',
      type: 'pv_panel',
      position: { x: 100, y: 100 },
      data: { name: '光伏阵列A', ratedPower: 100, ratedVoltage: 750 },
    },
    {
      id: 'pv2',
      type: 'pv_panel',
      position: { x: 100, y: 300 },
      data: { name: '光伏阵列B', ratedPower: 100, ratedVoltage: 750 },
    },
    {
      id: 'dcdc1',
      type: 'dcdc_converter',
      position: { x: 250, y: 100 },
      data: { name: 'DC/DC-MPPT1', inputVoltage: 750, outputVoltage: 750 },
    },
    {
      id: 'dcdc2',
      type: 'dcdc_converter',
      position: { x: 250, y: 300 },
      data: { name: 'DC/DC-MPPT2', inputVoltage: 750, outputVoltage: 750 },
    },
    {
      id: 'sscb1',
      type: 'sscb',
      position: { x: 400, y: 100 },
      data: { name: '断路器-S1', status: 'closed' },
    },
    {
      id: 'sscb2',
      type: 'sscb',
      position: { x: 400, y: 300 },
      data: { name: '断路器-S2', status: 'closed' },
    },
    {
      id: 'bus',
      type: 'dc_bus',
      position: { x: 550, y: 200 },
      data: { name: '750V直流母线', voltageLevel: 750, ratedCurrent: 1000 },
    },
    {
      id: 'bat',
      type: 'battery',
      position: { x: 550, y: 400 },
      data: { name: '储能系统', capacity: 500, ratedVoltage: 750 },
    },
    {
      id: 'load1',
      type: 'load',
      position: { x: 700, y: 150 },
      data: { name: '建筑负载A', ratedPower: 50, ratedVoltage: 750 },
    },
    {
      id: 'load2',
      type: 'load',
      position: { x: 700, y: 300 },
      data: { name: '建筑负载B', ratedPower: 50, ratedVoltage: 750 },
    },
  ],
  edges: [
    {
      id: 'e-pv1-dcdc1',
      source: 'pv1',
      target: 'dcdc1',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-pv2-dcdc2',
      source: 'pv2',
      target: 'dcdc2',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-dcdc1-sscb1',
      source: 'dcdc1',
      target: 'sscb1',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-dcdc2-sscb2',
      source: 'dcdc2',
      target: 'sscb2',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-sscb1-bus',
      source: 'sscb1',
      target: 'bus',
      sourceHandle: 'dc-out',
      targetHandle: 'port-3',
    },
    {
      id: 'e-sscb2-bus',
      source: 'sscb2',
      target: 'bus',
      sourceHandle: 'dc-out',
      targetHandle: 'port-0',
    },
    {
      id: 'e-bat-bus',
      source: 'bat',
      target: 'bus',
      sourceHandle: 'dc-bi',
      targetHandle: 'port-2',
    },
    {
      id: 'e-bus-load1',
      source: 'bus',
      target: 'load1',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-bus-load2',
      source: 'bus',
      target: 'load2',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
  ],
}

const dataCenterDCTemplate: TemplateDefinition = {
  id: 'data_center_dc',
  name: '数据中心直流配电',
  description:
    '数据中心高压直流配电系统，包含双路输入、UPS储能和三路服务器机架负载',
  category: 'data_center',
  tags: ['数据中心', '高压直流', 'UPS'],
  nodes: [
    {
      id: 'sscb1',
      type: 'sscb',
      position: { x: 100, y: 100 },
      data: { name: '输入断路器', status: 'closed' },
    },
    {
      id: 'sscb2',
      type: 'sscb',
      position: { x: 100, y: 300 },
      data: { name: '备用断路器', status: 'closed' },
    },
    {
      id: 'dcdc1',
      type: 'dcdc_converter',
      position: { x: 250, y: 100 },
      data: { name: 'AC/DC整流', inputVoltage: 380, outputVoltage: 750 },
    },
    {
      id: 'dcdc2',
      type: 'dcdc_converter',
      position: { x: 250, y: 300 },
      data: { name: 'DC/DC变换', inputVoltage: 750, outputVoltage: 375 },
    },
    {
      id: 'bus',
      type: 'dc_bus',
      position: { x: 450, y: 200 },
      data: { name: '750V直流母线', voltageLevel: 750, ratedCurrent: 2000 },
    },
    {
      id: 'bat',
      type: 'battery',
      position: { x: 450, y: 400 },
      data: { name: 'UPS储能', capacity: 1000, ratedVoltage: 750 },
    },
    {
      id: 'load1',
      type: 'load',
      position: { x: 650, y: 100 },
      data: { name: '服务器机架1', ratedPower: 100, ratedVoltage: 375 },
    },
    {
      id: 'load2',
      type: 'load',
      position: { x: 650, y: 200 },
      data: { name: '服务器机架2', ratedPower: 100, ratedVoltage: 375 },
    },
    {
      id: 'load3',
      type: 'load',
      position: { x: 650, y: 300 },
      data: { name: '服务器机架3', ratedPower: 100, ratedVoltage: 375 },
    },
  ],
  edges: [
    {
      id: 'e-sscb1-dcdc1',
      source: 'sscb1',
      target: 'dcdc1',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-sscb2-dcdc2',
      source: 'sscb2',
      target: 'dcdc2',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-dcdc1-bus',
      source: 'dcdc1',
      target: 'bus',
      sourceHandle: 'dc-out',
      targetHandle: 'port-3',
    },
    {
      id: 'e-dcdc2-bus',
      source: 'dcdc2',
      target: 'bus',
      sourceHandle: 'dc-out',
      targetHandle: 'port-0',
    },
    {
      id: 'e-bat-bus',
      source: 'bat',
      target: 'bus',
      sourceHandle: 'dc-bi',
      targetHandle: 'port-2',
    },
    {
      id: 'e-bus-load1',
      source: 'bus',
      target: 'load1',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-bus-load2',
      source: 'bus',
      target: 'load2',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-bus-load3',
      source: 'bus',
      target: 'load3',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
  ],
}

const chargingStationTemplate: TemplateDefinition = {
  id: 'charging_station',
  name: '充电桩群',
  description: '直流充电桩群系统，包含光伏辅助供电、储能缓冲和三路充电桩',
  category: 'transport',
  tags: ['充电桩', '电动汽车', '光伏辅助'],
  nodes: [
    {
      id: 'sscb1',
      type: 'sscb',
      position: { x: 100, y: 100 },
      data: { name: '输入断路器', status: 'closed' },
    },
    {
      id: 'pv1',
      type: 'pv_panel',
      position: { x: 100, y: 300 },
      data: { name: '光伏辅助', ratedPower: 50, ratedVoltage: 750 },
    },
    {
      id: 'dcdc1',
      type: 'dcdc_converter',
      position: { x: 250, y: 100 },
      data: { name: 'AC/DC整流', inputVoltage: 380, outputVoltage: 750 },
    },
    {
      id: 'dcdc2',
      type: 'dcdc_converter',
      position: { x: 250, y: 300 },
      data: { name: 'DC/DC光伏', inputVoltage: 750, outputVoltage: 750 },
    },
    {
      id: 'bus',
      type: 'dc_bus',
      position: { x: 450, y: 200 },
      data: { name: '750V充电母线', voltageLevel: 750, ratedCurrent: 1500 },
    },
    {
      id: 'bat',
      type: 'battery',
      position: { x: 450, y: 400 },
      data: { name: '缓冲储能', capacity: 300, ratedVoltage: 750 },
    },
    {
      id: 'load1',
      type: 'load',
      position: { x: 650, y: 100 },
      data: { name: '快充桩1', ratedPower: 120, ratedVoltage: 750 },
    },
    {
      id: 'load2',
      type: 'load',
      position: { x: 650, y: 200 },
      data: { name: '快充桩2', ratedPower: 120, ratedVoltage: 750 },
    },
    {
      id: 'load3',
      type: 'load',
      position: { x: 650, y: 300 },
      data: { name: '快充桩3', ratedPower: 120, ratedVoltage: 750 },
    },
  ],
  edges: [
    {
      id: 'e-sscb1-dcdc1',
      source: 'sscb1',
      target: 'dcdc1',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-dcdc1-bus',
      source: 'dcdc1',
      target: 'bus',
      sourceHandle: 'dc-out',
      targetHandle: 'port-3',
    },
    {
      id: 'e-pv1-dcdc2',
      source: 'pv1',
      target: 'dcdc2',
      sourceHandle: 'dc-out',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-dcdc2-bus',
      source: 'dcdc2',
      target: 'bus',
      sourceHandle: 'dc-out',
      targetHandle: 'port-0',
    },
    {
      id: 'e-bat-bus',
      source: 'bat',
      target: 'bus',
      sourceHandle: 'dc-bi',
      targetHandle: 'port-2',
    },
    {
      id: 'e-bus-load1',
      source: 'bus',
      target: 'load1',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-bus-load2',
      source: 'bus',
      target: 'load2',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
    {
      id: 'e-bus-load3',
      source: 'bus',
      target: 'load3',
      sourceHandle: 'port-1',
      targetHandle: 'dc-in',
    },
  ],
}

export function registerDefaultTemplates(): void {
  registerTemplate(solarStorageFlexTemplate)
  registerTemplate(dataCenterDCTemplate)
  registerTemplate(chargingStationTemplate)
}
