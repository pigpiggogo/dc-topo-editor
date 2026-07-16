export const VOLTAGE_COLORS: Record<number, string> = {
  48: '#8B5CF6', // 48V 紫色
  220: '#F59E0B', // 220V 黄色
  380: '#10B981', // 380V 绿色
  750: '#3B82F6', // 750V 蓝色
  800: '#06B6D4', // 800V 青色
  1000: '#F97316', // 1000V 橙色
  1500: '#EF4444', // 1500V 红色
}

export const VOLTAGE_COLOR_UNKNOWN = '#9CA3AF'

export function getVoltageColor(voltage: number | undefined): string {
  if (voltage === undefined) return VOLTAGE_COLOR_UNKNOWN
  return VOLTAGE_COLORS[voltage] ?? VOLTAGE_COLOR_UNKNOWN
}
