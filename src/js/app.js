// 步步高升 — 主控制器

const GameState = {
    playerName: '张三',
    playerRank: '办事员',
    playerParty: '无党派',
    playerPartyPosition: null,
    playerPosition: '党政办科员',
    playerProfile: '综合',
    playerLocation: '江海省通阳市临溪县青石镇',
    proteges: [], // 亲信列表 [npc_id, ...]
};

// 主题切换（预留——后续版本部门绑定激活）
function switchTheme(theme) {
    document.body.setAttribute('data-theme', theme);
}
// 默认红色
switchTheme('red');

// ====== 引导入口 ======
function continueCareer() {
    const slots = Persistence.getAllSlots();
    const available = Object.entries(slots).filter(([, info]) => info !== null);
    if (available.length === 0) {
        document.getElementById('entry-save-hint').textContent = '⚠ 没有找到存档，请开启新的政治生命';
        return;
    }

    // 找最近的存档
    let bestKey = null, bestTime = '';
    available.forEach(([key, info]) => {
        if (info.time > bestTime) { bestTime = info.time; bestKey = key; }
    });

    if (bestKey !== null && confirm(`找到存档：${slots[bestKey].name}\n${slots[bestKey].date} · ${slots[bestKey].rank}\n\n加载此存档？`)) {
        const result = Persistence.load(parseInt(bestKey) || bestKey);
        if (result.success) {
            document.getElementById('onboarding-overlay').style.display = 'none';
            Dashboard.actionPointsRemaining = 3;
            Dashboard.refresh();
            return;
        }
    }
    alert('加载失败，请开启新的政治生命。');
}

function startNewCareer() {
    document.getElementById('onboard-step-entry').classList.add('hidden');
    document.getElementById('onboard-step-name').classList.remove('hidden');
}

// ====== 考公引导流程 ======
let _examState = { currentQ: 0, answers: [], totalScore: 0, locked: false };
let _interviewLocked = false;

function startExam() {
    const nameInput = document.getElementById('input-player-name');
    const name = nameInput.value.trim() || '张三';
    const gender = document.getElementById('input-player-gender').value;
    GameState.playerName = name;
    GameState.playerGender = gender;

    document.getElementById('onboard-step-name').classList.add('hidden');
    document.getElementById('onboard-step-exam').classList.remove('hidden');
    _examState = { currentQ: 0, answers: [], totalScore: 0, locked: false };
    showExamQuestion();
}

function showExamQuestion() {
    const q = ExamSystem.questions[_examState.currentQ];
    document.getElementById('exam-progress').textContent = `(${_examState.currentQ + 1}/${ExamSystem.questions.length})`;
    document.getElementById('exam-question').textContent =
        `【${q.type}】${q.q}`;
    document.getElementById('exam-options').innerHTML = q.options.map((opt, i) => `
        <div class="event-option" onclick="answerExamQuestion(${i})" style="text-align:left">
            ${opt.label}
        </div>
    `).join('');
}

function answerExamQuestion(optIndex) {
    if (_examState.locked) return; // 防止连点
    _examState.locked = true;

    const q = ExamSystem.questions[_examState.currentQ];
    const opt = q.options[optIndex];
    _examState.answers.push({ q: _examState.currentQ, choice: optIndex, score: opt.score });
    _examState.totalScore += opt.score;

    // Flash
    document.querySelectorAll('#exam-options .event-option').forEach((el, i) => {
        el.style.opacity = i === optIndex ? '1' : '0.3';
        if (i === optIndex) el.style.borderColor = 'var(--accent-gold)';
    });

    _examState.currentQ++;
    if (_examState.currentQ >= ExamSystem.questions.length) {
        setTimeout(showExamResult, 500);
    } else {
        setTimeout(() => { _examState.locked = false; showExamQuestion(); }, 400);
    }
}

function showExamResult() {
    const score = _examState.totalScore;
    const maxScore = ExamSystem.questions.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0);
    const pct = Math.round((score / maxScore) * 100);
    const tier = ExamSystem.getTier(pct);

    document.getElementById('onboard-step-exam').classList.add('hidden');
    document.getElementById('onboard-step-result').classList.remove('hidden');

    document.getElementById('exam-score-display').innerHTML = `
        <div style="font-size:48px;color:${pct >= 75 ? 'var(--accent-gold)' : pct >= 60 ? 'var(--accent-green)' : 'var(--text-primary)'}">
            ${pct}分
        </div>
        <div style="font-size:16px;color:var(--accent-gold);margin-top:4px">${tier.label}</div>
    `;

    document.getElementById('exam-tier-desc').textContent = tier.desc;

    // 省份选择
    const provDiv = document.getElementById('province-choices');
    provDiv.innerHTML = tier.provinces.map(p => `
        <div class="inline-option" onclick="selectOnboardProvince('${p}')" data-prov="${p}">
            ⭐ ${p} — ${LocationDB.provinces[p].tier}
        </div>
    `).join('');

    // 默认选第一个省份
    _examState.selectedProvince = tier.provinces[0];
    _examState.scorePct = pct;
    _examState.scoreTier = tier;
    updateOnboardPositions();
}

function selectOnboardProvince(prov) {
    _examState.selectedProvince = prov;
    document.querySelectorAll('#province-choices .inline-option').forEach(el => {
        el.style.borderColor = el.dataset.prov === prov ? 'var(--accent-gold)' : 'var(--border)';
        el.style.background = el.dataset.prov === prov ? 'var(--bg-tertiary)' : 'var(--bg-secondary)';
    });
    updateOnboardPositions();
}

