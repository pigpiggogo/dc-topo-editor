# 直流母线出线优化方案

## 目标
为 SST、AC/DC 变换器、市电（Grid）的出线实现加粗的直流母线样式、正交约束、750V 标签、以及可重拖拽的路径调整。

## 关键改动

### 1. 新增母线路由器 `src/edges/busbar-router.ts`
- `getBusbarPathPoints(sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition?)`
- 行为：
  - 源端口为 Right 时，鼠标在组件右侧水平带状区域（|dy| ≤ 阈值）=> 纯水平线。
  - 鼠标在组件正上/正下带状区域（|dx| ≤ 阈值）=> 纯垂直线。
  - 其余位置 => Manhattan 直角折线：水平优先或垂直优先，取决于相对方向，避免出现斜线。
- 提供 `getBusbarPathMidpoint` 用于标签居中。

### 2. 新增母线边组件 `src/edges/busbar-edge.tsx`
- 线宽 5px（选中 6px），颜色 `#FF6B35`（醒目橙色）。
- 使用 `getBusbarPathPoints` 计算路径。
- 在路径几何中心渲染 `BusbarLabel`。
- 选中时显示 `EdgeToolbar`（仅保留删除，母线不切换 orthogonal/straight）。
- 注册/注销路径到 `edge-path-registry`，使其它连线可吸附到母线。

### 3. 新增母线标签 `src/edges/busbar-label.tsx`
- 显示固定文本 `750V`。
- 白色加粗字体、深色描边（`-webkit-text-stroke` + 阴影），确保任何背景下清晰。

### 4. 修改预览线 `src/edges/snapped-connection-line.tsx`
- 对 SST/ACDC/Grid 的拖拽预览：
  - 不再使用斜直线，改用 `getBusbarPathPoints` 的正交/水平/垂直路径。
  - 线条颜色 `#FF6B35`、线宽 5px。
  - 可在路径中点显示 `750V` 预览标签（可选）。

### 5. 修改画布引擎 `src/engine/canvas-engine.tsx`
- `edgeTypes` 增加 `busbar: BusbarEdge`。
- `onConnect`：
  - 若源节点类型 ∈ {sst, acdc_converter, grid}，创建 `type: 'busbar'`，`data: { voltage: 750, style: 'busbar' }`。
  - 否则保持 `orthogonal`。
- `onConnectEnd`：
  - 源类型为上述三类且落到空白处时，按“落点策略”处理（见下方选项）。
- 启用边重连：
  - 设置 `edgesReconnectable={true}`。
  - 提供 `onReconnect`，使用 `reconnectEdge` 更新 store 中的边。

### 6. 导出更新 `src/edges/index.ts`
- 导出 `BusbarEdge`、`BusbarLabel`、母线路由函数。

### 7. 工具栏适配 `src/edges/edge-toolbar.tsx`
- 对 `type === 'busbar'` 的边隐藏“样式”切换按钮，仅保留删除。

## 落点策略选项

A. **空白处自动创建可拖拽分支点（推荐）**
   - 保持现有自由绘制能力，空白处生成一个 `branch_point` 节点并用 `busbar` 边连接。
   - 该分支点可作为悬空端点，后续通过拖拽边端点接到其它组件。

B. **空白处自动取消**
   - 不创建任何节点/边，鼠标松开后母线消失，图纸更整洁。
   - 只保留“落到目标端口才生成母线”的行为。

## 验证
- `npm run lint`
- `npm run build`
- 在浏览器中从 SST/ACDC/Grid 右侧端口拖拽，检查：
  - 线宽、颜色、正交路径、750V 标签位置；
  - 落目标端口后生成固定母线；
  - 选中母线后拖拽端点可重连到其它端口；
  - 标签始终居中。
