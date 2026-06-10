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
    applyPersistentBonuses(); // 持久bonus
    monthlyEnergyTick(); // 精力结算
    const vacancyEvents = PositionRegistry.monthlyTick();
    // NPC竞岗：新出现的空缺可能被NPC抢走
    vacancyEvents.forEach(evt => {
        if (evt.reason === '腾出空缺') {
            const compResult = PositionRegistry.npcCompeteForVacancy(evt.rank);
            if (compResult) {
                EventSystem.eventHistory.push({
                    id:'npc_compete_'+Date.now(), title:`${compResult.npcName}获得晋升`,
                    body:`${compResult.npcName}成功竞得${compResult.position}岗位。`, options:[{label:'确认',effects:{}}], chosenOption:0, resolvedMonth:TimeSystem.totalMonths,
                });
            }
        }
    });

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

    // Check career end — 退休 / 窗口关闭 / 灰产暴露
    let endReason = null;
    if (TimeSystem.state === 'CAREER_END') {
        endReason = '退休';
    } else {
        const curRank = RankDB.getRankByName(GameState.playerRank);
        if (curRank && RankDB.isWindowClosed(curRank.id, TimeSystem.playerAge)) {
            endReason = '窗口关闭';
            TimeSystem.state = 'CAREER_END';
        }
    }
    // 灰产暴露次数≥3 → 强制终结
    if (!endReason && GrayZoneSystem.exposureCount >= 3) {
        endReason = '被查处';
        TimeSystem.state = 'CAREER_END';
    }

    if (endReason) {
        setTimeout(() => showLifeSummary(endReason), 500);
        return; // 终结：不触发晋升和事件
    }

    // 破格提拔检查（每月都可能触发，但概率极低）
    const exceptionCheck = PromotionSystem.checkExceptionPromotion();
    if (exceptionCheck && exceptionCheck.eligible) {
        EventSystem.eventHistory.push({id:'exception_'+Date.now(),title:'🌟 破格提拔机会！',
            body:`你的卓越表现引起了上级注意！破格概率${exceptionCheck.chance}%，目标：${exceptionCheck.targetRank}`,
            options:[{label:'确认',effects:{}}],chosenOption:0,resolvedMonth:TimeSystem.totalMonths});
        setTimeout(() => startPromotionInterview({...exceptionCheck, targetRank:exceptionCheck.targetRank, isException:true}), 300);
        return;
    }

    // 晋升检查
    const promoCheck = PromotionSystem.checkEligibility();
    const willPromote = promoCheck && promoCheck.eligible;
    if (willPromote) { setTimeout(() => startPromotionInterview(promoCheck), 200); }

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
            const randomActs = DeptActions.getRandomActions(5);
            const dept = DeptActions.getPlayerDept() || '通用';
            const profile = DeptActions.getPlayerProfile();

            showInlineSelector(
                `📋 ${dept} · 本月工作 [${profile}型]（剩余 ${Dashboard.actionPointsRemaining} 点）`,
                randomActs.map(act => ({
                    label: act.label,
                    sub: act.desc + (act.bonus ? ` [${act.bonus}]` : ''),
                    cost: act.cost ? `💰 ${act.cost}` : '',
                    callback: () => {
                        consumeAction(act.label);
                        ResourceSystem.adjustPerformance(act.perf || 0);
                        ResourceSystem.adjustConnections(act.conn || 0);
                        if (act.budget) ResourceSystem.adjustBudget(act.budget);
                        if (act.cost) ResourceSystem.adjustBudget(-act.cost);
                        if (act.risk > 0) GrayZoneSystem.recordOperation(1, act.risk * 0.5);
                        // bonus效果
                        execBonus(act.bonus, 1.0);

                        EventSystem.eventHistory.push({
                            id:'dept_'+Date.now(), title:act.label, body:`${dept}：${act.desc}`,
                            options:[{label:'确认',effects:{perf:act.perf,conn:act.conn}}], chosenOption:0, resolvedMonth:TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                }))
            );
            break;
        }

        case 'social': {
            const npcs = NPCPool.npcs
                .filter(n => n.rank !== '—' || n.position.includes('老板') || n.position.includes('支书'))
                .slice(0, 8);
            const socialOptions = npcs.map(n => {
                const att = RelationshipSystem.get(n.id);
                const attInfo = RelationshipSystem.getAttitudeLabel(att);
                return {
                    label: `${n.name} — ${n.position} (${attInfo.label} ${att})`,
                    sub: `性格：${n.personality.join('、')} | 职级：${n.rank}`,
                    npcId: n.id,
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
                            chosenOption: 0, resolvedMonth: TimeSystem.totalMonths,
                        });
                        Dashboard.refresh();
                    }
                };
            });
            // 注入亲信培养选项
            npcs.forEach(n => { addProtegeOption(n.id, socialOptions); });
            showInlineSelector('选择社交对象', socialOptions);
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

