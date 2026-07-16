import { describe, it } from 'node:test'
import assert from 'node:assert'
import { PluginManager, createPluginManager } from '../plugin/plugin-manager.ts'
import { BaseDevicePlugin } from '../plugin/base-device-plugin.ts'

const MockIcon = (): null => null
const MockNode = (): null => null

interface PortDef {
  id: string
  type: 'input' | 'output' | 'bidirectional'
  position: 'left' | 'right' | 'top' | 'bottom'
}

class TestPlugin extends BaseDevicePlugin {
  readonly id: string
  readonly name: string
  readonly category: 'power' | 'converter' | 'distribution' | 'load' | 'auxiliary'
  readonly icon = MockIcon
  nodeComponent = MockNode
  propertySchema = {}

  constructor(
    id: string,
    name: string,
    category: 'power' | 'converter' | 'distribution' | 'load' | 'auxiliary',
  ) {
    super()
    this.id = id
    this.name = name
    this.category = category
  }

  defaultData(): Record<string, unknown> {
    return {}
  }

  getPorts(): PortDef[] {
    return []
  }
}

describe('PluginManager', () => {
  it('should install plugin', () => {
    const manager = createPluginManager()
    const plugin = new TestPlugin('pv-panel', '光伏组件', 'power')

    manager.install(plugin)

    assert.strictEqual(manager.isInstalled('pv-panel'), true)
    assert.strictEqual(manager.getPlugin('pv-panel')?.name, '光伏组件')
  })

  it('should throw on duplicate installation', () => {
    const manager = createPluginManager()
    manager.install(new TestPlugin('pv-panel', '光伏组件', 'power'))

    assert.throws(() => {
      manager.install(new TestPlugin('pv-panel', '光伏组件', 'power'))
    }, /already installed/)
  })

  it('should uninstall plugin', () => {
    const manager = createPluginManager()
    manager.install(new TestPlugin('pv-panel', '光伏组件', 'power'))

    manager.uninstall('pv-panel')

    assert.strictEqual(manager.isInstalled('pv-panel'), false)
  })

  it('should throw on uninstalling non-existent plugin', () => {
    const manager = createPluginManager()

    assert.throws(() => {
      manager.uninstall('nonexistent')
    }, /not installed/)
  })

  it('should get plugins by category', () => {
    const manager = createPluginManager()
    manager.install(new TestPlugin('pv-panel', '光伏组件', 'power'))
    manager.install(new TestPlugin('battery', '储能电池', 'power'))
    manager.install(new TestPlugin('sscb', '断路器', 'distribution'))

    const powerPlugins = manager.getPluginsByCategory('power')
    assert.strictEqual(powerPlugins.length, 2)

    const distPlugins = manager.getPluginsByCategory('distribution')
    assert.strictEqual(distPlugins.length, 1)

    const converterPlugins = manager.getPluginsByCategory('converter')
    assert.strictEqual(converterPlugins.length, 0)
  })

  it('should get all plugins', () => {
    const manager = createPluginManager()
    manager.install(new TestPlugin('pv-panel', '光伏组件', 'power'))
    manager.install(new TestPlugin('battery', '储能电池', 'power'))

    assert.strictEqual(manager.getAllPlugins().length, 2)
  })

  it('should enforce dependency check', () => {
    const manager = createPluginManager() as PluginManager
    const dependentPlugin = new TestPlugin('dependent', '依赖插件', 'converter')

    manager.registerDependencies('dependent', [
      { pluginId: 'base-plugin', required: true },
    ])

    assert.throws(() => {
      manager.install(dependentPlugin)
    }, /requires "base-plugin"/)
  })

  it('should prevent uninstall if other plugin depends on it', () => {
    const manager = createPluginManager() as PluginManager
    const basePlugin = new TestPlugin('base-plugin', '基础插件', 'power')
    const dependentPlugin = new TestPlugin('dependent', '依赖插件', 'converter')

    manager.registerDependencies('dependent', [
      { pluginId: 'base-plugin', required: true },
    ])

    manager.install(basePlugin)
    manager.install(dependentPlugin)

    assert.throws(() => {
      manager.uninstall('base-plugin')
    }, /cannot uninstall.*because "dependent" depends on it/)
  })

  it('should allow uninstall if dependency is optional', () => {
    const manager = createPluginManager() as PluginManager
    const basePlugin = new TestPlugin('base-plugin', '基础插件', 'power')
    const optionalDependent = new TestPlugin('optional', '可选依赖插件', 'converter')

    manager.registerDependencies('optional', [
      { pluginId: 'base-plugin', required: false },
    ])

    manager.install(basePlugin)
    manager.install(optionalDependent)

    manager.uninstall('base-plugin')
    assert.strictEqual(manager.isInstalled('base-plugin'), false)
  })
})
