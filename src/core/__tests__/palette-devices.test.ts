import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert'
import { useBoundStore } from '../../store/index.ts'
import { DEVICE_METADATA } from '../../constants/device-metadata.ts'
import {
  createPVPanelDefaults,
  getPVPanelPorts,
  createBatteryDefaults,
  getBatteryPorts,
  createSSCBDefaults,
  getSSCBPorts,
  createDCDCDefaults,
  getDCDCPorts,
  createDCBusDefaults,
  getDCBusPorts,
  createLoadDefaults,
  getLoadPorts,
  createRectifierDefaults,
  getRectifierPorts,
  createInverterDefaults,
  getInverterPorts,
  createChargerDefaults,
  getChargerPorts,
  createMeterDefaults,
  getMeterPorts,
  createGridDefaults,
  getGridPorts,
  createSSTDefaults,
  getSSTPorts,
  createACDCConverterDefaults,
  getACDCConverterPorts,
} from '../../types/devices/index.ts'

const DEVICE_FACTORIES: Record<
  string,
  { defaults: () => unknown; ports: () => unknown[] }
> = {
  pv_panel: { defaults: createPVPanelDefaults, ports: getPVPanelPorts },
  battery: { defaults: createBatteryDefaults, ports: getBatteryPorts },
  sscb: { defaults: createSSCBDefaults, ports: getSSCBPorts },
  dcdc_converter: { defaults: createDCDCDefaults, ports: getDCDCPorts },
  dc_bus: { defaults: createDCBusDefaults, ports: getDCBusPorts },
  load: { defaults: createLoadDefaults, ports: getLoadPorts },
  rectifier: { defaults: createRectifierDefaults, ports: getRectifierPorts },
  inverter: { defaults: createInverterDefaults, ports: getInverterPorts },
  charger: { defaults: createChargerDefaults, ports: getChargerPorts },
  meter: { defaults: createMeterDefaults, ports: getMeterPorts },
  grid: { defaults: createGridDefaults, ports: getGridPorts },
  sst: { defaults: createSSTDefaults, ports: getSSTPorts },
  acdc_converter: { defaults: createACDCConverterDefaults, ports: getACDCConverterPorts },
}

describe('Palette devices', () => {
  it('every device in DEVICE_METADATA has a factory', () => {
    const metaKeys = Object.keys(DEVICE_METADATA).sort()
    const factoryKeys = Object.keys(DEVICE_FACTORIES).sort()
    assert.deepStrictEqual(metaKeys, factoryKeys)
  })

  beforeEach(() => {
    useBoundStore.setState({
      nodes: [],
      edges: [],
      deviceData: new Map(),
    })
  })

  for (const deviceType of Object.keys(DEVICE_FACTORIES)) {
    it(`can add ${deviceType} node to canvas`, () => {
      const factory = DEVICE_FACTORIES[deviceType]
      const nodeId = `node-${deviceType}`
      const defaults = factory.defaults() as Record<string, unknown>
      const ports = factory.ports()
      const node = {
        id: nodeId,
        type: deviceType,
        position: { x: 10, y: 10 },
        data: { ...defaults, ports },
      }

      useBoundStore.getState().addNode(node)
      useBoundStore.getState().setDeviceData(nodeId, { ...defaults, ports })

      const state = useBoundStore.getState()
      assert.strictEqual(state.nodes.length, 1, 'one node should be added')
      assert.strictEqual(state.nodes[0].type, deviceType, 'node type should match device type')
      assert.ok(state.deviceData.has(nodeId), 'device data should be stored')
    })
  }
})