// ====== 健康精力系统 ======
GameState.energy = 100;
function monthlyEnergyTick() {
    GameState.energy = Math.min(100,(GameState.energy||100)+5);
    const grayThisMonth=GrayZoneSystem.operationHistory.filter(o=>o.month===TimeSystem.totalMonths).length;
    GameState.energy=Math.max(0,GameState.energy-grayThisMonth*8);
    if(GameState.energy<30&&GameState.energy>0){EventSystem.eventHistory.push({id:'elow_'+Date.now(),title:'⚠ 精力不足',body:`精力：${GameState.energy}。减少灰色操作以恢复。`,options:[{label:'确认',effects:{}}],chosenOption:0,resolvedMonth:TimeSystem.totalMonths});}
    if(GameState.energy<=0){GameState.energy=20;EventSystem.pendingEvents.push({id:'ecrash_'+Date.now(),title:'🏥 健康告急',category:'危机',body:'身体亮红灯。立即休养？',options:[{label:'休养·本月停工',effects:{perf:-3},risk:0},{label:'硬撑',effects:{perf:1},risk:3,seed:{type:'exposure',window:[1,3],probability:55,data:{}}}]});}
}

// ====== Bonus 执行系统 ======
GameState.persistentBonuses = [];
function execBonus(bonusText, tierMod) {
    if (!bonusText) return;
    const b = bonusText; const m = tierMod || 1.0;
    const log = [];

    // 1. 项目进度
    if (b.includes('进度+2')) { const n=Math.round(2*m); ProjectSystem.activeProjects.forEach(p=>p.progress+=n); log.push('项目进度+'+n); }
    else if (b.includes('进度+1')) { const n=Math.round(1*m); ProjectSystem.activeProjects.forEach(p=>p.progress+=n); log.push('项目进度+'+n); }

    // 2. 灰色风险
    if (b.includes('灰色风险-3')) { const n=Math.round(3*m); GrayZoneSystem.riskLevel=Math.max(0,(GrayZoneSystem.riskLevel||0)-n); log.push('灰色风险-'+n); }
    else if (b.includes('灰色风险-2')) { const n=Math.round(2*m); GrayZoneSystem.riskLevel=Math.max(0,(GrayZoneSystem.riskLevel||0)-n); log.push('灰色风险-'+n); }

    // 3. 灰色机会（4级）
    if (b.includes('灰色机会极大')) triggerGrayOpp(0.55*m);
    else if (b.includes('灰色机会')&&b.includes('高')) triggerGrayOpp(0.40*m);
    else if (b.includes('灰色机会')&&!b.includes('低')&&!b.includes('微')) triggerGrayOpp(0.25*m);
    else if (b.includes('灰色机会')) triggerGrayOpp(0.12*m);

    // 4. 亲信发现
    if (b.includes('亲信人选')) triggerFindProtege(0.22*m);
    if (b.includes('可培养')||b.includes('发现优秀')) triggerFindProtege(0.10*m);

    // 5. 上级关注/表彰
    if (b.includes('上级关注')||b.includes('表彰')||b.includes('获评')||b.includes('上级采纳')){
        ResourceSystem.adjustConnections(Math.round(2*m)); ResourceSystem.adjustPerformance(Math.round(1*m)); log.push('上级关注');}

    // 6. 信息权/核心
    if (b.includes('信息权')||b.includes('核心权力')){ ResourceSystem.adjustConnections(Math.round(3*m)); log.push('信息权提升');}

    // 7. 降低安全/事故/事件概率（一次性财力减负 or 隐性 buff）
    if (b.includes('事故概率')||b.includes('安全风险')||b.includes('安全事件')){ ResourceSystem.adjustBudget(Math.round(5*m)); log.push('安全加固·省下应急开支');}
    if (b.includes('公卫事件')||b.includes('疫情')){ ResourceSystem.adjustBudget(Math.round(3*m)); log.push('公卫防控·减少突发开支');}
    if (b.includes('群体事件')){ ResourceSystem.adjustBudget(Math.round(5*m)); log.push('维稳见效·省下维稳开支');}

    // 8. 民生/信访指标
    if (b.includes('民生指标')||b.includes('民生考核')){ ResourceSystem.adjustPerformance(Math.round(2*m)); log.push('民生指标↑');}
    if (b.includes('信访率')||b.includes('信访量')||b.includes('群体事件概率')){ ResourceSystem.adjustPerformance(Math.round(1*m)); log.push('信访量↓');}

    // 9. GDP 基线（持久 bonus）
    if (b.includes('GDP基线')||b.includes('长期提升')){
        const dur = b.includes('12')?12:6; const val=Math.round(1*m);
        GameState.persistentBonuses.push({type:'gdp',value:val,remaining:dur});
        log.push('GDP基线+'+val+'（持续'+dur+'月）');
    }

    // 10. 发现漏洞/线索（可选择性处理）
    if (b.includes('发现漏洞')||b.includes('发现疑点')||b.includes('发现账务')){ triggerDiscoveryEvent(); log.push('发现问题线索');}
    if (b.includes('可选择性处置')||b.includes('可选择性报告')||b.includes('可选择上报')){ triggerDiscoveryEvent(); log.push('选择性处理机会');}

    // 11. 推荐上位/安排自己人
    if (b.includes('推荐上位')||b.includes('安排自己人')||b.includes('有权推荐')){
        ResourceSystem.adjustConnections(Math.round(4*m)); log.push('推荐权力行使');}

    // 12. 微bonus也要有落点
    if (b.includes('小幅buff')||b.includes('微幅')){ ResourceSystem.adjustPerformance(Math.round(0.5*m)); log.push('小幅增益');}
    if (b.includes('口碑')||b.includes('群众')){ ResourceSystem.adjustConnections(Math.round(1*m)); log.push('口碑提升');}

    // 兜底：微bonus也要有数值落点
    if (log.length === 0 && b.length > 1) {
        ResourceSystem.adjustPerformance(Math.round(0.5*m));
        log.push('微增益·政绩+'+Math.round(0.5*m));
    }

    // 记录bonus日志
    if (log.length > 0) {
        EventSystem.eventHistory.push({id:'bonus_'+Date.now(),title:'✨ 附加效果',body:log.join(' · '),options:[{label:'确认',effects:{}}],chosenOption:0,resolvedMonth:TimeSystem.totalMonths});
    }
}

