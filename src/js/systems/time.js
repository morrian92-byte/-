// 时间系统 — Foundation Layer
// 管理游戏时钟：月推进、年轮转、状态机

const TimeSystem = {
    year: 2022,
    month: 1,
    era: '新时代',
    startYear: 2022,
    startAge: 22,
    playerAge: 22,
    state: 'NORMAL', // NORMAL | CRISIS_PAUSED | YEAR_END | TERM_END | CAREER_END
    termMonthsElapsed: 0,
    termMonthsTotal: 60, // 5年任期
    yearsAtCurrentRank: 0, // 当前职级已停留年数
    lastPromotionYear: null,

    // 年代参数
    eraParams: {
        '建国初期':     { gdpGrowth: 8, corruptionRisk: 0.7, label: '1950s-1965' },
        '文革时期':     { gdpGrowth: 2, corruptionRisk: 1.5, label: '1966-1976' },
        '拨乱反正':     { gdpGrowth: 5, corruptionRisk: 0.8, label: '1977-1983' },
        '改革开放初期': { gdpGrowth: 12, corruptionRisk: 0.9, label: '1984-1992' },
        '市场经济时代': { gdpGrowth: 14, corruptionRisk: 1.0, label: '1993-2005' },
        '新世纪':       { gdpGrowth: 10, corruptionRisk: 1.2, label: '2006-2015' },
        '新时代':       { gdpGrowth: 6, corruptionRisk: 1.8, label: '2016至今' },
    },

    init(era = '新时代', startYear = 2022) {
        this.era = era;
        this.year = startYear;
        this.startYear = startYear;
        this.month = 1;
        this.playerAge = this.startAge;
        this.state = 'NORMAL';
        this.termMonthsElapsed = 0;
        this.yearsAtCurrentRank = 0;
        this.lastPromotionYear = null;
    },

    onPromotion() {
        this.lastPromotionYear = this.year;
        this.yearsAtCurrentRank = 0;
        this.termMonthsElapsed = 0;
    },

    get currentQuarter() { return Math.ceil(this.month / 3); },
    get yearsPassed() { return this.year - this.startYear; },
    get totalMonths() { return this.yearsPassed * 12 + this.month - 1; },
    get termMonthsRemaining() { return this.termMonthsTotal - this.termMonthsElapsed; },
    get isTermEnding() { return this.termMonthsRemaining <= 3 && this.termMonthsRemaining > 0; },
    get isRetirementAge() { return this.playerAge >= 60; },
    get dateString() { return `${this.year}年${this.month}月`; },
    get eraData() { return this.eraParams[this.era] || this.eraParams['新时代']; },

    advanceMonth() {
        if (this.state === 'CRISIS_PAUSED') return false;

        this.month++;
        this.termMonthsElapsed++;

        if (this.month > 12) {
            this.month = 1;
            this.year++;
            this.playerAge++;
            this.yearsAtCurrentRank++;
            this.state = 'YEAR_END';
        }

        // Check retirement
        if (this.isRetirementAge) {
            this.state = 'CAREER_END';
        }

        // Check term end
        if (this.termMonthsElapsed >= this.termMonthsTotal) {
            this.state = 'TERM_END';
        }

        return true;
    },

    resolveState() {
        if (this.state === 'YEAR_END' || this.state === 'TERM_END') {
            this.state = 'NORMAL';
        }
        if (this.state === 'TERM_END') {
            this.termMonthsElapsed = 0; // Reset for new term
        }
    },

    pauseForCrisis() { this.state = 'CRISIS_PAUSED'; },
    resumeFromCrisis() { this.state = 'NORMAL'; },
    canEndMonth() { return this.state === 'NORMAL'; },
    canSave() { return this.state === 'NORMAL'; },

    getSaveState() {
        return {
            year: this.year, month: this.month, era: this.era,
            startYear: this.startYear, playerAge: this.playerAge,
            state: this.state, termMonthsElapsed: this.termMonthsElapsed,
            yearsAtCurrentRank: this.yearsAtCurrentRank,
            lastPromotionYear: this.lastPromotionYear,
        };
    },

    loadSaveState(data) {
        Object.assign(this, data);
    },
};
