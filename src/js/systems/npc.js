// NPC 系统 — Core Layer

const NPCPool = {
    personalities: ['保守','务实','记仇','圆滑','正直','贪婪','勤奋','懒惰','野心','感恩','嫉妒','忠诚'],
    surnames: ['张','王','李','赵','陈','刘','黄','周','吴','郑','孙','朱','马','胡','林','何','高','罗','郭','杨'],
    givenNames: ['卫民','建国','志强','文博','明远','德胜','永康','学军','伟民','海峰','志远','建华','国强','振华','玉兰','秀英','桂英','秀珍','凤英','美玲'],

    npcs: [],

    init() {
        // Generate 10 township NPCs for MVP
        this.npcs = [];
        this.generateNPC('张德胜', '正科级', '镇党委书记', ['务实','正直'], '执政党', 8);
        this.generateNPC('王建国', '正科级', '镇长', ['圆滑','野心'], '执政党', 7);
        this.generateNPC('李卫民', '副科级', '镇党委副书记', ['保守','记仇'], '执政党', 5);
        this.generateNPC('赵永康', '副科级', '副镇长(经济)', ['务实','勤奋'], '无党派', 4);
        this.generateNPC('陈志强', '副科级', '副镇长(农业)', ['懒惰','感恩'], '执政党', 3);
        this.generateNPC('刘明远', '正股级', '经济发展办主任', ['野心','嫉妒'], '执政党', 6);
        this.generateNPC('黄振华', '副股级', '组织干事', ['正直','勤奋'], '执政党', 2);
        this.generateNPC('周海峰', '办事员', '经济发展办科员', ['勤奋','感恩'], '无党派', 1);
        this.generateNPC('马大富', null, '恒通建材公司老板', ['贪婪','圆滑'], '无党派', 0);
        this.generateNPC('林玉兰', null, '东风村支书', ['务实','正直'], '执政党', 0);
    },

    generateNPC(name, rank, position, personality, party, corruptionTolerance, patron = null) {
        const ceilingRank = rank ? RankDB.getRankByName(rank) : null;
        const ceilingTier = RankDB.rollCeiling();

        const npc = {
            id: 'npc_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            name, age: 30 + Math.floor(Math.random() * 25),
            rank: rank || '—', position, personality,
            faction: null, party,
            ambition: 1 + Math.floor(Math.random() * 10),
            competence: 1 + Math.floor(Math.random() * 10),
            loyalty: 1 + Math.floor(Math.random() * 10),
            corruptionTolerance,
            ceilingTier,
            ceilingRank: ceilingRank ? ceilingRank.name : ceilingTier,
            patron,
        };
        this.npcs.push(npc);
        return npc;
    },

    getNPC(id) { return this.npcs.find(n => n.id === id); },
    getNPCsByRank(rank) { return this.npcs.filter(n => n.rank === rank); },

    getSaveState() {
        return { npcs: this.npcs.map(n => ({...n})) };
    },

    loadSaveState(data) {
        this.npcs = data.npcs || [];
    },
};
