// 灰色地带系统 — Feature Layer

const GrayZoneSystem = {
    operationHistory: [],
    exposureCount: 0,
    riskLevel: 0,
    _cleanMonths: 0, // 连续无操作月数

    init() {
        this.operationHistory = [];
        this.exposureCount = 0;
        this.riskLevel = 0;
        this._cleanMonths = 0;
    },

    recordOperation(level, baseRisk) {
        const eraModifier = TimeSystem.eraData.corruptionRisk;
        const historyModifier = 1 + this.operationHistory.length * 0.2;
        const actualRisk = baseRisk * eraModifier * historyModifier;

        this.operationHistory.push({ level, baseRisk, actualRisk, month: TimeSystem.totalMonths });
        this.riskLevel += actualRisk;
        this._cleanMonths = 0; // 重置无操作计数

        return { actualRisk, totalRisk: this.riskLevel };
    },

    // 距离上次操作几个月
    monthsSinceLastOp() {
        if (this.operationHistory.length === 0) return 999;
        return TimeSystem.totalMonths - this.operationHistory[this.operationHistory.length - 1].month;
    },

    // 风险自然消退：每连续3个月无操作 -5
    monthlyTick() {
        this._cleanMonths++;

        if (this._cleanMonths >= 3) {
            const decay = Math.floor(this._cleanMonths / 3) * 5;
            this.riskLevel = Math.max(0, this.riskLevel - decay);
            this._cleanMonths = this._cleanMonths % 3; // 保留余数
        }

        return this.checkExposure();
    },

    checkExposure() {
        if (this.riskLevel <= 0) return null;
        const exposureChance = Math.min(0.8, this.riskLevel / 100);
        if (Math.random() < exposureChance) {
            this.exposureCount++;
            const perfPenalty = -(10 + this.exposureCount * 10);
            ResourceSystem.adjustPerformance(perfPenalty);
            this.riskLevel = Math.max(0, this.riskLevel - 30);
            return { exposed: true, perfPenalty, totalExposures: this.exposureCount };
        }
        return { exposed: false };
    },

    getSaveState() {
        return {
            operationHistory: this.operationHistory.map(o => ({...o})),
            exposureCount: this.exposureCount,
            riskLevel: this.riskLevel,
            _cleanMonths: this._cleanMonths,
        };
    },
    loadSaveState(data) {
        this.operationHistory = data.operationHistory || [];
        this.exposureCount = data.exposureCount || 0;
        this.riskLevel = data.riskLevel || 0;
        this._cleanMonths = data._cleanMonths || 0;
    },
};
