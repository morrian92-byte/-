// 数据持久化系统 — Foundation Layer
// localStorage 存档/读档，3手动槽位 + 1自动槽位

const Persistence = {
    SAVE_PREFIX: 'bbgs_save_',
    MAX_MANUAL_SLOTS: 3,
    AUTO_SLOT: 'auto',

    // 收集所有系统的状态
    collectGameState(saveName = '') {
        return {
            version: '1.0',
            saveName: saveName || `存档_${new Date().toLocaleString('zh-CN')}`,
            timestamp: new Date().toISOString(),
            time: TimeSystem.getSaveState(),
            resources: ResourceSystem.getSaveState(),
            npcs: NPCPool.getSaveState(),
            relationships: RelationshipSystem.getSaveState(),
            projects: ProjectSystem.getSaveState(),
            events: EventSystem.getSaveState(),
            evaluation: EvaluationSystem.getSaveState(),
            grayZone: GrayZoneSystem.getSaveState(),
            playerRank: GameState.playerRank,
            playerParty: GameState.playerParty,
            playerPartyPosition: GameState.playerPartyPosition,
            playerPosition: GameState.playerPosition,
            playerProfile: GameState.playerProfile,
            playerLocation: GameState.playerLocation,
            playerName: GameState.playerName,
            playerGender: GameState.playerGender,
            examScore: GameState.examScore,
            examTier: GameState.examTier,
            proteges: GameState.proteges || [],
        };
    },

    // 应用到所有系统
    applyGameState(state) {
        TimeSystem.loadSaveState(state.time);
        ResourceSystem.loadSaveState(state.resources);
        NPCPool.loadSaveState(state.npcs || {});
        if (!NPCPool.npcs || NPCPool.npcs.length === 0) {
            NPCPool.init(); // 旧存档没有NPC数据，自动生成
        }
        RelationshipSystem.loadSaveState(state.relationships || {});
        if (Object.keys(RelationshipSystem.attitudes).length === 0) {
            RelationshipSystem.init(); // 关系数据缺失，重新初始化
        }
        ProjectSystem.loadSaveState(state.projects || {});
        EventSystem.loadSaveState(state.events || {});
        EvaluationSystem.loadSaveState(state.evaluation || {});
        GrayZoneSystem.loadSaveState(state.grayZone || {});
        GameState.playerRank = state.playerRank;
        GameState.playerParty = state.playerParty;
        GameState.playerPartyPosition = state.playerPartyPosition;
        GameState.playerPosition = state.playerPosition || '';
        GameState.playerProfile = state.playerProfile || '综合';
        GameState.playerLocation = state.playerLocation || '';
        GameState.playerName = state.playerName || '张三';
        GameState.playerGender = state.playerGender || '男';
        GameState.examScore = state.examScore || 60;
        GameState.examTier = state.examTier || '合格';
        GameState.proteges = state.proteges || [];
    },

    save(slotIndex, saveName = '') {
        if (!TimeSystem.canSave()) return { success: false, reason: '当前状态不允许存档' };

        const state = this.collectGameState(saveName);
        const key = this.SAVE_PREFIX + slotIndex;
        try {
            localStorage.setItem(key, JSON.stringify(state));
            return { success: true, slot: slotIndex, state };
        } catch (e) {
            return { success: false, reason: '存储空间不足，请清理旧存档' };
        }
    },

    autoSave() {
        const state = this.collectGameState('自动存档');
        try {
            localStorage.setItem(this.SAVE_PREFIX + this.AUTO_SLOT, JSON.stringify(state));
            return true;
        } catch (e) {
            return false;
        }
    },

    load(slotIndex) {
        const key = this.SAVE_PREFIX + slotIndex;
        const raw = localStorage.getItem(key);
        if (!raw) return { success: false, reason: '存档不存在' };

        try {
            const state = JSON.parse(raw);
            if (state.version !== '1.0') {
                return { success: false, reason: '存档版本不兼容' };
            }
            this.applyGameState(state);
            return { success: true, state };
        } catch (e) {
            return { success: false, reason: '存档数据损坏' };
        }
    },

    deleteSave(slotIndex) {
        localStorage.removeItem(this.SAVE_PREFIX + slotIndex);
    },

    getSlotInfo(slotIndex) {
        const raw = localStorage.getItem(this.SAVE_PREFIX + slotIndex);
        if (!raw) return null;
        try {
            const state = JSON.parse(raw);
            return {
                name: state.saveName,
                time: state.timestamp,
                date: state.time ? `${state.time.year}年${state.time.month}月` : '?',
                rank: state.playerRank || '?',
            };
        } catch (e) {
            return { name: '损坏的存档', time: '', date: '?', rank: '?' };
        }
    },

    getAllSlots() {
        const slots = {};
        for (let i = 0; i < this.MAX_MANUAL_SLOTS; i++) {
            slots[i] = this.getSlotInfo(i);
        }
        slots[this.AUTO_SLOT] = this.getSlotInfo(this.AUTO_SLOT);
        return slots;
    },
};
