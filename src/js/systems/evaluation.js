// 考核系统 — Core Layer

const EvaluationSystem = {
    monthlyScores: [],
    quarterlyScores: [],
    annualRatings: [],

    init() {
        this.monthlyScores = [];
        this.quarterlyScores = [];
        this.annualRatings = [];
    },

    monthlyEval() {
        const completionRate = ProjectSystem.activeProjects.length > 0
            ? ProjectSystem.completedHistory.filter(p => p.startMonth >= TimeSystem.totalMonths - 1).length
              / Math.max(1, ProjectSystem.activeProjects.length + ProjectSystem.completedHistory.length)
            : 0.5;
        const score = Math.round(completionRate * 100);
        this.monthlyScores.push(score);
        return score;
    },

    quarterlyEval() {
        if (TimeSystem.month % 3 !== 0) return null;
        const recent = this.monthlyScores.slice(-3);
        const avg = recent.length > 0 ? Math.round(recent.reduce((a,b) => a+b, 0) / recent.length) : 50;
        this.quarterlyScores.push(avg);
        return avg;
    },

    annualEval() {
        const projectCompl = ProjectSystem.completedHistory.filter(
            p => p.startMonth >= TimeSystem.totalMonths - 12
        ).length;
        const target = 3; // Expected completions per year
        const projectScore = Math.min(100, Math.round((projectCompl / target) * 100 * 0.25));

        const gdpScore = Math.min(100, Math.round((TimeSystem.eraData.gdpGrowth / 14) * 100 * 0.20));
        const fiscalScore = 60 + Math.floor(Math.random() * 30); // Simplified for MVP
        const livelihoodScore = 50 + Math.floor(Math.random() * 40);
        const stabilityScore = 70 + Math.floor(Math.random() * 20);

        const perf = ResourceSystem.performance;
        let integrityScore;
        if (GrayZoneSystem.operationHistory.length === 0) integrityScore = 90;
        else if (GrayZoneSystem.exposureCount === 0) integrityScore = 60;
        else integrityScore = Math.max(0, 60 - GrayZoneSystem.exposureCount * 20);

        const total = projectScore + gdpScore + fiscalScore * 0.15 + livelihoodScore * 0.15
            + stabilityScore * 0.15 + integrityScore * 0.10;

        let rating;
        if (total >= 90) rating = '优秀';
        else if (total >= 75) rating = '良好';
        else if (total >= 60) rating = '合格';
        else if (total >= 40) rating = '基本合格';
        else rating = '不合格';

        this.annualRatings.push({ year: TimeSystem.year, total, rating });
        return { total: Math.round(total), rating };
    },

    getSaveState() {
        return {
            monthlyScores: [...this.monthlyScores],
            quarterlyScores: [...this.quarterlyScores],
            annualRatings: this.annualRatings.map(r => ({...r})),
        };
    },
    loadSaveState(data) {
        this.monthlyScores = data.monthlyScores || [];
        this.quarterlyScores = data.quarterlyScores || [];
        this.annualRatings = data.annualRatings || [];
    },
};
