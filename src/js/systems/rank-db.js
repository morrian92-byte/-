// 职级数据库 — Foundation Layer
// 13级职级定义 + 晋升门槛 + 层级分布

const RankDB = {
    ranks: [
        // id, name, short, minYears, perfLine, attLine, partyReq, budget, tier, minAge, windowClose, secondLine
        { id: 1,  name: '办事员',  short: '—',    minYears: 0, perfLine: 0,  attLine: 0,  partyReq: null,  budget: 10,  tier: '股级', minAge:22, windowClose:-1, secondLine:-1 },
        { id: 2,  name: '副股级',  short: '副股', minYears: 2, perfLine: 40, attLine: 0,  partyReq: null,  budget: 15,  tier: '股级', minAge:24, windowClose:35, secondLine:-1 },
        { id: 3,  name: '正股级',  short: '正股', minYears: 2, perfLine: 45, attLine: 10, partyReq: null,  budget: 20,  tier: '股级', minAge:26, windowClose:38, secondLine:-1 },
        { id: 4,  name: '副科级',  short: '副科', minYears: 3, perfLine: 55, attLine: 20, partyReq: null,  budget: 30,  tier: '科级', minAge:28, windowClose:42, secondLine:50 },
        { id: 5,  name: '正科级',  short: '正科', minYears: 3, perfLine: 60, attLine: 25, partyReq: null,  budget: 40,  tier: '科级', minAge:30, windowClose:45, secondLine:52 },
        { id: 6,  name: '副处级',  short: '副处', minYears: 4, perfLine: 65, attLine: 35, partyReq: '党委委员',   budget: 60,  tier: '处级', minAge:33, windowClose:48, secondLine:54 },
        { id: 7,  name: '正处级',  short: '正处', minYears: 4, perfLine: 70, attLine: 40, partyReq: '党委常委',   budget: 80,  tier: '处级', minAge:36, windowClose:50, secondLine:55 },
        { id: 8,  name: '副厅级',  short: '副厅', minYears: 5, perfLine: 75, attLine: 50, partyReq: '党委副书记', budget: 120, tier: '厅级', minAge:40, windowClose:53, secondLine:57 },
        { id: 9,  name: '正厅级',  short: '正厅', minYears: 5, perfLine: 80, attLine: 55, partyReq: '党委书记',   budget: 160, tier: '厅级', minAge:43, windowClose:55, secondLine:58 },
        { id: 10, name: '副部级',  short: '副部', minYears: 6, perfLine: 85, attLine: 65, partyReq: '政治局候补', budget: 250, tier: '部级', minAge:48, windowClose:58, secondLine:60 },
        { id: 11, name: '正部级',  short: '正部', minYears: 6, perfLine: 90, attLine: 75, partyReq: '中央委员',   budget: 400, tier: '部级', minAge:52, windowClose:60, secondLine:-1 },
        { id: 12, name: '副国级',  short: '副国', minYears:-1, perfLine:-1, attLine:-1, partyReq: '政治局委员', budget: 800, tier: '国家级', minAge:55, windowClose:-1, secondLine:-1 },
        { id: 13, name: '正国级',  short: '正国', minYears:-1, perfLine:-1, attLine:-1, partyReq: '政治局常委', budget:1200,tier: '国家级', minAge:58, windowClose:-1, secondLine:-1 },
    ],
    // 按年龄找最高可达级别
    getMaxRankForAge(age) {
        let best = this.ranks[0];
        for (const r of this.ranks) {
            if (r.minAge <= age) best = r;
        }
        return best;
    },
    // 晋升窗口是否关闭
    isWindowClosed(rankId, age) {
        const rank = this.getRank(rankId);
        if (!rank || rank.windowClose < 0) return false;
        return age >= rank.windowClose;
    },
    // 窗口剩余年限
    windowYearsRemaining(rankId, age) {
        const rank = this.getRank(rankId);
        if (!rank || rank.windowClose < 0) return 99;
        return Math.max(0, rank.windowClose - age);
    },
    // 是否到退居二线年龄
    isSecondLine(rankId, age) {
        const rank = this.getRank(rankId);
        if (!rank || rank.secondLine < 0) return false;
        return age >= rank.secondLine;
    },

    // 晋升层级分布（用于NPC天花板）
    distribution: [
        { tier: '股级', pct: 35 },
        { tier: '科级', pct: 25 },
        { tier: '处级', pct: 20 },
        { tier: '厅级', pct: 10 },
        { tier: '部级', pct: 7 },
        { tier: '国家级', pct: 3 },
    ],

    getRank(id) { return this.ranks.find(r => r.id === id); },
    getNextRank(id) { return this.ranks.find(r => r.id === id + 1) || null; },

    getRankByName(name) { return this.ranks.find(r => r.name === name); },

    getPromotionRequirements(currentRankId) {
        const next = this.getNextRank(currentRankId);
        if (!next) return null;
        return {
            targetRank: next.name,
            minYears: next.minYears,
            perfLine: next.perfLine,
            attLine: next.attLine,
            partyReq: next.partyReq,
        };
    },

    rollCeiling() {
        const roll = Math.random() * 100;
        let cum = 0;
        for (const d of this.distribution) {
            cum += d.pct;
            if (roll <= cum) return d.tier;
        }
        return '股级';
    },

    getSaveState() {
        return {}; // Static data, no state to save
    },
};