function updateOnboardPositions() {
    const prov = _examState.selectedProvince;
    const score = _examState.scorePct;
    const result = ExamSystem.getStartOptions(score, prov);
    if (!result) return;

    _examState.startLocation = result.fullLocation;
    _examState.startCounty = result.county;
    _examState.startTown = result.town;
    _examState.startProvince = result.province;

    const posDiv = document.getElementById('position-choices');
    posDiv.innerHTML = result.positions.map((p, i) => `
        <div class="inline-option" onclick="selectOnboardPosition(${i})" data-pos="${i}">
            ${p.ppiHint} ${p.name} · ${p.dept} · ${p.profile}型
        </div>
    `).join('');

    // 默认选第一个
    _examState.selectedPosition = result.positions[0];
    if (result.positions.length > 0) {
        const el = posDiv.querySelector(`[data-pos="0"]`);
        if (el) { el.style.borderColor = 'var(--accent-gold)'; el.style.background = 'var(--bg-tertiary)'; }
    }
}

function selectOnboardPosition(index) {
    const result = ExamSystem.getStartOptions(_examState.scorePct, _examState.selectedProvince);
    if (!result) return;
    _examState.selectedPosition = result.positions[index];
    document.querySelectorAll('#position-choices .inline-option').forEach(el => {
        el.style.borderColor = el.dataset.pos == index ? 'var(--accent-gold)' : 'var(--border)';
        el.style.background = el.dataset.pos == index ? 'var(--bg-tertiary)' : 'var(--bg-secondary)';
    });
}

function confirmOnboarding() {
    try {
    const pos = _examState.selectedPosition;
    if (!pos) return;

    document.getElementById('onboarding-overlay').style.display = 'none';
    initGame({
        name: GameState.playerName,
        name: GameState.playerName,
        gender: GameState.playerGender,
        province: _examState.startProvince,
        location: _examState.startLocation,
        position: pos.name,
        profile: pos.profile,
        examScore: _examState.scorePct,
        examTier: _examState.scoreTier.label,
    });
    } catch(err) {
        alert('[考公入职出错] ' + err.message);
    }
}

// ====== 初始化 ======
function initGame(opts = {}) {
    TimeSystem.init('新时代', 2022);
    NPCPool.init();
    PositionRegistry.init(); // NPC 初始化后注册岗位占用
    ResourceSystem.init();
    RelationshipSystem.init();
    ProjectSystem.init();
    EventSystem.init();
    EvaluationSystem.init();
    GrayZoneSystem.init();
    PromotionSystem.init ? PromotionSystem.init() : null;

    GameState.playerName = opts.name || '张三';
    GameState.playerGender = opts.gender || '男';
    GameState.playerRank = '办事员';
    GameState.playerParty = '无党派';
    GameState.playerPartyPosition = null;
    GameState.playerLocation = opts.location || LocationDB.playerStart.full;
    GameState.playerPosition = opts.position || '党政办科员';
    GameState.playerProfile = opts.profile || '综合';
    GameState.examScore = opts.examScore || 60;
    GameState.examTier = opts.examTier || '合格';

    // 注册玩家初始岗位占用
    PositionRegistry.occupyPosition(GameState.playerRank, GameState.playerPosition, 'player');

    Dashboard.actionPointsRemaining = 3;
    Dashboard.selectedActions = [];

    Dashboard.refresh();
}

// ====== 月推进 ======
function endMonth() {
    try {
    if (!TimeSystem.canEndMonth()) return;

    // Trigger monthly tick on all systems
    const projectResult = ProjectSystem.monthlyTick();
    const resourceResult = ResourceSystem.monthlyTick(ProjectSystem.activeProjects.length);
    const relChanges = RelationshipSystem.monthlyTick();
    const eventResult = EventSystem.monthlyTick();
    const grayResult = GrayZoneSystem.monthlyTick();
    const vacancyEvents = PositionRegistry.monthlyTick();

    // Log vacancy events
    vacancyEvents.forEach(evt => {
        const npc = NPCPool.getNPC(evt.npcId);
        EventSystem.eventHistory.push({
            id: 'vacancy_' + evt.npcId + '_' + TimeSystem.totalMonths,
            title: `📌 ${npc ? npc.name : '某人'}${evt.reason}`,
            body: `${evt.rank}级岗位「${evt.position}」因${evt.reason}出现空缺。`,
            options: [{ label: '确认', effects: {} }],
            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
        });
    });

    // Log salary and income
    if (resourceResult) {
        EventSystem.eventHistory.push({
            id: 'salary_' + TimeSystem.totalMonths,
            title: `本月收支`,
            body: `工资 +${resourceResult.salary} | 财政拨款 +${resourceResult.budgetIncome} | 项目支出 -${projectResult.totalCost} | 人脉衰减 ${resourceResult.connectionsDecay}`,
            options: [{ label: '确认', effects: {} }],
            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
        });
    }

    // Log completed projects
    if (projectResult.completed && projectResult.completed.length > 0) {
        projectResult.completed.forEach(p => {
            EventSystem.eventHistory.push({
                id: 'proj_done_' + p.id,
                title: `🎉 项目完成：${p.name}`,
                body: `政绩+${p.rewardPerf} 人脉+${p.rewardConn}`,
                options: [{ label: '确认', effects: { perf: p.rewardPerf, conn: p.rewardConn } }],
                chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
            });
        });
    }

    // Log gray exposure
    if (grayResult && grayResult.exposed) {
        EventSystem.eventHistory.push({
            id: 'exposure_' + TimeSystem.totalMonths,
            title: '⚠ 灰色操作暴露！',
            body: `你的灰色操作被察觉了！政绩 ${grayResult.perfPenalty}（第${grayResult.totalExposures}次暴露）`,
            options: [{ label: '确认', effects: { perf: grayResult.perfPenalty } }],
            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
        });
    }

    // Evaluation
    EvaluationSystem.monthlyEval();
    EvaluationSystem.quarterlyEval();
    if (TimeSystem.month === 12) {
        const annualResult = EvaluationSystem.annualEval();
        if (annualResult) {
            EventSystem.eventHistory.push({
                id: 'annual_eval_' + TimeSystem.year,
                title: `年度考核：${TimeSystem.year}年`,
                category: '政务',
                body: `年度考核评级：${annualResult.rating}（${annualResult.total}分）`,
                options: [{ label: '确认', effects: {} }],
                chosenOption: 0,
                resolvedMonth: TimeSystem.totalMonths,
            });
        }
    }

    // Auto-save on year end
    if (TimeSystem.month === 1) {
        Persistence.autoSave();
    }

    // Advance time — save pre-resolve state for promotion check
    TimeSystem.advanceMonth();
    const postAdvanceState = TimeSystem.state; // YEAR_END or TERM_END
    TimeSystem.resolveState();

    // Update connections aggregate
    const agg = RelationshipSystem.computeConnectionsAggregate();
    ResourceSystem.connections = agg;

    // Reset actions
    Dashboard.actionPointsRemaining = 3;
    Dashboard.selectedActions = [];
    Dashboard.refresh();

    // Check promotion at year-end or term-end
    const promoCheck = PromotionSystem.checkEligibility();
    const willPromote = promoCheck && promoCheck.eligible;

    if (willPromote) {
        setTimeout(() => startPromotionInterview(promoCheck), 200);
    }

    // Check career end
    if (TimeSystem.state === 'CAREER_END') {
        alert(`🎉 仕途终结！你在${TimeSystem.dateString}退休，最终职级：${GameState.playerRank}。\n查看完整生涯回顾请点击仕途档案。`);
    }

    // Only show events if NOT promoting (avoid modal conflict)
    if (!willPromote && EventSystem.pendingEvents.length > 0) {
        EventPanel.showNextPending();
    }
    } catch(err) {
        alert('[结束本月出错] ' + err.message);
    }
}

