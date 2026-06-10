// 岗位占用注册表 — Vertical Slice
// 追踪每个岗位被谁占据，NPC退休/调离/被查时才腾出空缺

const PositionRegistry = {
    // { positionFullName: occupantNpcId }
    occupied: {},

    init() {
        this.occupied = {};
        // 初始填充：每个 NPC 占据自己当前的岗位
        NPCPool.npcs.forEach(npc => {
            if (npc.rank && npc.rank !== '—' && npc.position) {
                const key = npc.rank + '::' + npc.position;
                this.occupied[key] = npc.id;
            }
        });
    },

    // 检查目标级别是否有空缺
    hasVacancy(targetRank) {
        // 获取该级别的所有合法岗位
        const allPositions = PositionDB.flattenRank(targetRank, GameState.playerLocation || '');
        if (allPositions.length === 0) return true; // 没有岗位定义，默认有空缺

        // 检查这些岗位中有多少被占用了
        let occupiedCount = 0;
        allPositions.forEach(p => {
            const key = targetRank + '::' + p.name;
            if (this.occupied[key]) occupiedCount++;
        });

        // 如果被占用 < 总岗位数，就有空缺
        return occupiedCount < allPositions.length;
    },

    // 获取空缺岗位列表
    getVacantPositions(targetRank) {
        const allPositions = PositionDB.flattenRank(targetRank, GameState.playerLocation || '');
        return allPositions.filter(p => {
            const key = targetRank + '::' + p.name;
            return !this.occupied[key];
        });
    },

    // 在晋升后的岗位筛选中，只保留有空缺的
    filterByVacancy(positions, targetRank) {
        return positions.filter(p => {
            const key = targetRank + '::' + p.name;
            return !this.occupied[key]; // true = 未被占用 = 有空缺
        });
    },

    // NPC/玩家 离开岗位
    vacatePosition(npcId) {
        // 玩家特殊处理：按 occupant 查找
        if (npcId === 'player') {
            for (const [key, occupant] of Object.entries(this.occupied)) {
                if (occupant === 'player') {
                    delete this.occupied[key];
                    return { npcId: 'player', reason: '腾出空缺' };
                }
            }
            return null;
        }
        const npc = NPCPool.getNPC(npcId);
        if (!npc || !npc.rank || !npc.position) return;
        const key = npc.rank + '::' + npc.position;
        if (this.occupied[key] === npcId) {
            delete this.occupied[key];
            return { npcId, rank: npc.rank, position: npc.position, reason: '腾出空缺' };
        }
        return null;
    },

    // 玩家晋升后占据新岗位
    occupyPosition(rank, position, playerId = 'player') {
        const key = rank + '::' + position;
        this.occupied[key] = playerId;
    },

    // 月度维护：检查 NPC 退休/调离
    monthlyTick() {
        const events = [];
        NPCPool.npcs.forEach(npc => {
            // 退休检查
            if (npc.age >= 60 && npc.rank && npc.rank !== '—') {
                const result = this.vacatePosition(npc.id);
                if (result) {
                    result.reason = '退休';
                    events.push(result);
                    // 标记 NPC 为退休状态
                    npc.retired = true;
                }
            }
            // 随机调离（小概率，仅限有职级的 NPC）
            if (!npc.retired && npc.rank && npc.rank !== '—' && Math.random() < 0.01) {
                const result = this.vacatePosition(npc.id);
                if (result) {
                    result.reason = '调离';
                    events.push(result);
                }
            }
        });
        return events;
    },

    getSaveState() {
        return { occupied: { ...this.occupied } };
    },

    loadSaveState(data) {
        this.occupied = data.occupied || {};
    },
};
