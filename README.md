# 直流系统拓扑图编辑器（DC Topology Editor）

面向光储直柔（光伏 + 储能 + 直流配电）场景的 Web 拓扑图编辑器，用于售前技术方案展示与系统设计初期快速原型。

## 核心能力

- **拖拽搭建**：通过拖拽方式快速搭建直流微电网系统架构图
- **参数配置**：对设备进行参数配置与连线拓扑关系定义
- **拓扑校验**：未连接端口提示、环路检测、电压匹配检查、孤岛检测
- **导出系统**：支持 PNG/JPG/PDF 高清导出、.dtopo 格式保存/加载
- **模板系统**：预设典型拓扑模板（光储直柔、数据中心直流配电、充电桩群）

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript 5.x（strict: true） |
| 构建工具 | Vite 8.x |
| 图形引擎 | @xyflow/react (React Flow v12) |
| UI 样式 | Tailwind CSS 4.x |
| 状态管理 | Zustand 5.x（切片模式） |
| 事件系统 | 自研 Typed EventBus（基于 Mitt） |
| 表单引擎 | React Hook Form + Zod |
| 导出功能 | html2canvas + jspdf |
| 图标库 | lucide-react |

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建产物
npm run preview

# 运行单元测试
node --test src/core/__tests__/*.test.ts
```

## 六大架构设计模式

本项目严格遵循以下 6 大设计模式，确保代码的可扩展性、可维护性与可测试性：

### 1. Registry（注册表）

所有设备类型、连线类型、工具按钮均通过 Registry 注册，禁止硬编码设备类型到核心代码中。

```ts
interface IRegistry<T> {
  register(key: string, item: T): void
  unregister(key: string): void
  get(key: string): T | undefined
  getAll(): T[]
  has(key: string): boolean
}
```

### 2. Plugin（插件）

每类设备均为独立 Plugin，包含：节点组件、属性 Schema、默认参数、图标、连接点定义。

```ts
interface IDevicePlugin {
  readonly id: string
  readonly name: string
  readonly category: DeviceCategory
  readonly icon: ComponentType
  nodeComponent: ComponentType<Record<string, unknown>>
  propertySchema: unknown
  defaultData(): Record<string, unknown>
  getPorts(): PortDefinition[]
  validate(data: unknown): boolean
}
```

### 3. Command Pattern（命令模式）

所有用户操作均封装为 Command 对象，通过 CommandBus 执行，支持 Undo/Redo。双栈结构，容量上限 100。

### 4. Schema 驱动

所有设备的属性面板由 JSON Schema + Zod 声明自动生成，禁止为每种设备手写表单组件。

```ts
schemaBuilder
  .addField('name', textField('设备名称'))
  .addField('ratedPower', numberField('峰值功率', { unit: 'kW', min: 0 }))
  .addGroup(group('光伏参数', [...]))
```

### 5. Event Bus（事件总线）

模块间通信必须通过 Event Bus，禁止直接调用其他模块的方法。

事件分类：`canvas.*` / `device.*` / `command.*` / `plugin.*` / `export.*` / `ui.*` / `topology.*`

### 6. Store 分层

Zustand Store 按职责拆分为 6 个 Slice：

| Slice | 职责 |
|-------|------|
| UI Store | 面板显隐、主题、缩放 |
| Canvas Store | 节点列表、连线列表、视口变换 |
| Device Store | 设备实例数据（参数值、运行时状态） |
| Command Store | 命令历史（undoStack/redoStack） |
| Plugin Store | 插件注册状态 |

## 目录结构

```
src/
  core/               — 基础设施（与业务无关的纯技术层）
    event-bus/        — EventBus 实现与事件定义
    registry/         — Registry 注册表基类
    command/          — Command 模式基础设施
    plugin/           — Plugin 管理器与插件接口
    schema/           — Schema 定义与校验工具
    __tests__/        — 单元测试
  store/              — 分层状态管理
    slices/           — Zustand 切片
    selectors/        — 派生状态选择器
  engine/             — 画布引擎（React Flow 封装层）
  nodes/              — 设备节点定义（按 Plugin 组织）
    components/       — 设备节点 React 组件
    plugins/          — 设备 Plugin 定义
  edges/              — 连线定义与样式
    orthogonal-router.ts  — 正交路由算法
  features/           — 业务功能模块
    palette/          — 设备库面板
    property/         — 属性面板（Schema 驱动）
    toolbar/          — 工具栏
    canvas/           — 画布容器
    status-bar/       — 状态栏
    bus/              — 母线系统（拉伸/T 型连接）
    validation/       — 拓扑校验
    alignment/        — 对齐分布
    layers/           — 图层管理
    export/           — 导出系统（图片/PDF/JSON）
    template/         — 模板库
  types/              — 全局类型定义
  constants/          — 常量定义
  hooks/              — 自定义 Hooks
```

## 如何添加新设备类型

1. **定义数据类型**（`src/types/devices/{device}.ts`）
   - 接口定义 + 默认值工厂 + 端口布局

2. **创建 Plugin**（`src/nodes/plugins/{device}-plugin.ts`）
   - 继承 `BaseDevicePlugin`
   - 定义 `propertySchema`（使用 schema-builder DSL）
   - 实现 `defaultData()`、`getPorts()`、`validate()`

3. **创建节点组件**（`src/nodes/components/{device}-node.tsx`）
   - 接收 `NodeProps`，从 `props.data` 读取设备数据
   - 使用 React Flow `<Handle>` 渲染端口
   - SCADA 风格：分类底色 + 电压颜色指示点

4. **注册 Plugin**（`src/engine/plugin-instance.ts`）
   - 在 `initializeDefaultPlugins()` 中添加 `new XXXPlugin()`

5. **注册节点类型**（`src/engine/canvas-engine.tsx`）
   - 在 `nodeTypes` 中添加 `{device_id}: XXXNode`

6. **更新设备元数据**（`src/constants/device-metadata.ts`）
   - 在 `DEVICE_METADATA` 中添加新设备条目

## 预设设备类型

| 设备 | 类型 ID | 分类 | 端口 |
|------|---------|------|------|
| 光伏组件 | `pv_panel` | 电源 | 1 输出 |
| 储能电池 | `battery` | 电源 | 1 双向 |
| 固态断路器 | `sscb` | 配电 | 1 输入 + 1 输出 |
| DC/DC 变换器 | `dcdc_converter` | 变换 | 1 输入 + 1 输出 |
| 直流母线 | `dc_bus` | 配电 | 4 双向（可拉伸） |
| 直流负载 | `load` | 负载 | 1 输入 |
| 整流器 | `rectifier` | 变换 | 1 输入 + 1 输出 |
| 逆变器 | `inverter` | 变换 | 1 输入 + 1 输出 |
| 充电桩 | `charger` | 负载 | 1 输入 + 1 输出 |
| 智能电表 | `meter` | 辅助 | 1 输入 + 1 输出 |
| 市电接入 | `grid` | 电源 | 1 输出 |

## 质量门槛

- TypeScript 严格模式（`strict: true`）
- 无 `any` 类型
- 无 `@ts-ignore`
- 无 `TODO` 功能替代
- 每阶段 `npm run build` 必须通过

## 许可证

MIT
