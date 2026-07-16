import type { Node, Edge } from '@xyflow/react'
import type { ValidationIssue } from '@/types'
import { eventBus } from '@/core/event-bus/event-bus'
import type { ValidationRule } from './validation-rules'
import { getDefaultValidationRules } from './validation-rules'

export class TopologyValidator {
  private rules: ValidationRule[]
  private issues: ValidationIssue[] = []

  constructor(rules: ValidationRule[]) {
    this.rules = [...rules]
  }

  addRule(rule: ValidationRule): void {
    this.rules.push(rule)
  }

  removeRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId)
  }

  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) {
      rule.enabled = enabled
    }
  }

  validate(
    nodes: Node[],
    edges: Edge[],
    deviceData: Map<string, Record<string, unknown>>,
  ): ValidationIssue[] {
    const allIssues: ValidationIssue[] = []
    for (const rule of this.rules) {
      if (!rule.enabled) continue
      try {
        const ruleIssues = rule.validate(nodes, edges, deviceData)
        allIssues.push(...ruleIssues)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        allIssues.push({
          id: `rule-error-${rule.id}`,
          type: 'error',
          message: `分析规则 "${rule.name}" 执行出错: ${message}`,
        })
      }
    }
    this.issues = allIssues
    eventBus.emit('topology.validated', { issues: allIssues })
    return allIssues
  }

  getIssues(): ValidationIssue[] {
    return [...this.issues]
  }

  getRules(): ValidationRule[] {
    return [...this.rules]
  }
}

export const topologyValidator = new TopologyValidator(getDefaultValidationRules())
