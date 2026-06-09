// 项目管理系统 — Core Layer

const ProjectSystem = {
    templates: [
        { name: '工业园区道路硬化', category: '基础设施', duration: 8, costPerMonth: 15, rewardPerf: 15, rewardConn: 5 },
        { name: '农村安全饮水工程', category: '基础设施', duration: 6, costPerMonth: 10, rewardPerf: 12, rewardConn: 3 },
        { name: '引进电子加工企业', category: '招商引资', duration: 6, costPerMonth: 12, rewardPerf: 18, rewardConn: 8 },
        { name: '特色农产品推广', category: '招商引资', duration: 4, costPerMonth: 8, rewardPerf: 10, rewardConn: 5 },
        { name: '贫困户危房改造', category: '民生', duration: 5, costPerMonth: 12, rewardPerf: 12, rewardConn: 8 },
        { name: '义务教育均衡发展', category: '民生', duration: 4, costPerMonth: 8, rewardPerf: 8, rewardConn: 5 },
        { name: '信访积案化解', category: '维稳', duration: 3, costPerMonth: 5, rewardPerf: 5, rewardConn: 3 },
        { name: '安全生产专项整治', category: '维稳', duration: 2, costPerMonth: 5, rewardPerf: 4, rewardConn: 2 },
        { name: '党员学习教育活动', category: '党建', duration: 2, costPerMonth: 3, rewardPerf: 3, rewardConn: 4 },
        { name: '基层组织规范化建设', category: '党建', duration: 3, costPerMonth: 4, rewardPerf: 4, rewardConn: 5 },
    ],

    activeProjects: [],
    completedHistory: [],

    init() {
        this.activeProjects = [];
        this.completedHistory = [];
    },

    startProject(templateIndex) {
        const tpl = this.templates[templateIndex];
        if (!tpl) return null;
        const project = {
            id: 'proj_' + Date.now(),
            ...tpl,
            progress: 0,
            status: '进行中',
            startMonth: TimeSystem.totalMonths,
        };
        this.activeProjects.push(project);
        return project;
    },

    advanceProject(projectId) {
        const proj = this.activeProjects.find(p => p.id === projectId);
        if (!proj) return null;
        proj.progress++;
        if (proj.progress >= proj.duration) {
            proj.status = '已完成';
            this.activeProjects = this.activeProjects.filter(p => p.id !== projectId);
            this.completedHistory.push(proj);

            // Grant rewards
            ResourceSystem.adjustPerformance(proj.rewardPerf);
            ResourceSystem.adjustConnections(proj.rewardConn);
            return { completed: true, rewards: { perf: proj.rewardPerf, conn: proj.rewardConn } };
        }
        return { completed: false };
    },

    monthlyTick() {
        let totalCost = 0;
        const completed = [];

        this.activeProjects.forEach(p => {
            totalCost += p.costPerMonth;
            p.progress++; // 每月自动推进 1 格

            if (p.progress >= p.duration) {
                p.status = '已完成';
                completed.push(p);
                ResourceSystem.adjustPerformance(p.rewardPerf);
                ResourceSystem.adjustConnections(p.rewardConn);
            }
        });

        // Remove completed projects
        if (completed.length > 0) {
            this.activeProjects = this.activeProjects.filter(p => !completed.includes(p));
            this.completedHistory.push(...completed);
        }

        if (totalCost > 0) {
            ResourceSystem.adjustBudget(-totalCost);
        }

        return { totalCost, completed, activeCount: this.activeProjects.length };
    },

    getSaveState() {
        return {
            activeProjects: this.activeProjects.map(p => ({...p})),
            completedHistory: this.completedHistory.map(p => ({...p})),
        };
    },
    loadSaveState(data) {
        this.activeProjects = data.activeProjects || [];
        this.completedHistory = data.completedHistory || [];
    },
};
