// 部门特色行动库 — Vertical Slice
// 每个部门 2-3 个专属行动，替代通用「常规工作」

const DeptActions = {
    // key = 部门名，value = 特色行动列表
    actions: {
        // ====== 经济类 ======
        '经济发展办': [
            { label: '🏭 外出招商', cost: 8, desc: '带队去外地对接企业，争取投资项目落地',
                effects: { perf: 4, budget: -8 }, bonus: '30%概率额外获得一个招商项目' },
            { label: '📊 企业走访', desc: '走访辖区内重点企业，了解经营困难',
                effects: { perf: 2, conn: 2 }, bonus: '可能发现灰色操作机会' },
        ],
        '财政所': [
            { label: '💰 预算调剂', cost: 0, desc: '在各项目间灵活调配资金，提高使用效率',
                effects: { perf: 3, budget: 10 }, bonus: '15%概率触发审计关注' },
            { label: '📋 资金审核', desc: '严格审核各部门报销单据',
                effects: { perf: 2 }, bonus: '降低全镇灰色风险 -3' },
        ],
        '发改委': [
            { label: '🏗️ 项目立项', cost: 15, desc: '启动一个重点项目的前期论证和报批',
                effects: { perf: 5, budget: -15 }, bonus: '可能解锁新项目模板' },
            { label: '📈 经济调度', desc: '召开经济形势分析会，协调各部门',
                effects: { perf: 3, conn: 2 }, bonus: '所有活跃项目进度+1' },
        ],
        '财政局': [
            { label: '💳 预算分配', desc: '制定下季度的预算分配方案',
                effects: { perf: 4, conn: 3 }, bonus: '政绩高的部门多给，人脉涨' },
            { label: '🔍 财务审计', desc: '对重点部门开展财务审计',
                effects: { perf: 2 }, bonus: '发现灰色操作可选择性处置' },
        ],
        '住建局': [
            { label: '🏠 规划审批', cost: 5, desc: '审批建设项目规划方案',
                effects: { perf: 3, budget: -5 }, bonus: '审批权带来灰色机会' },
            { label: '🚧 质量检查', desc: '抽查在建工程质量',
                effects: { perf: 2 }, bonus: '降低项目事故风险' },
        ],
        '交通局': [
            { label: '🛣️ 工程推进', cost: 12, desc: '集中力量推进交通项目',
                effects: { perf: 4, budget: -12 }, bonus: '所有交通类项目进度+2' },
            { label: '🚌 运输调度', desc: '协调公共交通运力',
                effects: { perf: 2, conn: 2 }, bonus: '提升民生指标' },
        ],
        '城投公司': [
            { label: '🏢 土地开发', desc: '主导土地一级开发项目',
                effects: { perf: 5, budget: 30 }, bonus: '高风险高回报，灰色机会极大' },
            { label: '🤝 融资洽谈', desc: '对接银行和金融机构争取融资',
                effects: { perf: 2, conn: 3, budget: 20 }, bonus: '人脉越高成功率越高' },
        ],

        // ====== 民生类 ======
        '社会事务办': [
            { label: '🎓 教育督导', desc: '检查辖区内学校教学质量和安全',
                effects: { perf: 2 }, bonus: '提升民生指标' },
            { label: '🏥 卫生巡查', desc: '检查卫生院和村卫生室运行情况',
                effects: { perf: 3 }, bonus: '降低公共卫生事件概率' },
        ],
        '农业农村局': [
            { label: '🌾 产业扶持', cost: 8, desc: '扶持特色农产品产业发展',
                effects: { perf: 4, budget: -8 }, bonus: '长期提升 GDP 基线' },
            { label: '🏘️ 乡村振兴', desc: '推进乡村振兴项目建设',
                effects: { perf: 3, conn: 3 }, bonus: '可能获得上级表彰' },
        ],
        '教育局': [
            { label: '📚 师资建设', cost: 5, desc: '引进优秀教师，改善教学条件',
                effects: { perf: 3, budget: -5 }, bonus: '长期提升民生指标' },
            { label: '🏫 校园安全', desc: '全面排查校园安全隐患',
                effects: { perf: 2 }, bonus: '降低安全事故概率' },
        ],
        '卫健委': [
            { label: '💉 公卫防控', desc: '加强公共卫生监测和防控',
                effects: { perf: 3 }, bonus: '降低突发公卫事件概率' },
            { label: '🏥 医改推进', cost: 10, desc: '推进基层医疗体制改革',
                effects: { perf: 4, budget: -10, conn: 2 }, bonus: '提升民生指标' },
        ],

        // ====== 维稳类 ======
        '综治办': [
            { label: '📝 信访化解', desc: '主动约访重点信访人员，化解矛盾',
                effects: { perf: 2 }, bonus: '降低群体事件概率' },
            { label: '🔐 安全排查', desc: '对重点场所开展安全隐患排查',
                effects: { perf: 3 }, bonus: '降低安全事故概率' },
        ],
        '公安局': [
            { label: '👮 专项行动', desc: '组织开展治安专项整治',
                effects: { perf: 4, conn: 2 }, bonus: '大幅降低治安风险' },
            { label: '🔍 案件督办', desc: '亲自督办重点案件的侦办',
                effects: { perf: 3 }, bonus: '选择性执法的灰色机会' },
        ],
        '应急管理局': [
            { label: '🚨 应急演练', desc: '组织开展安全生产应急演练',
                effects: { perf: 2 }, bonus: '降低事故伤亡概率' },
            { label: '📋 执法检查', desc: '对重点企业开展安全生产执法',
                effects: { perf: 3 }, bonus: '可选择性处罚（灰色操作）' },
        ],
        '信访局': [
            { label: '🤝 领导接访', desc: '安排领导接待信访群众',
                effects: { perf: 2, conn: 2 }, bonus: '可能化解长期积案' },
            { label: '📞 热线督办', desc: '督办 12345 热线群众诉求',
                effects: { perf: 3 }, bonus: '提升民生指标' },
        ],

        // ====== 党建类 ======
        '组织办': [
            { label: '📋 干部考察', desc: '深入考察后备干部人选',
                effects: { perf: 1, conn: 4 }, bonus: '可能发现可培养的亲信' },
            { label: '🏫 党校培训', desc: '组织干部参加党校学习培训',
                effects: { perf: 2, conn: 2 }, bonus: '提升下属能力值' },
        ],
        '组织部': [
            { label: '👤 人事调配', desc: '研究干部调整方案',
                effects: { perf: 2, conn: 5 }, bonus: '有权推荐自己人上位' },
            { label: '📊 班子研判', desc: '对各单位的班子运行进行分析研判',
                effects: { perf: 1 }, bonus: '获取大量内部信息（信息权+）' },
        ],
        '纪委': [
            { label: '🔍 线索核查', desc: '对收到的举报线索进行核查',
                effects: { perf: 3 }, bonus: '可选择性处理对手或盟友' },
            { label: '📝 廉政教育', desc: '组织开展廉政警示教育活动',
                effects: { perf: 2, conn: -2 }, bonus: '整体降低灰色风险' },
        ],
        '团县委': [
            { label: '🌟 青年活动', desc: '组织青年干部交流活动',
                effects: { perf: 2, conn: 4 }, bonus: '培养下一代亲信网络' },
            { label: '🎯 推优入党', desc: '推荐优秀青年加入党组织',
                effects: { perf: 2, conn: 3 }, bonus: '增加执政党影响力' },
        ],

        // ====== 综合类 ======
        '党政办': [
            { label: '📄 综合协调', desc: '协调各部门推进重点工作',
                effects: { perf: 2 }, bonus: '所有活跃项目进度+1' },
            { label: '📰 信息报送', desc: '向上级报送重要工作信息',
                effects: { perf: 2, conn: 1 }, bonus: '可能获得上级关注' },
        ],
        '县委办': [
            { label: '📋 督查督办', desc: '对重点事项进行督查',
                effects: { perf: 3 }, bonus: '加速项目完成' },
            { label: '📝 文稿起草', desc: '起草重要会议讲话和文件',
                effects: { perf: 2, conn: 3 }, bonus: '接近核心权力圈' },
        ],
        '人社局': [
            { label: '👥 招聘录用', desc: '组织事业单位公开招聘',
                effects: { perf: 2, conn: 3 }, bonus: '灰色机会：安排自己人' },
            { label: '📊 社保核查', desc: '核查社保基金运行情况',
                effects: { perf: 2 }, bonus: '发现社保漏洞可上报或利用' },
        ],
        '审计局': [
            { label: '🔍 专项审计', desc: '对重点部门开展专项审计',
                effects: { perf: 4 }, bonus: '发现问题的处理方式极有影响力' },
            { label: '📋 离任审计', desc: '对离任干部进行经济责任审计',
                effects: { perf: 2, conn: -3 }, bonus: '可选择性报告发现的问题' },
        ],
    },

    // 根据玩家当前部门返回特色行动
    getActions() {
        const dept = this.getPlayerDept();
        const generic = [{ label: '📋 常规工作', desc: '完成本月例行工作任务', effects: { perf: 1.5 }, bonus: '' }];
        if (!dept) return generic;

        const deptActions = this.actions[dept];
        if (!deptActions) return generic;

        // 返回特色行动 + 常规工作兜底
        return [...deptActions, ...generic];
    },

    // 从玩家岗位提取部门名
    getPlayerDept() {
        const pos = GameState.playerPosition || '';
        // 从完整岗位名中提取部门：如 "临溪县青石镇·经济发展办副主任" → "经济发展办"
        // 或者 "临溪县发改委副主任" → "发改委"
        const knownDepts = Object.keys(this.actions);
        for (const dept of knownDepts) {
            if (pos.includes(dept)) return dept;
        }
        // 尝试用 PositionDB 的映射
        if (PositionDB.getProfileForDept) {
            // 反向：从 position 名中找部门
            for (const dept of knownDepts) {
                if (pos.includes(dept)) return dept;
            }
        }
        return null;
    },
};
