# Systems Index: 步步高升

> **Status**: Draft
> **Created**: 2026-06-09
> **Last Updated**: 2026-06-09
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

《步步高升》是一个以现代中国官场为背景的策略模拟游戏。它的机械核心围绕四个维度展开：**时间驱动的月度经营**、**NPC 关系网络**、**系统生成的事件**、以及**真实职级体系下的晋升博弈**。

24 个系统覆盖了从时间节拍器到党政双轨的完整官场模拟。按照三大游戏支柱——权力积累、关系即游戏、灰色即深度——每个系统都服务于让玩家「对权力上瘾」的核心幻想。

MVP（乡镇人生）包含 14 个系统，从基础的时间系统和职级数据库，到核心的月度经营和事件系统，再到基础 UI——足以支撑一个完整的「副科→正科、5年仕途」的可玩体验。

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | 时间系统 | Base | MVP | In Design | [design/gdd/time-system.md](time-system.md) | — |
| 2 | 职级数据库 | Base | MVP | In Design | [design/gdd/rank-database.md](rank-database.md) | — |
| 3 | 数据持久化 | Base | MVP | In Design | [design/gdd/data-persistence.md](data-persistence.md) | — |
| 4 | 资源系统 | Core | MVP | In Design | [design/gdd/resource-system.md](resource-system.md) | 1 |
| 5 | 月度经营系统 | Core | MVP | In Design | — | 1, 4 |
| 6 | NPC 系统 | Core | MVP | In Design | [design/gdd/npc-system.md](npc-system.md) | 2, 3 |
| 7 | 关系网络系统 | Core | MVP | In Design | — | 1, 6 |
| 8 | 事件系统 | Core | MVP | In Design | — | 1, 4, 6 |
| 9 | 项目管理系统 | Core | MVP | In Design | — | 1, 4 |
| 10 | 考核系统 | Core | MVP | In Design | — | 1, 4, 9 |
| 11 | 晋升系统 | Feature | MVP | In Design | — | 2, 7, 10 |
| 12 | 灰色地带系统 | Feature | MVP | In Design | — | 4, 6, 8 |
| 13 | 主面板 UI | UI | MVP | In Design | — | 5, 4 |
| 14 | 事件面板 UI | UI | MVP | In Design | — | 8 |
| 15 | 关系网络 UI | UI | Vertical Slice | In Design | — | 7, 6 |
| 16 | 通知系统 | UI | Vertical Slice | In Design | — | 8, 10, 7 |
| 17 | 巡视/调查系统 | Feature | Vertical Slice | In Design | — | 8, 12, 6 |
| 18 | 破格提拔系统 | Feature | Vertical Slice | In Design | — | 11, 7, 8 |
| 19 | 新手引导系统 | Meta | Vertical Slice | In Design | — | 5, 13 |
| 20 | 派系系统 | Feature | Alpha | In Design | — | 6, 7 |
| 21 | 仕途档案 UI | UI | Alpha | In Design | — | 3, 10, 11 |
| 22 | 成就系统 | Meta | Alpha | In Design | — | 3, 10, 11, 12 |
| 23 | 党派系统 | Feature | Full Vision | In Design | — | 2, 6, 11 |
| 24 | 党政双轨系统 | Feature | Full Vision | In Design | — | 2, 11, 23 |

---

## Categories

| Category | Description | Systems |
|----------|-------------|---------|
| **Base** | 基础层——所有系统的底层支撑，零依赖 | 时间系统、职级数据库、数据持久化 |
| **Core** | 核心层——驱动核心循环的引擎系统 | 资源系统、月度经营、NPC、关系网络、事件、项目管理、考核 |
| **Feature** | 功能层——在核心层之上构建的游戏机制 | 晋升、破格提拔、灰色地带、巡视/调查、派系、党派、党政双轨 |
| **UI** | 表现层——玩家能看到和交互的界面 | 主面板、事件面板、关系网络UI、仕途档案、通知系统 |
| **Meta** | 润色层——非核心循环但提升体验的系统 | 新手引导、成就系统 |

