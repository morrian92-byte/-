// 主面板 UI — 渲染核心界面

const Dashboard = {
    actionPointsRemaining: 3,
    selectedActions: [],

    refresh() {
        this.updateTopBar();
        this.updateResources();
        this.updateProjects();
        this.updatePromotion();
        this.updateNPCs();
        this.updateEventFeed();
        this.updateActions();
        this.updateEndMonthButton();
    },

    updateTopBar() {
        document.getElementById('date-display').textContent = TimeSystem.dateString;
        document.getElementById('era-display').textContent = TimeSystem.era;
        document.getElementById('name-display').textContent = GameState.playerName || '张三';
        // 岗位（级别）格式 — 显示县镇级地点 + 岗位
        // 从完整地址中提取县镇级：去掉省和市，"江海省通阳市临溪县青石镇" → "临溪县青石镇"
        const loc = GameState.playerLocation || '';
        let shortLoc = loc.replace(/^.+省/, '').replace(/^.+?市/, '');
        if (!shortLoc) shortLoc = loc; // fallback
        const pos = GameState.playerPosition || '';
        const rank = GameState.playerRank;
        const display = pos ? `${shortLoc}·${pos}（${rank}）` : rank;
        document.getElementById('rank-display').textContent = display;
        document.getElementById('age-display').textContent = TimeSystem.playerAge;
        document.getElementById('term-warning').classList.toggle('hidden', !TimeSystem.isTermEnding);
    },

    updateResources() {
        document.getElementById('val-performance').textContent = ResourceSystem.performance;
        document.getElementById('val-connections').textContent = ResourceSystem.connections;
        document.getElementById('val-budget').textContent = ResourceSystem.budget;

        const status = ResourceSystem.getPerformanceStatus();
        const statusEl = document.getElementById('status-performance');
        statusEl.textContent = status.label;
        statusEl.className = 'res-status ' + status.cls;
    },

    updateProjects() {
        const list = document.getElementById('project-list');
        if (ProjectSystem.activeProjects.length === 0) {
            list.innerHTML = Illustrations.emptyProjects() + '<div style="color:var(--text-light);font-size:12px;text-align:center">暂无项目 · 开始你的第一个政务工程</div>';
            return;
        }
        list.innerHTML = ProjectSystem.activeProjects.map(p => {
            const pct = Math.round((p.progress / p.duration) * 100);
            return `<div class="project-item">
                <div class="project-name">${p.name}</div>
                <div class="project-bar"><div class="project-bar-fill" style="width:${pct}%"></div></div>
                <div style="font-size:10px;color:var(--text-secondary)">${p.progress}/${p.duration}月 · ${p.costPerMonth}💰/月</div>
            </div>`;
        }).join('');
    },

    updateNPCs() {
        const list = document.getElementById('npc-list');
        const npcs = NPCPool.npcs.slice(0, 6); // Top 6
        list.innerHTML = npcs.map(n => {
            const att = RelationshipSystem.get(n.id);
            const attInfo = RelationshipSystem.getAttitudeLabel(att);
            const initial = n.name.charAt(0);
            return `<div class="npc-item" onclick="Dashboard.showNPCDetail('${n.id}')">
                <div style="display:flex;align-items:center;gap:8px">
                    <span class="npc-avatar">${initial}</span>
                    <div>
                        <div>${n.name} <span style="font-size:11px;color:var(--text-secondary)">${n.position}</span></div>
                    </div>
                </div>
                <span class="npc-attitude ${attInfo.cls}">${attInfo.label} ${att}</span>
            </div>`;
        }).join('');
    },

    updateEventFeed() {
        const feed = document.getElementById('event-feed');
        const recent = EventSystem.eventHistory.slice(-8).reverse();
        if (recent.length === 0) {
            feed.innerHTML = Illustrations.emptyEvents() + '<div style="color:var(--text-light);font-size:12px;text-align:center">暂无事件 · 岁月静好</div>';
            return;
        }
        feed.innerHTML = recent.map(e => {
            const optLabel = e.options[e.chosenOption] ? e.options[e.chosenOption].label : '?';
            return `<div class="event-log-item">📌 ${e.title} → ${optLabel}</div>`;
        }).join('');
    },

    updateActions() {
        const pointsEl = document.getElementById('action-points');
        pointsEl.textContent = `剩余 ${this.actionPointsRemaining} 点`;

        const eventBtn = document.getElementById('btn-events');
        const eventCount = EventSystem.pendingEvents.length;
        document.getElementById('event-count').textContent = eventCount;
        // 事件按钮始终可用（不受行动点限制），只要有待处理事件
        if (eventCount > 0) {
            eventBtn.classList.remove('disabled');
            eventBtn.disabled = false;
        } else {
            eventBtn.classList.add('disabled');
            eventBtn.disabled = true;
        }

        // 灰色操作按钮显示风险等级
        const grayBtn = document.querySelector('[data-action="gray-ops"]');
        if (grayBtn) {
            const risk = GrayZoneSystem.riskLevel;
            let riskLabel = '安全';
            if (risk > 30) riskLabel = '⚠ 中危';
            if (risk > 60) riskLabel = '🚨 高危';
            grayBtn.textContent = `🕶️ 灰色操作 (搞钱) [风险:${riskLabel} ${Math.round(risk)}]`;
        }

        // 统一处理所有行动按钮的启用/禁用状态
        const buttons = document.querySelectorAll('.btn-action');
        buttons.forEach(b => {
            if (b.id !== 'btn-events') {
                b.disabled = this.actionPointsRemaining <= 0;
                if (this.actionPointsRemaining <= 0) b.classList.add('disabled');
                else b.classList.remove('disabled');
            }
        });
    },

    updateEndMonthButton() {
        const btn = document.getElementById('btn-end-month');
        btn.disabled = !TimeSystem.canEndMonth();
        if (!TimeSystem.canEndMonth()) {
            btn.textContent = TimeSystem.state === 'CRISIS_PAUSED'
                ? '⚠ 请先处理危机事件'
                : '📅 结算中...';
        } else {
            btn.textContent = '📅 结束本月 →';
        }
    },

    updatePromotion() {
        const currentRank = RankDB.getRankByName(GameState.playerRank);
        if (!currentRank) return;

        const nextRank = RankDB.getNextRank(currentRank.id);
        if (!nextRank) {
            document.getElementById('next-rank-name').textContent = '已到顶';
            document.getElementById('promotion-checks').innerHTML =
                '<div style="color:var(--accent-gold);font-size:12px">已是最高级别</div>';
            return;
        }

        document.getElementById('next-rank-name').textContent = nextRank.name + '（' + nextRank.tier + '）';
        const reqs = RankDB.getPromotionRequirements(currentRank.id);
        if (!reqs) return;

        const yearsInRank = TimeSystem.yearsAtCurrentRank;
        const perf = ResourceSystem.performance;
        const superiors = NPCPool.npcs.filter(n => {
            const r = RankDB.getRankByName(n.rank);
            return r && r.id > currentRank.id;
        });
        const maxAtt = superiors.length > 0
            ? Math.max(...superiors.map(s => RelationshipSystem.get(s.id)))
            : 0;

        // PPI预览：显示该级别的岗位范围
        const rankPositions = PositionDB.flattenRank(nextRank.name, GameState.playerLocation || '');
        const maxPPI = rankPositions.length > 0 ? Math.max(...rankPositions.map(p => p.ppi)) : 0;
        const minPPI = rankPositions.length > 0 ? Math.min(...rankPositions.map(p => p.ppi)) : 0;

        const hasVac = PositionRegistry.hasVacancy(nextRank.name);
        const windowLeft = RankDB.windowYearsRemaining(currentRank.id, TimeSystem.playerAge);
        const ageOk = TimeSystem.playerAge >= nextRank.minAge;
        const checks = [
            { label: `年限达标：${yearsInRank}/${reqs.minYears}年`, ok: yearsInRank >= reqs.minYears },
            { label: `政绩过线：${perf}/${reqs.perfLine}`, ok: perf >= reqs.perfLine },
            { label: `上级支持：${maxAtt}/${reqs.attLine}`, ok: maxAtt >= reqs.attLine },
            { label: `职位空缺：${hasVac ? '有空缺' : '暂无空缺'}`, ok: hasVac },
        ];
        if (nextRank.minAge > 0 && !ageOk) {
            checks.push({ label: `年龄限制：${TimeSystem.playerAge}/${nextRank.minAge}岁`, ok: false });
        }
        // 窗口警告
        if (windowLeft <= 3 && windowLeft >= 0) {
            checks.push({ label: `⚠ 晋升窗口：仅剩 ${windowLeft} 年`, ok: true });
        }
        if (reqs.partyReq) {
            checks.push({
                label: `党委身份：${GameState.playerPartyPosition || '无'}/${reqs.partyReq}`,
                ok: GameState.playerPartyPosition === reqs.partyReq,
            });
        }

        document.getElementById('promotion-checks').innerHTML = `
            ${checks.map(c => {
                const icon = c.ok ? '✅' : '❌';
                const cls = c.ok ? 'promo-check ok' : 'promo-check fail';
                return `<div class="${cls}"><span class="icon">${icon}</span>${c.label}</div>`;
            }).join('')}
            <div style="font-size:10px;color:var(--text-secondary);margin-top:4px;padding-top:4px;border-top:1px solid var(--border)">
                可选岗位PPI范围：⭐${minPPI.toFixed(1)} ~ ${maxPPI.toFixed(1)} · ${rankPositions.length}个岗位
            </div>
        `;
    },

    showNPCDetail(npcId) {
        const npc = NPCPool.getNPC(npcId);
        if (!npc) return;
        const att = RelationshipSystem.get(npcId);
        const attInfo = RelationshipSystem.getAttitudeLabel(att);
        alert([
            `${npc.name} (${npc.age}岁)`,
            `岗位: ${npc.position}`,
            `职级: ${npc.rank}`,
            `党派: ${npc.party}`,
            `性格: ${npc.personality.join('、')}`,
            `能力: ${npc.competence}/10  野心: ${npc.ambition}/10`,
            `腐败容忍度: ${npc.corruptionTolerance}/10`,
            `态度: ${attInfo.label} (${att})`,
            `仕途天花板: ${npc.ceilingRank}`,
        ].join('\n'));
    },
};