// 持久 bonus 月末结算
function applyPersistentBonuses() {
    GameState.persistentBonuses = (GameState.persistentBonuses||[]).filter(pb => {
        if (pb.type==='gdp'){ ResourceSystem.adjustPerformance(pb.value*0.3); ResourceSystem.adjustBudget(pb.value*2); }
        pb.remaining--;
        return pb.remaining > 0;
    });
}

function triggerGrayOpp(chance) { if(Math.random()<chance){const biz=NPCPool.npcs.find(n=>n.position.includes('老板')||n.position.includes('公司'));if(biz)EventSystem.pendingEvents.push({id:'dg_'+Date.now(),title:'部门灰色机会',category:'灰色',body:`${biz.name}借工作接触之机暗示有「感谢费」。`,options:[{label:'拒绝',effects:{perf:1},risk:0},{label:'收下',effects:{budget:20+Math.floor(Math.random()*30),perf:-2},risk:2,grayLevel:1}]});}}
function triggerFindProtege(chance){if(Math.random()<chance){const subs=NPCPool.npcs.filter(n=>{const r=RankDB.getRankByName(n.rank);const pr=RankDB.getRankByName(GameState.playerRank);return r&&pr&&r.id<pr.id&&RelationshipSystem.get(n.id)>=20});if(subs.length>0){const s=subs[Math.floor(Math.random()*subs.length)];EventSystem.pendingEvents.push({id:'pf_'+Date.now(),title:'发现可培养之才',category:'关系',body:`${s.name}近期表现突出。是否纳入亲信培养名单？`,options:[{label:'纳入培养',effects:{conn:3},seed:{type:'alliance',window:[6,18],probability:55,data:{npcId:s.id,delta:15}}},{label:'继续观察',effects:{},risk:0}]});}}}
function triggerDiscoveryEvent(){if(Math.random()<0.4){EventSystem.pendingEvents.push({id:'disc_'+Date.now(),title:'发现问题',category:'灰色',body:'在工作检查中你发现了一处财务/管理漏洞。你可以选择上报或压下。',options:[{label:'上报——政绩+3',effects:{perf:3},risk:0},{label:'压下——暗示对方表示',effects:{budget:30,perf:-1},risk:3,grayLevel:2}]});}}