---

## Priority Tiers

| Tier | Definition | Systems Count |
|------|------------|---------------|
| **MVP** | 乡镇人生——副科到正科，5年，60个月。验证核心循环是否上瘾 | 14 |
| **Vertical Slice** | 县乡通——扩展到县级，加入破格提拔和调查系统，完整关系可视化 | +5 (19 total) |
| **Alpha** | 全仕途骨架——科员到厅级完整职级，派系系统就位，内容待填充 | +3 (22 total) |
| **Full Vision** | 完整版——科员到国家级，三党派路线，党政双轨，全部内容就位 | +2 (24 total) |

---

## Dependency Map

### Foundation Layer (no dependencies)

1. **时间系统** — 月份推进、年份流转、游戏时钟。所有系统的节拍器。逻辑简单但被依赖数最高（10+）。
2. **职级数据库** — 科员→正国的完整职级定义、每级门槛、岗位属性。MVP 阶段只需副科和正科两条记录。
3. **数据持久化** — 存档/读档、状态序列化。支柱一「权力是积累的」的技术保障。

### Core Layer (depends on foundation)

4. **资源系统** — depends on: 1 (时间)
   政绩、人脉、财力三个核心资源的产出公式、消耗逻辑、上限/下限规则。

5. **月度经营系统** — depends on: 1, 4
   核心循环的引擎——每月选择推进的政务、维护的关系、应对的事件。驱动所有其他核心系统。

6. **NPC 系统** — depends on: 2, 3
   NPC 实例生成、属性定义（职位/性格/立场/背景）、生命周期管理。MVP 阶段 8-12 个 NPC。

7. **关系网络系统** — depends on: 1, 6
   NPC 对玩家的态度计算、态度随时间衰减/增强、关系对信息获取和机会的影响。支柱二的实现。

8. **事件系统** — depends on: 1, 4, 6
   事件模板库、触发条件判定（基于时间/资源/NPC/关系）、参数化生成、事件链。MVP 阶段 10-15 个模板。

9. **项目管理系统** — depends on: 1, 4
   政务项目的创建、进度追踪（多回合）、完成后果（资源变化、关系变化）、延期/放弃惩罚。

10. **考核系统** — depends on: 1, 4, 9
    月度小考核、季度汇总、年度大考核——指标计算、评级生成、问责触发。输出为晋升系统的输入。

### Feature Layer (depends on core)

11. **晋升系统** — depends on: 2, 7, 10
    常规晋升判定——指标过线 + 关系支持 + 职位空缺 → 晋升。晋升后触发管辖范围扩展和新系统解锁。MVP 阶段只做副科→正科一级。

12. **灰色地带系统** — depends on: 4, 6, 8
    腐败机会生成（环境参数决定风险等级）、利益/代价计算、暴露概率。支柱三的实现。

### UI Layer (depends on core + features)

13. **主面板 UI** — depends on: 5, 4
    月度经营主界面——资源概览、待办政务列表、关系摘要、项目进度。

14. **事件面板 UI** — depends on: 8
    事件弹出窗口——事件描述、2-4 个选项、选项后果预览、选择确认。

### Vertical Slice systems (post-MVP)

15. **关系网络 UI** — depends on: 7, 6
    可视化 NPC 关系图——节点+连线、态度颜色编码、悬停详情。

16. **通知系统** — depends on: 8, 10, 7
    结构化消息推送——事件通知、关系变化提醒、考核结果告知。

17. **巡视/调查系统** — depends on: 8, 12, 6
    巡视组/纪检/审计的触发逻辑、调查流程、后果判定。

18. **破格提拔系统** — depends on: 11, 7, 8
    稀有快速晋升——三条件（政绩极突出 + 关键人物力推 + 刚好有空缺）齐备时触发。

