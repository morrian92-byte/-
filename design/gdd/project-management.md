# 项目管理系统

> **Status**: In Design | **Layer**: `Core` | **Priority**: `MVP` | **Deps**: `时间系统`, `资源系统`
> **Pillar**: 权力是积累的（项目是政绩积累的主要途径）

## Overview

项目管理系统定义玩家可以推进的政务项目——修路、招商、扶贫、创卫——以及它们的生命周期。每个项目有多回合的进度条，完成后产出政绩、人脉和财力回报。未完成的项目在考核时变成扣分项。

## Detailed Design

### 项目属性

| 属性 | 类型 | 说明 |
|------|------|------|
| name | string | 项目名称（如"工业园区道路硬化工程"） |
| category | enum | 基础设施/招商引资/民生/教育/维稳/党建 |
| duration | int | 所需月数（3-12个月） |
| progress | int | 当前进度（0 到 duration） |
| cost_per_month | int | 每月财力消耗 |
| total_cost | int | 总财力投入 |
| reward_performance | int | 完成时政绩奖励 |
| reward_connections | int | 完成时人脉奖励 |
| penalty | int | 超期/失败时政绩惩罚 |
| status | enum | 待启动/进行中/已完成/已超期/已放弃 |

### 每月推进

```
每月 tick:
  for each active project:
    progress += 1 + bonus (如果投入额外资源)
    budget -= cost_per_month
    if progress >= duration: 标记为完成，发放奖励
    if 超期 > 3个月: 触发负面事件
```

### 项目类别（MVP）

| 类别 | 典型项目 | 工期 | 政绩回报 | 特殊效果 |
|------|---------|------|---------|---------|
| 基础设施 | 修路、供水、电网 | 6-12月 | 高 | 提升 GDP 和民生 |
| 招商引资 | 引进企业、建园区 | 4-8月 | 很高 | 大幅提升财力 |
| 民生 | 扶贫、教育、医疗 | 3-6月 | 中 | 降低信访风险 |
| 维稳 | 信访化解、安全整治 | 1-3月 | 低但必须做 | 不做出事扣分很重 |
| 党建 | 学习活动、组织建设 | 1-2月 | 低 | 对执政党成员是必修课 |

MVP 共 8-12 个项目模板。

## Formulas

```
project_reward_performance = base_reward * completion_quality_multiplier
// quality_multiplier: 按时完成=1.0, 提前完成=1.3, 轻微超期=0.7

monthly_budget_drain = sum(all_active_projects.cost_per_month)
```

## Edge Cases

- 财力不足以支付所有项目：低优先级项目暂停
- 同时推进 5+ 个项目：效率惩罚 -20%
- 放弃项目：政绩 -5 + 已投入财力的30%浪费

## Dependencies

| 方向 | 系统 |
|------|------|
| 上行 | 时间系统（tick）、资源系统（budget消耗） |
| 下行 | 考核系统（项目完成率）、事件系统（项目相关事件）、UI |