// ====== 抢岗位机制（无空缺时在组织谈话中触发） ======
function offerPositionGrab(topProfile, compScore, targetRank) {
    const curRank = RankDB.getRankByName(GameState.playerRank);
    const curPPI = 1; // placeholder
    const curYears = TimeSystem.yearsAtCurrentRank;

    const grabs = [
        { label:'🏃 活动运作', desc:'请关键上级帮忙做工作，让现任提前退休或调离', cost:'人脉-25 财力-40', chance:60,
            callback(){ if(ResourceSystem.connections>=25&&ResourceSystem.budget>=40){
                ResourceSystem.adjustConnections(-25);ResourceSystem.adjustBudget(-40);
                if(Math.random()*100<60){ PositionRegistry.forceVacancy(targetRank); alert('运作成功！岗位空缺已腾出。'); }
                else { alert('运作失败。关系受损。'); const sups=NPCPool.npcs.filter(n=>RankDB.getRankByName(n.rank)?.id > (curRank?.id||0)); if(sups.length>0)RelationshipSystem.adjust(sups[0].id,-15); }
                EventPanel.showNextPending ? finishInterviewRerun() : null;
            }else{alert('人脉或财力不足！');}}},
        { label:'📐 平级调动', desc:'换同级但PPI更高的空缺岗位', cost:'年限折半', chance:100,
            callback(){ window.offerLateralTransfer(topProfile, compScore, 999); }},
        { label:'⏳ 耐心等待', desc:'什么都不做，等自然变化', cost:'无', chance:10,
            callback(){ alert('每月有10%概率出现空缺。继续推进时间即可。'); }},
        { label:'🕵️ 举报现任', desc:'收集目标岗位现任的黑料匿名举报', cost:'人脉-15 财力-20 风险+30', chance:35,
            callback(){ if(ResourceSystem.connections>=15&&ResourceSystem.budget>=20){
                ResourceSystem.adjustConnections(-15);ResourceSystem.adjustBudget(-20);GrayZoneSystem.riskLevel+=30;
                if(Math.random()*100<35){ PositionRegistry.forceVacancy(targetRank); alert('举报成功！现任被调查，岗位空缺。'); }
                else { alert('举报失败！你被反查。'); GrayZoneSystem.riskLevel+=20; }
            }else{alert('条件不足！');}}},
    ];

    document.getElementById('event-title').textContent = '🔓 无空缺——抢岗手段';
    document.getElementById('event-body').textContent = `目标级别目前没有空缺岗位。你可以尝试以下方式争取：`;
    document.getElementById('event-options').innerHTML = grabs.map(g => `
        <div class="event-option" onclick="(${g.callback.toString()})()">
            <b>${g.label}</b> <span style="color:var(--text-secondary);font-size:11px">成功率${g.chance}%</span>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${g.desc} · ${g.cost}</div>
        </div>
    `).join('');
    document.getElementById('btn-confirm-choice').classList.add('hidden');
    window._grabbing = true;
}

