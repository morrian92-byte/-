// 资源系统 — Core Layer
// 政绩、人脉、财力三个核心资源

const ResourceSystem = {
    performance: 50,
    connections: 30,
    budget: 200,

    init() {
        this.performance = 50;
        this.connections = 30;
        this.budget = 200;
    },

    // 政绩状态
    getPerformanceStatus() {
        const p = this.performance;
        if (p <= 20) return { label: '危险', cls: 'status-danger' };
        if (p <= 40) return { label: '警告', cls: 'status-warning' };
        if (p <= 60) return { label: '合格', cls: 'status-ok' };
        if (p <= 80) return { label: '良好', cls: 'status-good' };
        return { label: '卓越', cls: 'status-great' };
    },

    // 调整资源（带范围限制）
    adjustPerformance(delta) {
        const old = this.performance;
        this.performance = Math.max(0, Math.min(100, this.performance + delta));
        return { old, new: this.performance, delta };
    },

    adjustConnections(delta) {
        const old = this.connections;
        this.connections = Math.max(0, Math.min(100, this.connections + delta));
        return { old, new: this.connections, delta };
    },

    adjustBudget(delta) {
        const old = this.budget;
        this.budget = Math.max(0, this.budget + delta);
        return { old, new: this.budget, delta };
    },

    // 月度结算
    monthlyTick(activeProjectCount) {
        const rank = RankDB.getRankByName(GameState.playerRank);
        const budgetIncome = rank ? rank.budget : 20;
        // 工资：职级越高工资越多（基层股级每月5-15财力）
        const salary = rank ? Math.round(rank.budget * 0.25) : 5;

        const results = [];
        // 工资 + 财政拨款（分开显示更有真实感）
        results.push(this.adjustBudget(salary + budgetIncome - activeProjectCount * 10));

        // Connections monthly decay
        if (this.connections > 0) {
            const decay = -2;
            results.push(this.adjustConnections(decay));
        }

        return {
            salary,
            budgetIncome,
            connectionsDecay: -2,
            results,
        };
    },

    getSaveState() {
        return {
            performance: this.performance,
            connections: this.connections,
            budget: this.budget,
        };
    },

    loadSaveState(data) {
        this.performance = data.performance;
        this.connections = data.connections;
        this.budget = data.budget;
    },
};
