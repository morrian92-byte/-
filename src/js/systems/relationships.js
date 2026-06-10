// 关系网络系统 — Core Layer
// NPC 态度管理，-100 到 +100

const RelationshipSystem = {
    attitudes: {}, // npc_id → towardPlayer
    playerToward: {}, // npc_id → 玩家对NPC的态度 (VS)

    init() {
        this.attitudes = {}; this.playerToward = {};
        NPCPool.npcs.forEach(npc => {
            // Initial attitudes based on relative rank
            const rank = RankDB.getRankByName(npc.rank);
            const playerRank = RankDB.getRankByName(GameState.playerRank);
            const diff = rank ? rank.id - (playerRank ? playerRank.id : 0) : -99;

            if (diff >= 2)      this.attitudes[npc.id] = 15 + Math.floor(Math.random() * 10); // Superior
            else if (diff >= 0) this.attitudes[npc.id] = 35 + Math.floor(Math.random() * 15); // Peer
            else if (diff < 0)  this.attitudes[npc.id] = 50 + Math.floor(Math.random() * 15); // Subordinate
            else                this.attitudes[npc.id] = 30 + Math.floor(Math.random() * 20); // External
        });
    },

    get(npcId) { return this.attitudes[npcId] || 0; },

    getAttitudeLabel(val) {
        if (val >= 80) return { label: '铁杆', cls: 'att-green' };
        if (val >= 50) return { label: '友好', cls: 'att-green' };
        if (val >= 20) return { label: '善意', cls: 'att-gray' };
        if (val > -20) return { label: '中性', cls: 'att-gray' };
        if (val > -50) return { label: '冷淡', cls: 'att-orange' };
        if (val > -80) return { label: '敌意', cls: 'att-red' };
        return { label: '死敌', cls: 'att-red' };
    },

    adjust(npcId, delta) {
        const old = this.attitudes[npcId] || 0;
        const npc = NPCPool.getNPC(npcId);

        // Personality modifiers
        let adjustedDelta = delta;
        if (delta > 0 && npc && npc.personality.includes('感恩')) adjustedDelta *= 1.3;
        if (delta < 0 && npc && npc.personality.includes('记仇')) adjustedDelta *= 1.3;

        this.attitudes[npcId] = Math.max(-100, Math.min(100, old + Math.round(adjustedDelta)));
        return { old, new: this.attitudes[npcId], delta: Math.round(adjustedDelta) };
    },

    socialize(npcId, budgetSpend = 10) {
        const bonus = 3 + Math.floor(Math.random() * 6); // 3-8
        return this.adjust(npcId, bonus);
    },

    monthlyTick() {
        // Natural decay toward neutral — with lock-in thresholds
        const changes = [];
        for (const [npcId, val] of Object.entries(this.attitudes)) {
            const npc = NPCPool.getNPC(npcId);

            // 锁定阈值：关系到一定程度后不再自然衰减
            let decay = 0;
            if (val >= 80) {
                decay = 0; // 铁杆：永不自然衰减，只有事件能改变
            } else if (val >= 50) {
                decay = -1; // 友好：衰减减半（-1/月）
            } else if (val > 0) {
                decay = -2; // 普通正面：正常衰减
            } else if (val > -50) {
                decay = 1; // 普通负面：缓慢向中性回归（除非记仇）
            } else if (val >= -80) {
                decay = 1; // 敌意：缓慢向中性
            } else {
                decay = 0; // 死敌：不自然恢复，只有事件能改变
            }

            // 性格修正
            if (npc && npc.personality.includes('记仇') && val < 0) decay = 0;
            if (npc && npc.personality.includes('感恩') && val > 0 && decay < 0) decay = 0;
            if (npc && npc.personality.includes('圆滑') && val > 0) decay = Math.round(decay * 0.5);

            if (decay !== 0) {
                const result = this.adjust(npcId, decay);
                changes.push({ npcId, ...result });
            }
        }
        return changes;
    },

    // Aggregate into connections resource
    computeConnectionsAggregate() {
        if (Object.keys(this.attitudes).length === 0) return 0;
        let sum = 0, count = 0;
        for (const [npcId, val] of Object.entries(this.attitudes)) {
            const npc = NPCPool.getNPC(npcId);
            const weight = npc && npc.rank !== '—' ? 1.0 : 0.5;
            sum += Math.max(-100, val) * weight;
            count += weight;
        }
        return Math.round(sum / count);
    },

    getSaveState() { return { attitudes:{...this.attitudes}, playerToward:{...this.playerToward} }; },
    loadSaveState(data) { this.attitudes=data.attitudes||{}; this.playerToward=data.playerToward||{}; },
};