function finishInterviewRerun() {
    // 抢岗成功后重新触发岗位检查
    document.getElementById('event-modal').classList.add('hidden');
    setTimeout(() => {
        const promoCheck = PromotionSystem.checkEligibility();
        if (promoCheck && promoCheck.eligible) startPromotionInterview(promoCheck);
    }, 400);
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
        } else if (action === 'positionGrab') {
            offerPositionGrab(profile, ppi, target.dataset.rank);
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
                <div style="color:var(--accent-orange);margin-bottom:8px">⚠ 综合评分（${compScore}）暂未解锁岗位，或无空缺。可选操作：</div>
                <div class="event-option" data-action="lateralOffer" data-profile="${topProfile}" data-ppi="${compScore}" data-ceiling="${ceiling}">
                    📌 申请平级调动（年限折半，换更高PPI岗位）
                </div>
                <div class="event-option" data-action="positionGrab" data-profile="${topProfile}" data-ppi="${compScore}" data-rank="${promoCheck.targetRank}">
                    🔓 抢岗位（运作/举报/等待——主动腾出空缺）
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

// ====== 玩家档案面板 ======
function showPlayerProfile() {
    const p=GameState; const age=TimeSystem.playerAge; const years=TimeSystem.yearsPassed;
    const rank=RankDB.getRankByName(p.playerRank); const nextRank=RankDB.getNextRank(rank?.id||1);
    const windowLeft=rank?RankDB.windowYearsRemaining(rank.id,age):99;
    const proteges=(p.proteges||[]).map(pid=>{const n=NPCPool.getNPC(pid);return n?n.name:'?';}).join('、')||'暂无';

    const html=`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,var(--primary-dark),var(--primary));color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700">${(p.playerName||'?')[0]}</div>
        <div><h3 style="margin:0;color:var(--primary)">${p.playerName||'?'} · ${p.playerGender||'?'} · ${age}岁</h3>
        <p style="color:var(--text-secondary);font-size:12px;margin:2px 0">${p.playerPosition||''}（${p.playerRank}）</p></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;margin-bottom:12px">
        <div>📍 ${(p.playerLocation||'').replace(/^.+省/,'').replace(/^.+?市/,'')}</div>
        <div>🏛️ ${p.playerParty||'无党派'}${p.playerPartyPosition?' · '+p.playerPartyPosition:''}</div>
        <div>🎯 画像：${p.playerProfile||'综合'}型</div>
        <div>📝 入职成绩：${p.examScore||'?'}分（${p.examTier||'?'}）</div>
        <div>⏳ 已工作：${years}年</div>
        <div>📊 完成项目：${ProjectSystem.completedHistory.length}个</div>
        <div>📋 处理事件：${EventSystem.eventHistory.length}次</div>
        <div>🕶️ 灰色操作：${GrayZoneSystem.operationHistory.length}次·暴露${GrayZoneSystem.exposureCount}次</div>
        <div>👥 亲信：${proteges}</div>
        ${nextRank?`<div>⬆ 下一级：${nextRank.name}（需满${nextRank.minAge}岁）</div>`:''}
        ${windowLeft<99?`<div>⏳ 晋升窗口：剩余${windowLeft}年</div>`:''}
    </div>
    <button class="btn-primary" onclick="document.getElementById('event-modal').classList.add('hidden')" style="width:100%">关闭</button>`;

    document.getElementById('event-title').textContent='👤 玩家档案';
    document.getElementById('event-body').innerHTML=html;
    document.getElementById('event-options').innerHTML='';
    document.getElementById('btn-confirm-choice').classList.add('hidden');
    document.getElementById('event-modal').classList.remove('hidden');
}

// ====== 辞职系统 ======
function showResignDialog() {
    const opts=[
        {label:'💼 下海经商',desc:'利用这些年积累的人脉和资源，到商界闯一番。',endReason:'辞职·下海'},
        {label:'✈️ 出国深造',desc:'申请海外进修，给自己一个全新的开始。',endReason:'辞职·出国'},
        {label:'🏢 调往国企',desc:'不是结束——申请平调至国企岗位，继续仕途。',endReason:'',isTransfer:true},
        {label:'😔 引咎辞职',desc:'压力太大，选择体面地离开。',endReason:'辞职·引咎'},
        {label:'🏥 健康原因',desc:'身体扛不住了。健康比权力更重要。',endReason:'辞职·健康'},
    ];
    document.getElementById('event-title').textContent='🚪 辞职';
    document.getElementById('event-body').textContent='确认要结束当前的政治生涯吗？辞职后将生成人生总结。';
    document.getElementById('event-options').innerHTML=opts.map((o,i)=>`
        <div class="event-option" onclick="confirmResign(${i})"><b>${o.label}</b>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${o.desc}</div></div>
    `).join('');
    document.getElementById('btn-confirm-choice').classList.add('hidden');
    document.getElementById('event-modal').classList.remove('hidden');
    window._resignOptions=opts;
}
function confirmResign(idx) {
    const opt=window._resignOptions[idx]; if(!opt)return;
    document.getElementById('event-modal').classList.add('hidden');
    if(opt.isTransfer){
        // 调往国企——平调不算结束
        const soePositions=PositionDB.flattenRank(GameState.playerRank,GameState.playerLocation||'')
            .filter(p=>p.system==='国企');
        if(soePositions.length>0){
            const pos=soePositions[0];
            GameState.playerPosition=pos.fullName; GameState.playerProfile=pos.profile;
            alert('已平调至：'+pos.fullName); Dashboard.refresh();
        }else{alert('当前级别无国企岗位可选。');}
    }else{
        TimeSystem.state='CAREER_END';
        showLifeSummary(opt.endReason);
    }
}

// ====== 亲信培养（社交时可选） ======
function addProtegeOption(npcId, optionsList) {
    const npc=NPCPool.getNPC(npcId); if(!npc)return;
    const att=RelationshipSystem.get(npcId);
    const isSubordinate=(()=>{const r=RankDB.getRankByName(npc.rank);const pr=RankDB.getRankByName(GameState.playerRank);return r&&pr&&r.id<pr.id;})();
    if(!isSubordinate||att<35)return;
    const already=(GameState.proteges||[]).includes(npcId);
    if(already)return;
    optionsList.push({
        label:`🌟 培养${npc.name}为亲信`,
        sub:`下属·态度${att}·能力${npc.competence}/10`,
        callback:()=>{
            GameState.proteges=[...(GameState.proteges||[]),npcId];
            npc.patron='player';
            RelationshipSystem.adjust(npcId,8);
            ResourceSystem.adjustConnections(3);
            EventSystem.eventHistory.push({id:'protege_'+Date.now(),title:`培养亲信：${npc.name}`,
                body:`${npc.name}已成为你的亲信。`,options:[{label:'确认',effects:{conn:3}}],chosenOption:0,resolvedMonth:TimeSystem.totalMonths});
            Dashboard.refresh();
            alert(`✅ ${npc.name}已成为你的亲信！`);
        }
    });
}

// 在社交面板中注入亲信选项
const origSocialCase=doAction.toString().match(/case 'social'.*?break;/s);
// 用动态注入替代：在社交 callback 执行前插入亲信选项
function injectProtegeIntoSocial(npcId){ return (GameState.proteges||[]).includes(npcId); }

// ====== 人生总结 ======
function showLifeSummary(endReason) {
    const p=GameState,startAge=22,endAge=TimeSystem.playerAge,years=endAge-startAge;
    const rank=p.playerRank,loc=(p.playerLocation||'').replace(/^.+省/,'').replace(/^.+?市/,'');
    const exam=p.examScore||60,projectsDone=ProjectSystem.completedHistory.length;
    const grayOps=GrayZoneSystem.operationHistory.length,exposures=GrayZoneSystem.exposureCount;

    let bestNPC=null,worstNPC=null,bestAtt=-999,worstAtt=999;
    NPCPool.npcs.forEach(n=>{const a=RelationshipSystem.get(n.id);if(a>bestAtt){bestAtt=a;bestNPC=n;}if(a<worstAtt){worstAtt=a;worstNPC=n;}});

    const rankId=RankDB.getRankByName(rank)?.id||1;
    const happiness=grayOps===0?5:exposures===0?4:exposures>=2?1:3;
    const wealth=endReason.includes('下海')?5:grayOps>3?4:rankId>=8?4:grayOps>0?3:2;
    const reputation=endReason.includes('查处')?1:projectsDone>10?5:projectsDone>3?4:3;
    const power=endReason.includes('查处')?0:rankId>=10?5:rankId>=8?4:rankId>=6?3:rankId>=4?2:1;

    const locDesc=(()=>{if(!loc)return '基层';if(loc.length<4)return loc;return loc;})();

    // 开头
    let story='';
    if(exam>=90){story+=`二十二岁那年，他以${exam}分的优异成绩考入了${locDesc}。报到那天他穿了一件新买的衬衫，站在镇政府门口，觉得整个世界都在等着他。`;}
    else if(exam>=75){story+=`二十二岁，${exam}分。他被分到了${locDesc}。不算最好的去处，但也不差。报到那天他在镇政府门口抽了根烟，心想：从这里开始，一步一步来。`;}
    else if(exam>=60){story+=`二十二岁，刚好过线的${exam}分。他被分到了${locDesc}——一个在地图上都不太好找的地方。去报到的路上他吐了两次，不是因为晕车，是因为那条山路实在太颠了。`;}
    else{story+=`二十二岁。${exam}分。他被分到了${locDesc}——最偏远的乡镇。有人说这是最差的去处。他把通知单折好放进口袋，说了一句：「只要进了门，就有机会。」`;}

    // 爬坡
    if(rankId<=2){story+=`他在基层待了整整${years}年，最高做到了${rank}。不算远，但他经手的每一个项目、化解的每一次矛盾，都是实打实的。这里的每一条路他都知道什么时候修的，每一户贫困户他都叫得出名字。`;}
    else if(rankId<=4){story+=`他用${years}年走到了${rank}。${projectsDone>5?'超过五个':'若干个'}项目在他的推动下落地——修路、建学校、引企业。在${locDesc}，他不是一个名字，是一个留下了痕迹的人。`;}
    else if(rankId<=7){story+=`他用${years}年的奋斗走到了${rank}。${projectsDone}个项目、${EventSystem.eventHistory.length||0}次事件——这些数字背后，是无数个加班到凌晨的夜晚，和那些只有他自己记得的艰难抉择。他在这片土地上留下了属于自己的印记。`;}
    else{story+=`他从基层一路走到了${rank}，用了${years}年。这是一个普通人能走到的距离里，相当不普通的一段路。`;}

    // 十字路口
    if(grayOps===0){story+=`在他的整个仕途中，他没有碰过一次灰色操作。不是没有机会——几乎每年都有人把信封推到他的桌面上——但他每次都推了回去。有人笑他傻，他不在乎。他只知道，那些收了信封的人，后来有好几个已经不在这个系统里了。`;}
    else if(grayOps<=2&&exposures===0){story+=`他曾${grayOps}次在灰色地带的边缘试探过，但每次都全身而退。他觉得自己把握住了分寸——也许确实如此。但每次事后，他都会在办公室里多坐一会儿，确认自己的心跳恢复了正常，才锁门离开。`;}
    else if(exposures>=1&&!endReason.includes('查处')){story+=`他曾${grayOps}次触碰灰色地带，其中${exposures}次差点出事。有一次他被纪委约谈，在会议室外面等了四十分钟——那四十分钟，是他这辈子最难熬的四十分钟。后来没事了。但从那以后他再也没有碰过信封。不是不想，是不敢了。`;}
    else if(endReason.includes('查处')){story+=`他曾${grayOps}次在灰色地带操作。一开始只是小打小闹——报销多报几百，收一条烟。后来胆子越来越大，数字也越来越大。第${exposures}次暴露之后，一切都结束了。他曾经想过这个结局——在每个失眠的凌晨三点，他都想过。但当它真的来临时，他还是没有准备好。`;}

    // 人际关系
    if(bestNPC&&bestAtt>40){story+=`${bestNPC.name}是他仕途中为数不多真正帮过他的人。${bestAtt>70?'他们之间的关系远超普通的上下级——在关键时刻，'+bestNPC.name+'替他挡过至少一次足以断送前程的危机。':'虽然谈不上至交，但在那些关键的人事讨论中，'+bestNPC.name+'的名字总是出现在支持他的那一边。'}`;}
    if(worstNPC&&worstAtt<-30){story+=`而${worstNPC.name}则是另一回事。${worstAtt<-60?'他们之间的对立几乎是公开的秘密。在班子会上，'+worstNPC.name+'从来没有支持过他的任何提案。':'他们之间的矛盾更像一种慢性病——平时看不出，但每次到了关键节点，'+worstNPC.name+'总会在某个不起眼的环节让他功亏一篑。'}`;}
    if((!bestNPC||bestAtt<=40)&&(!worstNPC||worstAtt>=-30)){story+=`他的官场关系网不算宽广，但胜在稳当。他没有刻意讨好过谁，也没有跟谁结下过解不开的梁子。在一个以人情为润滑剂的系统里，他更像一颗靠自身惯性运转的齿轮——不快，但也不会卡住。`;}

    // 终点
    if(endReason==='退休'){story+=`${endAge}岁那年，他办完了退休手续。走出办公楼的时候他回头看了一眼——这栋楼，他进出了${years}年。门口的保安还在，但已经换了好几茬。新的保安不认识他，看他站得久了，问他找谁。他说：不找谁，就走了。`;}
    else if(endReason==='窗口关闭'){story+=`${endAge}岁那年，他到了${rank}的晋升窗口上限。没有谈话，没有仪式，只是面板上那几个字从「剩余1年」变成了「已关闭」。他盯着那几个字看了很久。后来他平调到了一个清闲的部门，每天的工作从决断变成了等候。他学会了在办公室里养一盆绿萝，每天给它浇水。那盆绿萝长得很好——比他经手的任何一个项目都活得长久。`;}
    else if(endReason.includes('查处')){story+=`${endAge}岁那年，他的灰色操作暴露了。纪委介入调查那天他正在主持一个项目推进会。手机响了三遍他才接。接完之后，他站起来对所有人说：「今天的会先开到这儿。」然后他走出去，再也没有回到那个会议室。`;}
    else if(endReason.includes('下海')){story+=`${endAge}岁那年他递交了辞职信。办公室主任问他是不是不满意，他说不是。是不是有人为难他，他说没有。「那你图啥？」他想了想，说：「图另一种活法。」走出那扇门的时候他的腿在发抖——但他没有回头。`;}
    else if(endReason.includes('出国')){story+=`${endAge}岁那年她交了辞职信，考了雅思，申请了海外的研究生。同事问她要去哪儿，她说英国。同事愣了很久：「英国？去干什么？」她说：「去看看。」机票订在秋天。走的那天机场下着小雨，她没有让任何人来送。`;}
    else if(endReason.includes('引咎')){story+=`${endAge}岁那年，他分管的项目出了事故。不是他的责任，但他是分管领导。他写了辞职信，最后一行写着：「我愿意引咎辞职。」写这几个字的时候手没抖——因为他知道，这是他唯一还能选择的事情。`;}
    else if(endReason.includes('健康')){story+=`${endAge}岁那年，体检报告上全是红色警告。医生拿着报告看着他：「你是不是不想活了？」他回到家，对着那面挂满奖状的墙站了很久。第二天他写了辞职信。理由：健康原因。`;}
    else{story+=`${endAge}岁那年，他的仕途画上了句号。`;}

    // 余生
    story+=`\n\n后来——\n\n`;
    if(happiness>=4){story+=`他是快乐的。不是那种大笑大闹的快乐，是那种安静、稳定、不需要向任何人证明的快乐。他晚上睡得着，白天吃得下，下雨天能在阳台上看一整天的雨而不觉得空虚。这种快乐，在体制里的时候他从来没有真正拥有过。`;}
    else if(happiness<=2){story+=`他过得不算快乐。有些事情他永远无法释怀——某个不该得罪的人，某个不该拿的信封，某个不该错过的机会。这些事像碎玻璃一样埋在他的记忆里，平时不碰不疼，但偶尔翻出来，还是扎手。`;}
    else{story+=`他不算特别快乐，但也不痛苦。他学会了和遗憾共处——人生不是数学题，不是每道都有解。有些事就是没有答案的，接受了这一点之后，他反倒轻松了许多。`;}

    if(wealth>=4){story+=`他的经济状况比大多数人好得多。${endReason.includes('下海')?'辞职后他的公司在五年内做到了年营收八千万。他换了房子换了车，孩子在国外读书。但有一次喝醉了酒他对老同事说：「钱是赚到了。」然后停了很久，才说下一句：「但也只有钱了。」':grayOps>3?'他的灰色收入足够让他在省城过上体面的生活。但他从不敢大手大脚花钱——每一笔大额支出之前他都会犹豫很久，生怕引来不必要的注意。':'他不太缺钱。退休金加上多年的积蓄，足够他和家人过上安稳的日子。偶尔出去旅游，偶尔给孙子买点礼物。不用算计，也不用担心。'}`;}
    else if(wealth<=2){story+=`他这辈子没攒下什么钱。退休金刚好够花，存款只够应付几次意外。但他也不需要太多——他没有奢侈的习惯，最大的消费就是每个月买两本新书，和偶尔去镇上最好的馆子点一条清蒸鱼。`;}
    else{story+=`他的经济状况不好不坏。退休金加上一点积蓄，够两个人过得体面。偶尔给孙子包个红包，偶尔出去吃顿好的。不需要算着花钱，但也做不到随心所欲。这样也挺好——对他来说，够用就是最好的状态。`;}

    if(reputation>=4){story+=`他的名声不错。老同事提起他，用的词是「实在」「靠谱」「不坑人」。在一个以利益交换为基础的系统里，这些词的分量比任何荣誉证书都重。偶尔有年轻干部慕名上门请教，他总是认真听完对方的问题，然后给出一两个实际可行的建议——从不打官腔。`;}
    else if(reputation<=2){story+=`他的名声不太好。有人觉得他太死板，有人觉得他太滑头——奇怪的是这两种评价经常来自同一个人。他没有刻意经营过自己的形象，结果就是形象成了一团模糊的影子。有人记得他做了什么，但没人说得清他到底是一个怎样的人。`;}
    else{story+=`他在圈子里的名声中等。有人欣赏他，有人对他无感。他没有特别光辉的履历，也没有特别严重的污点。他只是一个在规定范围内尽力做事的普通干部——这样的人在体制里占大多数，但很少有人为他们写传记。`;}

    if(power>=4){story+=`他曾经握有实权——可以拍板几千万的项目，可以决定几十个人的命运。那种感觉，他至今还记得：会议室里所有人都看着你，等着你说那句话。你知道那句话的分量，也享受那种分量。退休后这种权力当然消失了，但偶尔在街上碰到老部下，对方还是会下意识地停住脚步，微微欠身。那个瞬间，权力还在——在肌肉记忆里，在那些曾经被你影响过的人的眼睛里。`;}
    else if(power<=1){story+=`权力从来不是他的标签。他的位置决定了他说的话很少能改变什么——批一个文件，盖一个章，签一个字。他从未体验过「一言九鼎」的感觉，也从未为此失落。在他心里，这份工作本来就不是用来叱咤风云的。它只是一份工作。`;}
    else{story+=`他手中曾经有过一些权力——不多，但够用。可以给某个项目加快审批，可以在某个会议上帮人说话。这种权力不足以改变世界，但足以影响身边几个人的命运。退休后，这些当然都没有了。但他偶尔会在翻旧物时看到当年的批文，看着自己签下的名字，想起那个还能帮人解决问题的自己。`;}

    // 尾声
    const codas=['一个人的仕途，说到底，不过是一段与权力共舞的人生。',
        `从${locDesc}的科员到${rank}，这一路走来，他得到了什么，又失去了什么——答案不在档案里，在那些失眠的夜晚和醒来的早晨里。`,
        '权力是一场没有终点的马拉松。他跑到了自己的终点。这就够了。',
        '也许有人比他走得更远，但没有人比他更了解他自己的选择。'];
    story+='\n\n—— '+codas[Math.floor(Math.random()*codas.length)];

    const overlay=document.createElement('div');overlay.className='celebration-overlay';
    overlay.innerHTML=`<div class="celebration-card" style="max-width:520px;max-height:85vh;overflow-y:auto;text-align:left;line-height:2.1;font-size:14px;padding:32px 36px" onclick="event.stopPropagation()">
        <div style="text-align:center;margin-bottom:20px">${Illustrations.seal('仕途',56)}
        <h2 style="color:var(--primary);margin:8px 0;font-size:20px">${p.playerName} · 政治生涯总结</h2>
        <p style="color:var(--text-secondary);font-size:12px">${startAge}岁入职 → ${endAge}岁${endReason.replace('辞职·','')} · ${rank} · ${years}年</p></div>
        <div style="white-space:pre-line;color:var(--text)">${story}</div>
        <div style="text-align:center;margin-top:24px">
        <button class="btn-primary" onclick="this.closest('.celebration-overlay').remove();window.location.reload()">结束 · 重新开始</button></div></div>`;
    document.body.appendChild(overlay);
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
