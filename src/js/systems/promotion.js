// 晋升系统 — Feature Layer

const PromotionSystem = {
    checkEligibility() {
        const currentRank = RankDB.getRankByName(GameState.playerRank);
        if (!currentRank) return null;

        const reqs = RankDB.getPromotionRequirements(currentRank.id);
        if (!reqs) return { eligible: false, reason: '已是最高级别' };

        const yearsInRank = TimeSystem.yearsAtCurrentRank; // Simplified for MVP
        const perfOk = ResourceSystem.performance >= reqs.perfLine;

        // Find key superior attitude
        const superiors = NPCPool.npcs.filter(n => {
            const r = RankDB.getRankByName(n.rank);
            return r && r.id > currentRank.id;
        });
        const maxSupAtt = superiors.length > 0
            ? Math.max(...superiors.map(s => RelationshipSystem.get(s.id)))
            : 50;
        const attOk = maxSupAtt >= reqs.attLine;

        // Party position check (only for 处级 and above)
        const partyOk = !reqs.partyReq || GameState.playerPartyPosition === reqs.partyReq;

        const checks = {
            years: { ok: yearsInRank >= reqs.minYears, have: yearsInRank, need: reqs.minYears },
            performance: { ok: perfOk, have: ResourceSystem.performance, need: reqs.perfLine },
            attitude: { ok: attOk, have: maxSupAtt, need: reqs.attLine },
            vacancy: { ok: PositionRegistry.hasVacancy(reqs.targetRank),
                have: PositionRegistry.hasVacancy(reqs.targetRank) ? '有空缺' : '暂无空缺',
                need: '有空缺' },
            party: { ok: partyOk, have: GameState.playerPartyPosition || '无', need: reqs.partyReq || '无' },
        };

        const allOk = Object.values(checks).every(c => c.ok);
        return { eligible: allOk, checks, targetRank: reqs.targetRank };
    },

    // 破格提拔：跳过年限+空缺，但政绩+关系+项目数必须极突出
    checkExceptionPromotion() {
        const currentRank = RankDB.getRankByName(GameState.playerRank);
        if (!currentRank) return null;
        const reqs = RankDB.getPromotionRequirements(currentRank.id);
        if (!reqs) return null;

        const perf = ResourceSystem.performance;
        const projects = ProjectSystem.completedHistory.length;
        const superiors = NPCPool.npcs.filter(n => {
            const r = RankDB.getRankByName(n.rank);
            return r && r.id > currentRank.id;
        });
        const maxAtt = superiors.length > 0 ? Math.max(...superiors.map(s => RelationshipSystem.get(s.id))) : 0;

        // 破格条件：政绩≥90 + 项目≥5 + 关键上级态度≥60 + 至少1年当前职级
        const conds = {
            perf: perf >= 90,
            projects: projects >= 5,
            attitude: maxAtt >= 60,
            minTime: TimeSystem.yearsAtCurrentRank >= 1,
        };
        const allMet = Object.values(conds).every(c => c);
        if (!allMet) return null;

        // 10%基础概率，政绩和上级态度越高概率越大
        const chance = Math.min(40, 10 + (perf - 90) * 0.5 + (maxAtt - 60) * 0.5);
        const triggered = Math.random() * 100 < chance;

        return {
            eligible: triggered,
            conds,
            chance: Math.round(chance),
            targetRank: reqs.targetRank,
            isException: true,
        };
    },

    executePromotion() {
        const result = this.checkEligibility();
        if (!result || !result.eligible) return { success: false, reason: '不满足晋升条件' };

        const oldRank = GameState.playerRank;
        // 占据新岗位
        PositionRegistry.occupyPosition(result.targetRank, GameState.playerPosition || '', 'player');
        GameState.playerRank = result.targetRank;
        TimeSystem.onPromotion();

        ResourceSystem.adjustPerformance(3);
        ResourceSystem.adjustConnections(5);

        return {
            success: true,
            oldRank,
            newRank: result.targetRank,
        };
    },

    getSaveState() { return {}; },
    loadSaveState(data) {},
};
