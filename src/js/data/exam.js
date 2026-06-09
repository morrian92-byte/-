// 公务员考试系统 — 8题混合卷

const ExamSystem = {
    questions: [
        // === 政策常识 (3题) ===
        {
            type: '政策',
            q: '我国行政体制中，乡镇政府的上级直接领导机关是：',
            options: [
                { label: 'A. 市级人民政府', score: 0 },
                { label: 'B. 县级人民政府', score: 10 },
                { label: 'C. 省级人民政府', score: 0 },
                { label: 'D. 乡镇人大', score: 5 },
            ],
        },
        {
            type: '政策',
            q: '以下哪项不属于公务员考核的「德能勤绩廉」五项内容？',
            options: [
                { label: 'A. 德 — 政治品德', score: 0 },
                { label: 'B. 能 — 业务能力', score: 0 },
                { label: 'C. 绩 — 工作实绩', score: 0 },
                { label: 'D. 权 — 权力运行', score: 10 },
            ],
        },
        {
            type: '政策',
            q: '根据《公务员法》，公务员晋升领导职务的最低年限一般为：',
            options: [
                { label: 'A. 1年', score: 0 },
                { label: 'B. 2-5年（视级别而定）', score: 10 },
                { label: 'C. 8年', score: 0 },
                { label: 'D. 没有硬性规定', score: 5 },
            ],
        },

        // === 逻辑推理 (3题) ===
        {
            type: '逻辑',
            q: '某镇有A、B、C三个村。已知：A村的GDP比B村高；C村的人均收入不是最低的。如果只有一个是正确的，那么人均收入最低的是：',
            options: [
                { label: 'A. A村', score: 5 },
                { label: 'B. B村', score: 10 },
                { label: 'C. C村', score: 5 },
                { label: 'D. 无法确定', score: 0 },
            ],
        },
        {
            type: '逻辑',
            q: '一项工作需要甲、乙、丙三人合作完成。甲单独做需12天，乙单独做需18天，丙单独做需24天。三人合作需要多少天？',
            options: [
                { label: 'A. 4.5天', score: 10 },
                { label: 'B. 5.3天', score: 0 },
                { label: 'C. 6天', score: 0 },
                { label: 'D. 8天', score: 5 },
            ],
        },
        {
            type: '逻辑',
            q: '在一次干部考察中，组织部门需要从5人中选出3人。下列条件必须满足：①如果选甲，必须选乙；②丙和丁至少选1人；③戊不能和甲同时入选。如果丙不入选，以下哪项一定为真？',
            options: [
                { label: 'A. 甲入选', score: 5 },
                { label: 'B. 丁入选', score: 10 },
                { label: 'C. 乙入选', score: 5 },
                { label: 'D. 戊不入选', score: 0 },
            ],
        },

        // === 情景判断 (2题) ===
        {
            type: '情景',
            q: '你刚参加工作，发现科室里有一位老同志经常迟到早退，但其他同事都装作没看见。你会怎么做？',
            options: [
                { label: 'A. 直接向领导反映', score: 0 },
                { label: 'B. 私下提醒老同志注意', score: 10 },
                { label: 'C. 和其他同事一起视而不见', score: 5 },
                { label: 'D. 在会议上公开指出', score: 0 },
            ],
        },
        {
            type: '情景',
            q: '分管领导安排你做一件事，但你觉得这件事不符合规定。领导说「按我说的做，有事我担着」。你的选择是：',
            options: [
                { label: 'A. 坚决拒绝执行', score: 5, profileHint:'党建' },
                { label: 'B. 口头答应，拖一拖再说', score: 10, profileHint:'综合' },
                { label: 'C. 按领导说的执行，保留记录', score: 5, profileHint:'经济' },
                { label: 'D. 直接向上级反映', score: 0, profileHint:'党建' },
            ],
        },
    ],

    // 分数→省份+岗位级别
    scoreTiers: [
        { min: 90, label: '优秀', desc: '全国选调生水平！你有权选择任何省份作为起点。',
            provinces: ['江海省','岭东省','京州市','西川省','北原省','云岭省'],
            startRank: '办事员', rankOptions: ['办事员'], positionBonus: '可优先选择核心部门岗位' },
        { min: 75, label: '良好', desc: '省级公务员水平。你可以选择较发达省份入职。',
            provinces: ['江海省','岭东省','西川省'],
            startRank: '办事员', rankOptions: ['办事员'], positionBonus: '可选较好的部门岗位' },
        { min: 60, label: '合格', desc: '市县级公务员水平。分配到中西部省份。',
            provinces: ['西川省','北原省'],
            startRank: '办事员', rankOptions: ['办事员'], positionBonus: '常规岗位分配' },
        { min: 0, label: '努力', desc: '乡镇基层公务员。从最基层开始，脚踏实地。',
            provinces: ['云岭省'],
            startRank: '办事员', rankOptions: ['办事员'], positionBonus: '基层岗位起步' },
    ],

    getTier(score) {
        for (const t of this.scoreTiers) {
            if (score >= t.min) return t;
        }
        return this.scoreTiers[this.scoreTiers.length - 1];
    },

    // 根据分数和选择的省份，给出具体地点和可选岗位
    getStartOptions(score, province) {
        const tier = this.getTier(score);
        const prov = LocationDB.provinces[province];
        if (!prov) return null;

        // 选该省第一个市作为起点（非省会 = 基层；选省会 = 市级起步暂不开放）
        const cities = Object.keys(prov.cities);
        const startCity = cities[Math.floor(Math.random() * cities.length)];
        const city = prov.cities[startCity];
        const counties = [...(city.districts || []), ...(city.counties || [])];
        const startCounty = counties[Math.floor(Math.random() * counties.length)];
        const towns = LocationDB.getTowns(startCounty);
        const startTown = towns[0];

        // 基础岗位池（根据分数微调）
        const basePositions = [
            { name: '党政办科员', dept: '党政办', profile: '综合', ppiHint: '★' },
            { name: '经济发展办科员', dept: '经济发展办', profile: '经济', ppiHint: '★★' },
            { name: '组织办干事', dept: '组织办', profile: '党建', ppiHint: '★★' },
            { name: '社会事务办科员', dept: '社会事务办', profile: '民生', ppiHint: '★' },
            { name: '财政所科员', dept: '财政所', profile: '经济', ppiHint: '★★' },
            { name: '综治办干事', dept: '综治办', profile: '维稳', ppiHint: '★' },
        ];

        // 高分额外解锁更好的起点岗位
        let positions = basePositions.slice(0, 4); // 默认4个
        if (score >= 90) positions = basePositions; // 全部6个
        else if (score >= 75) positions = basePositions.slice(0, 5); // 5个

        return {
            province,
            city: startCity,
            county: startCounty,
            town: startTown,
            fullLocation: `${province}${startCity}${startCounty}${startTown}`,
            positions,
            tier,
        };
    },
};