19. **新手引导系统** — depends on: 5, 13
    前 3 个月的渐进式教学——功能逐步解锁，首次操作有提示。

### Alpha systems

20. **派系系统** — depends on: 6, 7
    NPC 归属派系、派系间博弈、站队的利弊。

21. **仕途档案 UI** — depends on: 3, 10, 11
    职业生涯全景回顾——履历时间线、关键决策记录、统计数据可视化。

22. **成就系统** — depends on: 3, 10, 11, 12
    里程碑触发和记录——「第一次晋升」「第一次被举报」「破格提拔」等。

### Full Vision systems

23. **党派系统** — depends on: 2, 6, 11
    执政党/民主党派/无党派的选择机制、加入条件、各自优势和代价。

24. **党政双轨系统** — depends on: 2, 11, 23
    行政岗位+党委岗位的并行职级、兼任规则、双线晋升判定。

---

## Recommended Design Order

| Order | System | Priority | Layer | Est. Effort |
|-------|--------|----------|-------|-------------|
| 1 | 时间系统 | MVP | Base | S |
| 2 | 职级数据库 | MVP | Base | S |
| 3 | 数据持久化 | MVP | Base | S |
| 4 | 资源系统 | MVP | Core | S |
| 5 | NPC 系统 | MVP | Core | M |
| 6 | 月度经营系统 | MVP | Core | M |
| 7 | 关系网络系统 | MVP | Core | M |
| 8 | 项目管理系统 | MVP | Core | S |
| 9 | 事件系统 | MVP | Core | L |
| 10 | 考核系统 | MVP | Core | M |
| 11 | 晋升系统 | MVP | Feature | M |
| 12 | 灰色地带系统 | MVP | Feature | M |
| 13 | 主面板 UI | MVP | UI | M |
| 14 | 事件面板 UI | MVP | UI | S |
| 15-19 | *(Vertical Slice systems)* | VS | — | — |
| 20-22 | *(Alpha systems)* | Alpha | — | — |
| 23-24 | *(Full Vision systems)* | Full | — | — |

**Effort**: S = 1 会话, M = 2-3 会话, L = 4+ 会话。一个"会话"指一次聚焦的设计对话产出一份完整 GDD。

---

## Circular Dependencies

- **None found.** 所有系统依赖为单向。事件系统读取关系状态作为触发条件（单向），事件产生的关系变化作为输出（单向），不形成循环。

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| 关系网络系统 (#7) | Design | NPC 态度计算的复杂度容易失控——态度维度太多导致难以调试和平衡 | MVP 用简单的数值模型（-100到+100），不做多维度态度 |
| 事件系统 (#8) | Scope | 事件模板数量和质量是游戏可玩性的关键，但手写事件内容量大 | 系统参数化生成——少量模板+参数组合产生活多变体验 |
| 晋升系统 (#11) | Design | 晋升节奏太慢→玩家枯燥，太快→不够真实。平衡点难找 | MVP 只有一级晋升（副科→正科），数据驱动门槛参数 |
| 灰色地带系统 (#12) | Design | 「不做道德审判」可能被误解为鼓励腐败——需要微妙的后果设计 | 所有腐败选择都有对应的风险和反噬，不出现「免费午餐」 |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 24 |
| Design docs started | 0 |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 0 / 14 |
| Vertical Slice systems designed | 0 / 5 |
| Not started | 24 / 24 |

---

## Next Steps

- [x] Systems enumeration complete
- [x] Dependency mapping complete
- [x] Priority assignment complete
- [ ] Design MVP Base-layer systems first — start with #1 时间系统
- [ ] Run `/design-review` on each completed GDD
- [ ] Run `/gate-check systems-design` when MVP GDDs are complete
- [ ] Validate highest-risk systems (关系网络, 事件, 灰色地带) with prototype before full implementation