// ====== 内联选择器 ======
function showInlineSelector(title, options) {
    document.getElementById('selector-title').textContent = title;
    const optsDiv = document.getElementById('selector-options');
    optsDiv.innerHTML = options.map((opt, i) => `
        <div class="inline-option" onclick="selectInlineOption(${i})">
            <div>${opt.label}</div>
            ${opt.sub ? `<div class="sub">${opt.sub}</div>` : ''}
            ${opt.cost ? `<div class="cost">💰 ${opt.cost}财力/月 · 政绩+${opt.rewardPerf || '?'}</div>` : ''}
        </div>
    `).join('');

    window._inlineOptions = options;
    window._inlineCallback = null;
    document.getElementById('inline-selector').classList.remove('hidden');
}

function selectInlineOption(index) {
    const opt = window._inlineOptions[index];
    if (!opt) return;

    // Highlight selection
    document.querySelectorAll('.inline-option').forEach((el, i) => {
        el.style.borderColor = i === index ? 'var(--accent-gold)' : 'var(--border)';
        el.style.background = i === index ? 'var(--bg-tertiary)' : 'var(--bg-secondary)';
    });

    // Execute after short delay for visual feedback
    setTimeout(() => {
        hideInlineSelector();
        if (opt.callback) opt.callback();
    }, 150);
}

function hideInlineSelector() {
    document.getElementById('inline-selector').classList.add('hidden');
    window._inlineOptions = [];
}

// ====== 行动处理 ======
function doAction(actionType) {
    try {
    // 处理事件不受行动点和危机状态限制
    if (actionType !== 'handle-event') {
        if (Dashboard.actionPointsRemaining <= 0) return;
        if (!TimeSystem.canEndMonth()) return;
    }

    switch (actionType) {
        case 'work': {
            const deptActs = DeptActions.getActions();
            const dept = DeptActions.getPlayerDept();

            // 有部门特色行动 → 展示选择面板
            if (dept && deptActs.length > 1) {
                showInlineSelector(
                    `📋 ${dept} · 本月工作（剩余 ${Dashboard.actionPointsRemaining} 点）`,
                    deptActs.map((act, i) => ({
                        label: act.label,
                        sub: act.desc + (act.bonus ? ` · ${act.bonus}` : ''),
                        cost: act.cost ? `消耗 ${act.cost} 财力` : '',
                        callback: () => {
                            consumeAction(act.label);
                            if (act.effects.perf) ResourceSystem.adjustPerformance(act.effects.perf);
                            if (act.effects.conn) ResourceSystem.adjustConnections(act.effects.conn);
                            if (act.effects.budget) ResourceSystem.adjustBudget(act.effects.budget);
                            if (act.cost) ResourceSystem.adjustBudget(-act.cost);

                            // bonus 效果
                            if (act.bonus && act.bonus.includes('灰色风险')) {
                                GrayZoneSystem.riskLevel = Math.max(0, GrayZoneSystem.riskLevel - 3);
                            }
                            if (act.bonus && act.bonus.includes('项目进度+1')) {
                                ProjectSystem.activeProjects.forEach(p => p.progress++);
                            }
                            if (act.bonus && act.bonus.includes('项目进度+2')) {
                                ProjectSystem.activeProjects.forEach(p => { p.progress += 2; });
                            }
                            if (act.bonus && act.bonus.includes('灰色机会')) {
                                if (Math.random() < 0.4) {
                                    const bizNPC = NPCPool.npcs.find(n => n.position.includes('老板') || n.position.includes('公司'));
                                    if (bizNPC) {
                                        EventSystem.pendingEvents.push({
                                            id: 'dept_gray_' + Date.now(),
                                            templateId: 'dept_gray_opp',
                                            title: '部门灰色机会',
                                            category: '灰色',
                                            body: `${bizNPC.name}通过你的工作关系找到你，暗示有一笔「好处费」。`,
                                            options: [
                                                { label: '拒绝', effects: { perf: 1 }, risk: 0 },
                                                { label: '收下', effects: { budget: 25, perf: -2 }, risk: 2, grayLevel: 1 },
                                            ],
                                        });
                                    }
                                }
                            }

                            EventSystem.eventHistory.push({
                                id: 'dept_work_' + Date.now(),
                                title: act.label,
                                body: `${dept}：${act.desc}`,
                                options: [{ label: '确认', effects: act.effects }],
                                chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                            });
                            Dashboard.refresh();
                        }
                    }))
                );
            } else {
                // 无部门特色 → 兜底通用工作
                consumeAction('常规工作');
                const perfGain = 1 + Math.floor(Math.random() * 2);
                ResourceSystem.adjustPerformance(perfGain);
                EventSystem.eventHistory.push({
                    id: 'work_' + Date.now(), title: '常规工作',
                    body: `完成了本月例行工作。政绩 +${perfGain}`,
                    options: [{ label: '确认', effects: { perf: perfGain } }],
                    chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                });
                Dashboard.refresh();
            }
            break;
        }

        case 'social': {
            const npcs = NPCPool.npcs
                .filter(n => n.rank !== '—' || n.position.includes('老板') || n.position.includes('支书'))
                .slice(0, 8);
            showInlineSelector('选择社交对象', npcs.map(n => {
                const att = RelationshipSystem.get(n.id);
                const attInfo = RelationshipSystem.getAttitudeLabel(att);
                return {
                    label: `${n.name} — ${n.position} (${attInfo.label} ${att})`,
                    sub: `性格：${n.personality.join('、')} | 职级：${n.rank}`,
                    callback: () => {
                        const cost = 5 + Math.floor(Math.random() * 16);
                        if (ResourceSystem.budget < cost) {
                            alert(`财力不足！需要至少 ${cost}，当前 ${ResourceSystem.budget}`);
                            return;
                        }
                        consumeAction('社交活动');
                        ResourceSystem.adjustBudget(-cost);
                        const result = RelationshipSystem.socialize(n.id, cost);
                        EventSystem.eventHistory.push({
                            id: 'social_' + Date.now(),
                            title: `与${n.name}社交`,
                            body: `请${n.name}吃饭，花费${cost}财力。态度 ${result.delta > 0 ? '+' : ''}${result.delta}`,
                            options: [{ label: '确认', effects: { budget: -cost, conn: result.delta } }],
                            chosenOption: 0,
                            resolvedMonth: TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                };
            }));
            break;
        }

        case 'push-project': {
            const activeProjs = ProjectSystem.activeProjects;
            const options = [];

            // Existing projects to push
            activeProjs.forEach(p => {
                options.push({
                    label: `➕ 加速推进：${p.name}`,
                    sub: `进度 ${p.progress}/${p.duration} | 本月自动+1，手动再+1`,
                    callback: () => {
                        consumeAction('推进项目');
                        const result = ProjectSystem.advanceProject(p.id);
                        if (result && result.completed) {
                            alert(`🎉 项目「${p.name}」完成！政绩+${result.rewards.perf} 人脉+${result.rewards.conn}`);
                        }
                        Dashboard.refresh();
                    }
                });
            });

            // New projects to start
            ProjectSystem.templates.forEach((t, i) => {
                options.push({
                    label: `🆕 启动新项目：${t.name}`,
                    sub: `${t.category} · ${t.duration}个月 · 政绩+${t.rewardPerf} 人脉+${t.rewardConn}`,
                    cost: `${t.costPerMonth}/月`,
                    rewardPerf: t.rewardPerf,
                    callback: () => {
                        consumeAction('启动项目');
                        ProjectSystem.startProject(i);
                        Dashboard.refresh();
                    }
                });
            });

            showInlineSelector(
                `项目操作（活跃 ${activeProjs.length} 个）`,
                options
            );
            break;
        }

        case 'gray-ops': {
            const grayOptions = [
                {
                    label: '报销多报几百',
                    sub: '轻微 · 财力+5~15 · 风险极低',
                    callback: () => {
                        const gain = 5 + Math.floor(Math.random() * 11);
                        ResourceSystem.adjustBudget(gain);
                        GrayZoneSystem.recordOperation(1, 1);
                        consumeAction('灰色操作');
                        EventSystem.eventHistory.push({
                            id: 'gray_' + Date.now(),
                            title: '报销多报',
                            body: `在公务报销中多报了一些，获得 ${gain} 财力。风险累积：${GrayZoneSystem.riskLevel}`,
                            options: [{ label: '确认', effects: { budget: gain } }],
                            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                },
                {
                    label: '收受购物卡/礼品',
                    sub: '中等 · 财力+15~40 · 风险低-中',
                    callback: () => {
                        const gain = 15 + Math.floor(Math.random() * 26);
                        ResourceSystem.adjustBudget(gain);
                        GrayZoneSystem.recordOperation(2, 2);
                        consumeAction('灰色操作');
                        EventSystem.eventHistory.push({
                            id: 'gray_' + Date.now(),
                            title: '收受礼品',
                            body: `收下了一张购物卡和两瓶好酒，折合 ${gain} 财力。风险累积：${GrayZoneSystem.riskLevel}`,
                            options: [{ label: '确认', effects: { budget: gain } }],
                            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                },
                {
                    label: '工程关照——暗示承包商给回扣',
                    sub: '严重 · 财力+50~150 · 风险中-高 · 需要人脉≥40',
                    callback: () => {
                        if (ResourceSystem.connections < 40) {
                            alert(`人脉不足！需要 ≥40，当前 ${ResourceSystem.connections}`);
                            return;
                        }
                        const gain = 50 + Math.floor(Math.random() * 101);
                        ResourceSystem.adjustBudget(gain);
                        GrayZoneSystem.recordOperation(3, 3);
                        consumeAction('灰色操作');
                        EventSystem.eventHistory.push({
                            id: 'gray_' + Date.now(),
                            title: '工程回扣',
                            body: `在项目招标中关照了关系户，收到 ${gain} 财力回扣。风险大幅累积：${GrayZoneSystem.riskLevel}`,
                            options: [{ label: '确认', effects: { budget: gain } }],
                            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                },
                {
                    label: '倒卖审批指标',
                    sub: '极严重 · 财力+200~500 · 风险极高 · 需要人脉≥60',
                    callback: () => {
                        if (ResourceSystem.connections < 60) {
                            alert(`人脉不足！需要 ≥60，当前 ${ResourceSystem.connections}`);
                            return;
                        }
                        const gain = 200 + Math.floor(Math.random() * 301);
                        ResourceSystem.adjustBudget(gain);
                        GrayZoneSystem.recordOperation(4, 5);
                        consumeAction('灰色操作');
                        EventSystem.eventHistory.push({
                            id: 'gray_' + Date.now(),
                            title: '倒卖指标',
                            body: `将紧俏的审批指标转手卖给了企业，获得 ${gain} 财力。风险极高！累积：${GrayZoneSystem.riskLevel}`,
                            options: [{ label: '确认', effects: { budget: gain } }],
                            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                },
            ];

            if (GrayZoneSystem.riskLevel > 50) {
                grayOptions.push({
                    label: '⚠ 花钱消灾——找人摆平风险',
                    sub: `财力-80~150 · 降低风险30-50点 · 当前风险 ${GrayZoneSystem.riskLevel}`,
                    callback: () => {
                        const cost = 80 + Math.floor(Math.random() * 71);
                        if (ResourceSystem.budget < cost) {
                            alert(`财力不足！需要至少 ${cost}，当前 ${ResourceSystem.budget}`);
                            return;
                        }
                        ResourceSystem.adjustBudget(-cost);
                        const reduced = 30 + Math.floor(Math.random() * 21);
                        GrayZoneSystem.riskLevel = Math.max(0, GrayZoneSystem.riskLevel - reduced);
                        consumeAction('灰色操作');
                        EventSystem.eventHistory.push({
                            id: 'gray_' + Date.now(),
                            title: '花钱消灾',
                            body: `花费 ${cost} 财力打点关系，降低风险 ${reduced} 点。剩余风险：${GrayZoneSystem.riskLevel}`,
                            options: [{ label: '确认', effects: { budget: -cost } }],
                            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                });
            }

            showInlineSelector(`🕶️ 灰色操作（当前风险累积：${GrayZoneSystem.riskLevel}）`, grayOptions);
            break;
        }

        case 'handle-event':
            EventPanel.showNextPending();
            return; // Event panel handles action point consumption
    }
    } catch(err) {
        alert('[行动操作出错] ' + err.message);
    }
}

function consumeAction(label) {
    Dashboard.actionPointsRemaining--;
    EventSystem.eventHistory.push({
        id: 'action_' + Date.now(),
        title: label,
        body: `消耗 1 个行动点。（剩余 ${Dashboard.actionPointsRemaining} 点）`,
        options: [{ label: '确认', effects: {} }],
        chosenOption: 0,
        resolvedMonth: TimeSystem.totalMonths,
    });
}

// ====== 组织谈话（晋升面试 v2 — 5题三维度 + PPI分级） ======
function startPromotionInterview(promoCheck) {
    hideInlineSelector();
    // 清理上次残留状态
    window._promoData = null; window._selectedPosition = null;
    window._selectedProfile = null; window._selectedPPI = null;
    window._isLateralTransfer = false;
    _interviewLocked = false;

    const questions = [
        { q: '【施政倾向】组织想了解你的工作重心。如果让你主管一个领域，你优先抓什么？',
            options: [
                { label: '经济发展和项目建设', profile:'经济', score:2, text:'「发展是解决一切问题的钥匙。」' },
                { label: '民生改善和公共服务', profile:'民生', score:2, text:'「让群众有获得感才是根本。」' },
                { label: '安全生产和信访稳定', profile:'维稳', score:2, text:'「不出事是底线。」' },
            ],
        },
        { q: '【施政倾向】辖区内有一块闲置土地，各方都在争取。你的倾向是？',
            options: [
                { label: '引入产业项目，带动就业', profile:'经济', score:1, text:'「产业才能造血。」' },
                { label: '建学校和社区医院', profile:'民生', score:1, text:'「教育和医疗是最大的民生。」' },
                { label: '暂时搁置，等更好的时机', profile:'综合', score:1, text:'「不急于一时。」' },
            ],
        },
        { q: '【政治风格】在班子研究中，如果你的意见和主要领导不一致，你怎么做？',
            options: [
                { label: '坚持原则，据理力争', profile:'党建', score:2, text:'「党性要求实事求是。」' },
                { label: '先执行，边做边沟通', profile:'经济', score:2, text:'「执行力和灵活性都重要。」' },
                { label: '暂时搁置，等待时机再提', profile:'综合', score:2, text:'「讲究策略和方法。」' },
            ],
        },
        { q: '【政治风格】有人反映你们单位存在形式主义问题。你如何看待？',
            options: [
                { label: '该查就查，该改就改', profile:'党建', score:1, text:'「作风问题不是小事。」' },
                { label: '形式主义要反，但也要客观看待', profile:'综合', score:1, text:'「不能一刀切。」' },
                { label: '先把业务工作做好，其他慢慢来', profile:'经济', score:1, text:'「发展中的问题通过发展解决。」' },
            ],
        },
        { q: '【风险偏好】有一个高风险但有高回报的岗位空缺。组织考虑你。',
            options: [
                { label: '我去！风险越大成长越快', profile:'经济', score:2, text:'「敢于担当是干部本色。」' },
                { label: '仔细评估后再做决定', profile:'综合', score:2, text:'「谋定而后动。」' },
                { label: '服从安排，但希望有支持', profile:'党建', score:2, text:'「个人服从组织。」' },
            ],
        },
    ];

    let currentQ = 0, totalScore = 0;
    const profileScores = { '经济':0, '民生':0, '维稳':0, '党建':0, '综合':0 };

    // === 事件委托：统一处理 #event-options 内的所有点击 ===
    const optionsEl = document.getElementById('event-options');
    const oldHandler = optionsEl._promoClickHandler;
    if (oldHandler) optionsEl.removeEventListener('click', oldHandler);

    const clickHandler = function(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        const action = target.dataset.action;
        try {
        const idx = parseInt(target.dataset.idx);
        const name = target.dataset.name;
        const profile = target.dataset.profile;
        const ppi = parseFloat(target.dataset.ppi);

        if (action === 'answer') {
            if (_interviewLocked) return;
            _interviewLocked = true;
            const q = window._currentInterviewQ;
            if (!q || isNaN(idx) || !q.options[idx]) { _interviewLocked = false; return; }
            const opt = q.options[idx];
            profileScores[opt.profile] = (profileScores[opt.profile] || 0) + opt.score;
            totalScore += opt.score;
            [...optionsEl.querySelectorAll('.event-option')].forEach((el, i) => {
                el.style.opacity = i === idx ? '1' : '0.3';
            });
            currentQ++;
            setTimeout(() => { _interviewLocked = false; showQ(); }, 400);
        } else if (action === 'selectPromo') {
            [...optionsEl.querySelectorAll('.event-option:not(.locked)')].forEach(el => el.classList.remove('selected'));
            target.classList.add('selected');
            window._selectedPosition = name;
            window._selectedProfile = profile;
            window._selectedPPI = ppi;
            window._isLateralTransfer = false;
        } else if (action === 'lateralOffer') {
            offerLateralTransfer(profile, ppi, parseFloat(target.dataset.ceiling));
        } else if (action === 'selectLateral') {
            [...optionsEl.querySelectorAll('.event-option')].forEach(el => el.classList.remove('selected'));
            target.classList.add('selected');
            window._selectedPosition = name;
            window._selectedProfile = profile;
            window._selectedPPI = ppi;
        }
        } catch(err) {
            _interviewLocked = false;
            alert('操作出错，请重试。错误：' + err.message);
        }
    };
    optionsEl._promoClickHandler = clickHandler;
    optionsEl.addEventListener('click', clickHandler);
    // =============================================

    function showQ() {
        if (currentQ >= questions.length) { finishInterview(); return; }
        const q = questions[currentQ];
        document.getElementById('event-title').textContent = `📋 组织谈话 (${currentQ+1}/${questions.length})`;
        document.getElementById('event-body').textContent = q.q;
        optionsEl.innerHTML = q.options.map((opt, i) => `
            <div class="event-option" data-action="answer" data-idx="${i}">
                ${opt.label}
                <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">💬 ${opt.text}</div>
            </div>
        `).join('');
        document.getElementById('btn-confirm-choice').classList.add('hidden');
        document.getElementById('event-modal').classList.remove('hidden');
        window._currentInterviewQ = q;
    }

    function finishInterview() {
        try {
        const topProfile = Object.entries(profileScores).sort((a,b) => b[1]-a[1])[0][0];
        const maxPossible = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.score || 0)), 0);
        const interviewPct = maxPossible > 0 ? Math.round((totalScore / maxPossible) * 100) : 50;
        const perfScore = ResourceSystem.performance || 50;
        const deedsScore = Math.min(100, (ProjectSystem.completedHistory || []).length * 15);
        const compScore = Math.round(interviewPct * 0.40 + perfScore * 0.35 + deedsScore * 0.25);
        const ceiling = PositionDB.getPPICeiling(compScore);

        const allPositions = PositionDB.flattenRank(promoCheck.targetRank, GameState.playerLocation || '') || [];

        // 过滤：只保留有空缺的岗位
        const vacantPositions = PositionRegistry.filterByVacancy(allPositions, promoCheck.targetRank);
        const profileDept = vacantPositions.filter(p => p.profile === topProfile);
        const others = [...vacantPositions.filter(p => p.profile !== topProfile)].sort(() => Math.random() - 0.5);
        const pool = [...profileDept, ...others.slice(0, 2)];

        const seen = new Set();
        const unique = pool.filter(p => { const k = p.fullName+p.dept; if(seen.has(k)) return false; seen.add(k); return true; });
        const unlocked = unique.filter(p => p.ppi <= ceiling);
        const locked = unique.filter(p => p.ppi > ceiling);

        document.getElementById('event-title').textContent = '📋 岗位选择';
        document.getElementById('event-body').textContent = [
            `谈话：${totalScore}/${maxPossible}（${interviewPct}%）| 政绩：${perfScore} | 项目：${(ProjectSystem.completedHistory||[]).length}个`,
            `综合评分：${compScore}分 → PPI上限 ${PositionDB.getCeilingLabel(compScore)}`,
            `画像：「${topProfile}」型 | 可解锁 ${unlocked.length} | 锁定 ${locked.length}`,
        ].join('\n');

        let html = '';
        unlocked.forEach(p => {
            const isProfile = p.profile === topProfile;
            const tag = isProfile ? '⭐推荐' : '🎲机遇';
            html += `<div class="event-option" data-action="selectPromo" data-name="${p.fullName}" data-profile="${p.profile}" data-ppi="${p.ppi}">
                <span style="color:${isProfile?'var(--accent-green)':'var(--accent-blue)'}">${tag}</span>
                <b>${p.fullName}</b> ★${p.stars} PPI ${p.ppi}
                <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${p.dept} · ${p.system} · ${p.profile}型</div>
            </div>`;
        });
        locked.forEach(p => {
            const nextCeil = compScore < 45 ? 45 : compScore < 55 ? 55 : compScore < 65 ? 65 : compScore < 75 ? 75 : 85;
            html += `<div class="event-option locked">
                <span style="color:var(--accent-red)">🔒 需≥${nextCeil}分</span>
                <b>${p.fullName}</b> ★${p.stars} PPI ${p.ppi}
                <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${p.dept} · ${p.system}</div>
            </div>`;
        });
        if (unlocked.length === 0) {
            html += `<div style="border-top:1px solid var(--border);margin-top:12px;padding-top:12px">
                <div style="color:var(--accent-orange);margin-bottom:8px">⚠ 综合评分（${compScore}）暂未解锁岗位。可申请平级调动：</div>
                <div class="event-option" data-action="lateralOffer" data-profile="${topProfile}" data-ppi="${compScore}" data-ceiling="${ceiling}">
                    📌 申请平级调动（年限折半，换更高PPI岗位）
                </div>
            </div>`;
        }
        optionsEl.innerHTML = html;

        const btn = document.getElementById('btn-confirm-choice');
        btn.classList.remove('hidden');
        btn.textContent = unlocked.length > 0 ? '✅ 确认选择岗位' : '留在原岗位';
        btn.disabled = false;

        window._promoData = { promoCheck, topProfile, unlocked, compScore, ceiling };
        window._selectedPosition = null;
        window._isLateralTransfer = false;
        } catch(err) {
            alert('岗位生成出错：' + err.message + '。请关闭弹窗重新推进月份。');
            document.getElementById('event-modal').classList.add('hidden');
            window._promoData = null;
            _interviewLocked = false;
        }
    }

    function offerLateralTransfer(profile, compScore, ceiling) {
        const curRankPos = PositionDB.flattenRank(GameState.playerRank, GameState.playerLocation || '');
        const playerPos = GameState.playerPosition || '';
        const curPos = curRankPos.find(p => playerPos.includes(p.name) || p.name.includes(playerPos) || p.fullName === playerPos);
        const curPPI = curPos ? curPos.ppi : 1;

        const options = curRankPos
            .filter(p => p.ppi > curPPI && p.ppi <= ceiling && p.fullName !== playerPos)
            .sort((a,b) => b.ppi - a.ppi).slice(0, 4);

        if (options.length === 0) {
            alert('当前没有适合的平调岗位。建议留在原岗位继续积累。');
            return;
        }

        const curYears = TimeSystem.yearsAtCurrentRank;
        document.getElementById('event-title').textContent = '🔄 平级调动';
        document.getElementById('event-body').textContent =
            `综合评分 ${compScore} 暂不足以晋升。以下同级岗位 PPI > ${curPPI}：\n⚠ 年限：${curYears}年 → ${Math.floor(curYears/2)}年（折半）`;
        optionsEl.innerHTML = options.map(p => `
            <div class="event-option" data-action="selectLateral" data-name="${p.fullName}" data-profile="${p.profile}" data-ppi="${p.ppi}">
                <b>${p.fullName}</b> ★${p.stars} PPI ${p.ppi}
                <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${p.dept} · ${p.system} | PPI ${curPPI}→${p.ppi}</div>
                <div style="font-size:11px;color:var(--accent-orange);margin-top:2px">⚠ ${curYears}年→${Math.floor(curYears/2)}年</div>
            </div>
        `).join('');
        document.getElementById('btn-confirm-choice').textContent = '✅ 确认平级调动';
        window._isLateralTransfer = true;
    }

    showQ();
}

function confirmPromotionPosition() {
    try {
    // 情况1：平级调动模式
    if (window._isLateralTransfer) {
        if (window._selectedPosition) {
            confirmLateralTransfer();
        } else {
            // 用户点了确认但没选岗位 → 留在原位，关闭弹窗
            document.getElementById('event-modal').classList.add('hidden');
            cleanupPromoState();
            Dashboard.refresh();
        }
        return;
    }
    // 情况2：无岗可选，用户选择留在原岗位
    if (!window._selectedPosition) {
        document.getElementById('event-modal').classList.add('hidden');
        cleanupPromoState();
        Dashboard.refresh();
        return;
    }

    // 情况3：正常晋升
    const profile = window._selectedProfile || '综合';
    const result = PromotionSystem.executePromotion();
    if (result.success) {
        document.getElementById('event-modal').classList.add('hidden');
        GameState.playerPosition = window._selectedPosition;
        GameState.playerProfile = profile;
        const ppi = window._selectedPPI || 0;

        // 晋升庆祝弹窗
        const overlay = document.createElement('div');
        overlay.className = 'celebration-overlay';
        overlay.innerHTML = `
            <div class="celebration-card" onclick="event.stopPropagation()">
                ${Illustrations.promotionCelebration()}
                ${Illustrations.seal('晋升', 64)}
                <h2 style="color:var(--primary);font-size:22px;margin:8px 0 4px">🎉 恭喜晋升</h2>
                <p style="font-size:18px;font-weight:700;color:var(--text)">${result.newRank}</p>
                <p style="font-size:14px;color:var(--text-secondary);margin:4px 0">${window._selectedPosition}</p>
                <p style="margin:8px 0;font-size:13px">含权量 <b style="color:var(--gold,#d4a853)">PPI ${ppi}</b> ${'★'.repeat(PPI.tier(ppi).stars)}</p>
                <p style="font-size:12px;color:var(--text-secondary)">干部画像：${profile}型</p>
                <button class="btn-primary" style="margin-top:12px">继 续</button>
            </div>`;
        overlay.onclick = function() { document.body.removeChild(overlay); };
        document.body.appendChild(overlay);
        setTimeout(() => { if (overlay.parentNode) overlay.click(); }, 5000);

        Dashboard.refresh();
    }
    cleanupPromoState();
    } catch(err) {
        alert('[晋升确认出错] ' + err.message);
        cleanupPromoState();
    }
}

function confirmLateralTransfer() {
    try {
    if (!window._selectedPosition) return;

    const curYears = TimeSystem.yearsAtCurrentRank;
    const newYears = Math.floor(curYears / 2);
    TimeSystem.yearsAtCurrentRank = newYears;

    document.getElementById('event-modal').classList.add('hidden');
    // 释放旧岗，占新岗
    PositionRegistry.vacatePosition('player');
    PositionRegistry.occupyPosition(GameState.playerRank, window._selectedPosition, 'player');
    GameState.playerPosition = window._selectedPosition;
    GameState.playerProfile = window._selectedProfile || '综合';

    const ppi = window._selectedPPI || 0;
    alert([
        `🔄 平级调动完成`,
        `新岗位：${window._selectedPosition}`,
        `含权量PPI：${ppi} ${'★'.repeat(PPI.tier(ppi).stars)}`,
        `年限调整：${curYears}年 → ${newYears}年（折半）`,
        `继续积累 ${Math.max(0, (RankDB.getPromotionRequirements(RankDB.getRankByName(GameState.playerRank)?.id || 1)?.minYears || 3) - newYears)} 年可再次申请晋升`,
    ].join('\n'));
    Dashboard.refresh();
    cleanupPromoState();
    } catch(err) {
        alert('[平调确认出错] ' + err.message);
        cleanupPromoState();
    }
}

function cleanupPromoState() {
    window._selectedPosition = null;
    window._selectedProfile = null;
    window._selectedPPI = null;
    window._promoData = null;
    window._isLateralTransfer = false;
    document.getElementById('btn-confirm-choice').textContent = '确认选择';
}

// ====== 存档/读档 ======
function showSaveDialog() {
    const modal = document.getElementById('save-modal');
    const slotsDiv = document.getElementById('save-slots');
    const slots = Persistence.getAllSlots();

    slotsDiv.innerHTML = Object.entries(slots).map(([key, info]) => {
        if (key === 'auto') {
            return `<div class="save-slot" onclick="doSave('${key}')">
                ⚡ 自动存档
                ${info ? `<div class="slot-meta">${info.date} · ${info.rank} · ${new Date(info.time).toLocaleString('zh-CN')}</div>` : '<div class="slot-meta">空</div>'}
            </div>`;
        }
        return `<div class="save-slot" onclick="doSave('${key}')">
            存档槽 ${parseInt(key)+1}
            ${info ? `<div class="slot-meta">${info.name} · ${info.date} · ${info.rank}</div>` : '<div class="slot-meta">空</div>'}
        </div>`;
    }).join('');

    modal.classList.remove('hidden');
}

function doSave(slotIndex) {
    try {
    const result = Persistence.save(parseInt(slotIndex) || slotIndex, `存档_${TimeSystem.dateString}`);
    if (result.success) { alert('✅ 保存成功！'); }
    else { alert('❌ 保存失败：' + result.reason); }
    document.getElementById('save-modal').classList.add('hidden');
    Dashboard.refresh();
    } catch(err) { alert('[保存出错] ' + err.message); }
}

function showLoadDialog() {
    const modal = document.getElementById('load-modal');
    const slotsDiv = document.getElementById('load-slots');
    const slots = Persistence.getAllSlots();

    slotsDiv.innerHTML = Object.entries(slots).map(([key, info]) => {
        let label = key === 'auto' ? '⚡ 自动存档' : `存档槽 ${parseInt(key)+1}`;
        if (!info) return `<div class="save-slot" style="opacity:0.5">${label}<div class="slot-meta">空</div></div>`;
        return `<div class="save-slot" onclick="doLoad('${key}')">
            ${label}
            <div class="slot-meta">${info.name} · ${info.date} · ${info.rank}</div>
        </div>`;
    }).join('');

    modal.classList.remove('hidden');
}

function doLoad(slotIndex) {
    try {
    if (!confirm('加载存档会丢失当前未保存的进度。确定继续？')) return;
    const result = Persistence.load(parseInt(slotIndex) || slotIndex);
    if (result.success) { Dashboard.actionPointsRemaining=3; Dashboard.refresh();
        document.getElementById('load-modal').classList.add('hidden'); alert('✅ 读取成功！'); }
    else { alert('❌ 读取失败：' + result.reason); }
    } catch(err) { alert('[加载出错] ' + err.message); }
}

// ====== 事件绑定 ======
document.addEventListener('DOMContentLoaded', () => {
    // 入场插图
    const heroEl = document.getElementById('entry-hero');
    if (heroEl) heroEl.innerHTML = Illustrations.entryHero();

    // Top bar emblem
    const topBar = document.getElementById('top-bar');
    if (topBar) topBar.insertAdjacentHTML('afterbegin', Illustrations.topBarEmblem());

    // Action buttons
    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action) doAction(action);
        });
    });

    // End month
    document.getElementById('btn-end-month').addEventListener('click', endMonth);

    // Event confirm
    document.getElementById('btn-confirm-choice').addEventListener('click', () => {
        // 优先处理晋升/平调上下文
        if (window._promoData) {
            confirmPromotionPosition();
            return;
        }
        // 否则走正常事件处理
        EventPanel.confirmChoice();
    });

    // Save/Load
    document.getElementById('btn-save').addEventListener('click', showSaveDialog);
    document.getElementById('btn-load').addEventListener('click', showLoadDialog);
    document.getElementById('btn-close-save').addEventListener('click', () => {
        document.getElementById('save-modal').classList.add('hidden');
    });
    document.getElementById('btn-close-load').addEventListener('click', () => {
        document.getElementById('load-modal').classList.add('hidden');
    });

    // Close modals on background click (except crisis events)
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target !== modal) return;
            // 危机事件中不允许关闭
            if (modal.id === 'event-modal' && TimeSystem.state === 'CRISIS_PAUSED') return;
            // 考试引导中不允许关闭
            if (modal.id === 'onboarding-overlay') return;
            modal.classList.add('hidden');
        });
    });

    // Cancel inline selector
    document.getElementById('btn-cancel-select').addEventListener('click', hideInlineSelector);
});
// auto deploy trigger Wed Jun 10 00:32:55     2026
