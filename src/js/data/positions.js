// 岗位库 — PPI含权量公式 + 级别绑定 + 部门特色

const PPI = {
    // PPI = sum(维度×权重) × (1 - 风险×0.03)
    calc(caiQuan, renQuan, shiQuan, xinXiQuan, jinSheng, fengXian) {
        const raw = caiQuan * 0.25 + renQuan * 0.25 + shiQuan * 0.20 + xinXiQuan * 0.15 + jinSheng * 0.15;
        return Math.round(raw * (1 - fengXian * 0.03) * 100) / 100;
    },

    tier(ppi) {
        if (ppi >= 6.0) return { stars: 5, label: '★★★★★ 核心权力岗', competition: '极高' };
        if (ppi >= 4.5) return { stars: 4, label: '★★★★ 重点实权岗', competition: '高' };
        if (ppi >= 3.0) return { stars: 3, label: '★★★ 普通实权岗', competition: '中' };
        if (ppi >= 1.5) return { stars: 2, label: '★★ 一般岗位', competition: '低' };
        return { stars: 1, label: '★ 边缘岗位', competition: '无竞争' };
    },

    // 组织谈话门槛（满分8分，得分%门槛）
    unlockThreshold(stars) {
        if (stars >= 5) return 80; // 核心岗：需得分≥80%
        if (stars >= 4) return 65; // 重点岗：≥65%
        if (stars >= 3) return 50; // 普通岗：≥50%
        return 0;                  // 边缘岗：无门槛
    },
};

const PositionDB = {
    // ====== 股级岗位 ======
    guJi: {
        gov: [ // 政府岗
            { name: '党政办科员', dept: '党政办', system: '政府', caiQuan:0, renQuan:0, shiQuan:1, xinXiQuan:3, jinSheng:5, fengXian:1, profile:'综合' },
            { name: '组织办干事', dept: '组织办', system: '党委', caiQuan:0, renQuan:0, shiQuan:1, xinXiQuan:4, jinSheng:6, fengXian:1, profile:'党建' },
            { name: '经济发展办科员', dept: '经济发展办', system: '政府', caiQuan:1, renQuan:0, shiQuan:2, xinXiQuan:3, jinSheng:6, fengXian:2, profile:'经济' },
            { name: '社会事务办科员', dept: '社会事务办', system: '政府', caiQuan:1, renQuan:0, shiQuan:1, xinXiQuan:2, jinSheng:4, fengXian:1, profile:'民生' },
            { name: '综治办干事', dept: '综治办', system: '政府', caiQuan:0, renQuan:0, shiQuan:2, xinXiQuan:3, jinSheng:4, fengXian:3, profile:'维稳' },
            { name: '财政所科员', dept: '财政所', system: '政府', caiQuan:2, renQuan:0, shiQuan:1, xinXiQuan:3, jinSheng:5, fengXian:3, profile:'经济' },
            { name: '农经站干事', dept: '农经站', system: '政府', caiQuan:1, renQuan:0, shiQuan:1, xinXiQuan:2, jinSheng:3, fengXian:1, profile:'民生' },
            { name: '城建办科员', dept: '城建办', system: '政府', caiQuan:2, renQuan:0, shiQuan:2, xinXiQuan:3, jinSheng:5, fengXian:3, profile:'经济' },
        ],
        // 县级局科员
        county: [
            { name: '县发改委科员', dept: '发改委', system: '政府', caiQuan:1, renQuan:0, shiQuan:1, xinXiQuan:5, jinSheng:7, fengXian:2, profile:'经济' },
            { name: '县财政局科员', dept: '财政局', system: '政府', caiQuan:2, renQuan:0, shiQuan:1, xinXiQuan:4, jinSheng:6, fengXian:3, profile:'经济' },
            { name: '县发改局项目办科员', dept: '发改局', system: '政府', caiQuan:1, renQuan:0, shiQuan:1, xinXiQuan:4, jinSheng:6, fengXian:2, profile:'经济' },
        ],
    },

    // ====== 副股级岗位 ======
    fuGu: {
        township: [
            { name: '经济发展办副主任', dept: '经济发展办', system: '政府', caiQuan:3, renQuan:1, shiQuan:3, xinXiQuan:4, jinSheng:6, fengXian:3, profile:'经济' },
            { name: '社会事务办副主任', dept: '社会事务办', system: '政府', caiQuan:2, renQuan:1, shiQuan:2, xinXiQuan:3, jinSheng:5, fengXian:2, profile:'民生' },
            { name: '组织办副主任', dept: '组织办', system: '党委', caiQuan:1, renQuan:3, shiQuan:2, xinXiQuan:5, jinSheng:7, fengXian:2, profile:'党建' },
            { name: '综治办副主任', dept: '综治办', system: '政府', caiQuan:2, renQuan:1, shiQuan:3, xinXiQuan:4, jinSheng:5, fengXian:4, profile:'维稳' },
            { name: '财政所副所长', dept: '财政所', system: '政府', caiQuan:4, renQuan:1, shiQuan:2, xinXiQuan:4, jinSheng:6, fengXian:4, profile:'经济' },
            { name: '城建办副主任', dept: '城建办', system: '政府', caiQuan:3, renQuan:1, shiQuan:3, xinXiQuan:4, jinSheng:5, fengXian:4, profile:'经济' },
            { name: '农经站副站长', dept: '农经站', system: '政府', caiQuan:2, renQuan:1, shiQuan:2, xinXiQuan:3, jinSheng:4, fengXian:2, profile:'民生' },
            { name: '党政办副主任', dept: '党政办', system: '政府', caiQuan:1, renQuan:2, shiQuan:2, xinXiQuan:6, jinSheng:7, fengXian:2, profile:'综合' },
            { name: '纪委干事', dept: '纪委', system: '党委', caiQuan:1, renQuan:2, shiQuan:3, xinXiQuan:7, jinSheng:6, fengXian:6, profile:'党建' },
            { name: '宣传干事', dept: '宣传办', system: '党委', caiQuan:1, renQuan:1, shiQuan:2, xinXiQuan:4, jinSheng:5, fengXian:2, profile:'党建' },
        ],
        county: [
            { name: '县发改委投资科副科长', dept: '发改委', system: '政府', caiQuan:4, renQuan:2, shiQuan:3, xinXiQuan:5, jinSheng:7, fengXian:3, profile:'经济' },
            { name: '县财政局预算科副科长', dept: '财政局', system: '政府', caiQuan:5, renQuan:2, shiQuan:3, xinXiQuan:5, jinSheng:6, fengXian:4, profile:'经济' },
            { name: '县住建局城建科副科长', dept: '住建局', system: '政府', caiQuan:4, renQuan:1, shiQuan:3, xinXiQuan:4, jinSheng:5, fengXian:4, profile:'经济' },
        ],
    },

    // ====== 正股级岗位 ======
    zhengGu: {
        township: [
            { name: '经济发展办主任', dept: '经济发展办', system: '政府', caiQuan:4, renQuan:2, shiQuan:4, xinXiQuan:5, jinSheng:7, fengXian:4, profile:'经济' },
            { name: '社会事务办主任', dept: '社会事务办', system: '政府', caiQuan:3, renQuan:2, shiQuan:3, xinXiQuan:4, jinSheng:5, fengXian:2, profile:'民生' },
            { name: '财政所所长', dept: '财政所', system: '政府', caiQuan:6, renQuan:2, shiQuan:4, xinXiQuan:5, jinSheng:7, fengXian:5, profile:'经济' },
            { name: '综治办主任', dept: '综治办', system: '政府', caiQuan:3, renQuan:2, shiQuan:4, xinXiQuan:5, jinSheng:5, fengXian:5, profile:'维稳' },
            { name: '城建办主任', dept: '城建办', system: '政府', caiQuan:5, renQuan:2, shiQuan:4, xinXiQuan:4, jinSheng:6, fengXian:5, profile:'经济' },
            { name: '组织办主任', dept: '组织办', system: '党委', caiQuan:2, renQuan:4, shiQuan:3, xinXiQuan:6, jinSheng:8, fengXian:3, profile:'党建' },
            { name: '纪委副书记', dept: '纪委', system: '党委', caiQuan:2, renQuan:3, shiQuan:5, xinXiQuan:8, jinSheng:7, fengXian:7, profile:'党建' },
            { name: '宣传办主任', dept: '宣传办', system: '党委', caiQuan:2, renQuan:2, shiQuan:3, xinXiQuan:5, jinSheng:6, fengXian:3, profile:'党建' },
            { name: '武装部副部长', dept: '武装部', system: '政府', caiQuan:1, renQuan:1, shiQuan:3, xinXiQuan:3, jinSheng:3, fengXian:2, profile:'维稳' },
            { name: '党政办主任', dept: '党政办', system: '政府', caiQuan:2, renQuan:3, shiQuan:3, xinXiQuan:7, jinSheng:8, fengXian:3, profile:'综合' },
            { name: '人大秘书', dept: '人大', system: '人大', caiQuan:0, renQuan:1, shiQuan:1, xinXiQuan:3, jinSheng:2, fengXian:1, profile:'综合' },
        ],
        county: [
            { name: '县发改委综合科科长', dept: '发改委', system: '政府', caiQuan:5, renQuan:3, shiQuan:4, xinXiQuan:6, jinSheng:8, fengXian:4, profile:'经济' },
            { name: '县财政局预算科科长', dept: '财政局', system: '政府', caiQuan:6, renQuan:3, shiQuan:4, xinXiQuan:5, jinSheng:7, fengXian:5, profile:'经济' },
            { name: '县交通局工程科科长', dept: '交通局', system: '政府', caiQuan:5, renQuan:2, shiQuan:4, xinXiQuan:4, jinSheng:6, fengXian:5, profile:'经济' },
            { name: '县公安局治安大队长', dept: '公安局', system: '政府', caiQuan:3, renQuan:4, shiQuan:5, xinXiQuan:6, jinSheng:6, fengXian:6, profile:'维稳' },
        ],
        // 县级国企岗
        soe: [
            { name: '县城投公司工程部部长', dept: '城投公司', system: '国企', caiQuan:4, renQuan:2, shiQuan:3, xinXiQuan:3, jinSheng:4, fengXian:4, profile:'经济', enterprise:'临溪县城市投资建设有限公司' },
            { name: '县交投公司财务总监', dept: '交投公司', system: '国企', caiQuan:5, renQuan:2, shiQuan:3, xinXiQuan:4, jinSheng:4, fengXian:4, profile:'经济', enterprise:'临溪县交通投资发展有限公司' },
            { name: '县文旅投公司运营部长', dept: '文旅投公司', system: '国企', caiQuan:3, renQuan:2, shiQuan:3, xinXiQuan:3, jinSheng:3, fengXian:3, profile:'民生', enterprise:'临溪县文化旅游投资有限公司' },
        ],
    },

    // ====== 副科级岗位（40+个）======
    fuKe: {
        township: [
            { name: '副镇长（分管经济）', dept: '镇政府', system: '政府', caiQuan:5, renQuan:3, shiQuan:5, xinXiQuan:6, jinSheng:7, fengXian:5, profile:'经济' },
            { name: '副镇长（分管农业）', dept: '镇政府', system: '政府', caiQuan:4, renQuan:3, shiQuan:5, xinXiQuan:5, jinSheng:6, fengXian:4, profile:'民生' },
            { name: '副镇长（分管城建）', dept: '镇政府', system: '政府', caiQuan:6, renQuan:3, shiQuan:5, xinXiQuan:5, jinSheng:7, fengXian:6, profile:'经济' },
            { name: '副镇长（分管科教文卫）', dept: '镇政府', system: '政府', caiQuan:3, renQuan:3, shiQuan:4, xinXiQuan:4, jinSheng:5, fengXian:2, profile:'民生' },
            { name: '党委委员', dept: '镇党委', system: '党委', caiQuan:2, renQuan:5, shiQuan:4, xinXiQuan:7, jinSheng:8, fengXian:4, profile:'党建' },
            { name: '组织委员', dept: '镇党委', system: '党委', caiQuan:2, renQuan:6, shiQuan:4, xinXiQuan:8, jinSheng:9, fengXian:4, profile:'党建' },
            { name: '宣传委员', dept: '镇党委', system: '党委', caiQuan:2, renQuan:4, shiQuan:3, xinXiQuan:7, jinSheng:7, fengXian:3, profile:'党建' },
            { name: '统战委员', dept: '镇党委', system: '党委', caiQuan:1, renQuan:3, shiQuan:2, xinXiQuan:5, jinSheng:5, fengXian:2, profile:'综合' },
            { name: '纪委书记', dept: '镇纪委', system: '党委', caiQuan:2, renQuan:5, shiQuan:6, xinXiQuan:9, jinSheng:7, fengXian:8, profile:'党建' },
            { name: '武装部长', dept: '武装部', system: '政府', caiQuan:2, renQuan:2, shiQuan:3, xinXiQuan:4, jinSheng:4, fengXian:3, profile:'维稳' },
            { name: '人大副主席', dept: '镇人大', system: '人大', caiQuan:0, renQuan:1, shiQuan:2, xinXiQuan:3, jinSheng:2, fengXian:1, profile:'综合' },
        ],
        countyGov: [
            { name: '县发改委副主任', dept: '发改委', system: '政府', caiQuan:7, renQuan:4, shiQuan:6, xinXiQuan:8, jinSheng:9, fengXian:6, profile:'经济' },
            { name: '县财政局副局长', dept: '财政局', system: '政府', caiQuan:8, renQuan:4, shiQuan:6, xinXiQuan:7, jinSheng:8, fengXian:6, profile:'经济' },
            { name: '县工信局副局长', dept: '工信局', system: '政府', caiQuan:6, renQuan:3, shiQuan:5, xinXiQuan:6, jinSheng:7, fengXian:5, profile:'经济' },
            { name: '县农业农村局副局长', dept: '农业农村局', system: '政府', caiQuan:5, renQuan:3, shiQuan:5, xinXiQuan:5, jinSheng:6, fengXian:4, profile:'民生' },
            { name: '县教育局副局长', dept: '教育局', system: '政府', caiQuan:4, renQuan:4, shiQuan:5, xinXiQuan:5, jinSheng:6, fengXian:3, profile:'民生' },
            { name: '县卫健委副主任', dept: '卫健委', system: '政府', caiQuan:4, renQuan:3, shiQuan:5, xinXiQuan:5, jinSheng:6, fengXian:4, profile:'民生' },
            { name: '县住建局副局长', dept: '住建局', system: '政府', caiQuan:7, renQuan:3, shiQuan:6, xinXiQuan:6, jinSheng:7, fengXian:7, profile:'经济' },
            { name: '县交通局副局长', dept: '交通局', system: '政府', caiQuan:6, renQuan:3, shiQuan:6, xinXiQuan:6, jinSheng:7, fengXian:6, profile:'经济' },
            { name: '县人社局副局长', dept: '人社局', system: '政府', caiQuan:4, renQuan:5, shiQuan:5, xinXiQuan:6, jinSheng:6, fengXian:3, profile:'综合' },
            { name: '县民政局副局长', dept: '民政局', system: '政府', caiQuan:3, renQuan:3, shiQuan:4, xinXiQuan:4, jinSheng:5, fengXian:2, profile:'民生' },
            { name: '县文旅局副局长', dept: '文旅局', system: '政府', caiQuan:4, renQuan:3, shiQuan:4, xinXiQuan:4, jinSheng:5, fengXian:3, profile:'民生' },
            { name: '县市场监管局副局长', dept: '市场监管局', system: '政府', caiQuan:5, renQuan:4, shiQuan:5, xinXiQuan:5, jinSheng:5, fengXian:5, profile:'综合' },
            { name: '县应急管理局副局长', dept: '应急管理局', system: '政府', caiQuan:3, renQuan:2, shiQuan:5, xinXiQuan:5, jinSheng:5, fengXian:7, profile:'维稳' },
            { name: '县生态环境局副局长', dept: '生态环境局', system: '政府', caiQuan:4, renQuan:2, shiQuan:5, xinXiQuan:5, jinSheng:5, fengXian:5, profile:'民生' },
            { name: '县自然资源局副局长', dept: '自然资源局', system: '政府', caiQuan:6, renQuan:3, shiQuan:5, xinXiQuan:6, jinSheng:6, fengXian:6, profile:'经济' },
            { name: '县公安局副局长', dept: '公安局', system: '政府', caiQuan:5, renQuan:6, shiQuan:7, xinXiQuan:8, jinSheng:8, fengXian:7, profile:'维稳' },
            { name: '县司法局副局长', dept: '司法局', system: '政府', caiQuan:2, renQuan:3, shiQuan:4, xinXiQuan:4, jinSheng:4, fengXian:3, profile:'维稳' },
            { name: '县统计局副局长', dept: '统计局', system: '政府', caiQuan:1, renQuan:2, shiQuan:3, xinXiQuan:5, jinSheng:3, fengXian:1, profile:'综合' },
            { name: '县审计局副局长', dept: '审计局', system: '政府', caiQuan:2, renQuan:2, shiQuan:6, xinXiQuan:7, jinSheng:5, fengXian:7, profile:'综合' },
            { name: '县信访局副局长', dept: '信访局', system: '政府', caiQuan:1, renQuan:1, shiQuan:3, xinXiQuan:4, jinSheng:3, fengXian:5, profile:'维稳' },
            { name: '县乡村振兴局副局长', dept: '乡村振兴局', system: '政府', caiQuan:4, renQuan:2, shiQuan:4, xinXiQuan:4, jinSheng:5, fengXian:3, profile:'民生' },
            { name: '县退役军人事务局副局长', dept: '退役军人事务局', system: '政府', caiQuan:2, renQuan:2, shiQuan:3, xinXiQuan:3, jinSheng:3, fengXian:2, profile:'民生' },
            { name: '县城管局副局长', dept: '城管局', system: '政府', caiQuan:3, renQuan:3, shiQuan:5, xinXiQuan:4, jinSheng:4, fengXian:6, profile:'维稳' },
        ],
        countyParty: [
            { name: '县委办公室副主任', dept: '县委办', system: '党委', caiQuan:2, renQuan:4, shiQuan:4, xinXiQuan:9, jinSheng:9, fengXian:4, profile:'党建' },
            { name: '县委组织部副部长', dept: '组织部', system: '党委', caiQuan:2, renQuan:7, shiQuan:4, xinXiQuan:9, jinSheng:10, fengXian:5, profile:'党建' },
            { name: '县委宣传部副部长', dept: '宣传部', system: '党委', caiQuan:2, renQuan:4, shiQuan:4, xinXiQuan:8, jinSheng:8, fengXian:3, profile:'党建' },
            { name: '县委统战部副部长', dept: '统战部', system: '党委', caiQuan:1, renQuan:3, shiQuan:2, xinXiQuan:6, jinSheng:5, fengXian:2, profile:'综合' },
            { name: '县委政法委副书记', dept: '政法委', system: '党委', caiQuan:3, renQuan:5, shiQuan:6, xinXiQuan:8, jinSheng:8, fengXian:7, profile:'维稳' },
            { name: '县政协办公室副主任', dept: '政协', system: '政协', caiQuan:0, renQuan:1, shiQuan:1, xinXiQuan:4, jinSheng:2, fengXian:1, profile:'综合' },
        ],
        // 群团岗
        massOrg: [
            { name: '县总工会副主席', dept: '总工会', system: '群团', caiQuan:1, renQuan:2, shiQuan:2, xinXiQuan:3, jinSheng:3, fengXian:1, profile:'民生' },
            { name: '团县委副书记', dept: '团县委', system: '群团', caiQuan:1, renQuan:2, shiQuan:2, xinXiQuan:5, jinSheng:9, fengXian:2, profile:'党建' },
            { name: '县妇联副主席', dept: '妇联', system: '群团', caiQuan:0, renQuan:1, shiQuan:1, xinXiQuan:3, jinSheng:3, fengXian:1, profile:'民生' },
            { name: '县科协副主席', dept: '科协', system: '群团', caiQuan:0, renQuan:1, shiQuan:1, xinXiQuan:2, jinSheng:1, fengXian:1, profile:'综合' },
            { name: '县工商联副主席', dept: '工商联', system: '群团', caiQuan:2, renQuan:2, shiQuan:2, xinXiQuan:5, jinSheng:4, fengXian:3, profile:'经济' },
            { name: '县残联副主席', dept: '残联', system: '群团', caiQuan:1, renQuan:1, shiQuan:1, xinXiQuan:2, jinSheng:1, fengXian:1, profile:'民生' },
        ],
        // 县级国企
        soe: [
            { name: '县城投公司副总经理', dept: '城投公司', system: '国企', caiQuan:6, renQuan:3, shiQuan:5, xinXiQuan:5, jinSheng:5, fengXian:6, profile:'经济', enterprise:'临溪县城市投资建设有限公司' },
            { name: '县交投公司副总经理', dept: '交投公司', system: '国企', caiQuan:5, renQuan:3, shiQuan:5, xinXiQuan:5, jinSheng:5, fengXian:5, profile:'经济', enterprise:'临溪县交通投资发展有限公司' },
        ],
        // 街道办岗
        street: [
            { name: '街道办事处副主任', dept: '街道办', system: '政府', caiQuan:4, renQuan:3, shiQuan:5, xinXiQuan:5, jinSheng:6, fengXian:4, profile:'综合' },
        ],
    },

    // ====== 正科级岗位（MVP最后一级）======
    zhengKe: {
        township: [
            { name: '镇长', dept: '镇政府', system: '政府', caiQuan:7, renQuan:5, shiQuan:7, xinXiQuan:7, jinSheng:9, fengXian:7, profile:'综合' },
            { name: '镇人大主席', dept: '镇人大', system: '人大', caiQuan:0, renQuan:2, shiQuan:3, xinXiQuan:4, jinSheng:3, fengXian:1, profile:'综合' },
        ],
        countyGov: [
            { name: '县发改委主任', dept: '发改委', system: '政府', caiQuan:8, renQuan:6, shiQuan:8, xinXiQuan:9, jinSheng:10, fengXian:7, profile:'经济' },
            { name: '县财政局局长', dept: '财政局', system: '政府', caiQuan:9, renQuan:5, shiQuan:7, xinXiQuan:8, jinSheng:9, fengXian:8, profile:'经济' },
            { name: '县住建局局长', dept: '住建局', system: '政府', caiQuan:8, renQuan:5, shiQuan:7, xinXiQuan:7, jinSheng:8, fengXian:8, profile:'经济' },
            { name: '县交通局局长', dept: '交通局', system: '政府', caiQuan:7, renQuan:5, shiQuan:7, xinXiQuan:7, jinSheng:8, fengXian:7, profile:'经济' },
            { name: '县教育局局长', dept: '教育局', system: '政府', caiQuan:5, renQuan:5, shiQuan:6, xinXiQuan:6, jinSheng:7, fengXian:4, profile:'民生' },
            { name: '县卫健委主任', dept: '卫健委', system: '政府', caiQuan:5, renQuan:4, shiQuan:6, xinXiQuan:6, jinSheng:7, fengXian:5, profile:'民生' },
            { name: '县公安局局长', dept: '公安局', system: '政府', caiQuan:6, renQuan:8, shiQuan:8, xinXiQuan:9, jinSheng:9, fengXian:8, profile:'维稳' },
            { name: '县人社局局长', dept: '人社局', system: '政府', caiQuan:5, renQuan:6, shiQuan:6, xinXiQuan:7, jinSheng:7, fengXian:4, profile:'综合' },
            { name: '县审计局局长', dept: '审计局', system: '政府', caiQuan:3, renQuan:3, shiQuan:7, xinXiQuan:8, jinSheng:6, fengXian:8, profile:'综合' },
        ],
        countyParty: [
            { name: '县委办公室主任', dept: '县委办', system: '党委', caiQuan:3, renQuan:5, shiQuan:5, xinXiQuan:10, jinSheng:10, fengXian:5, profile:'党建' },
            { name: '县委组织部常务副部长', dept: '组织部', system: '党委', caiQuan:3, renQuan:8, shiQuan:5, xinXiQuan:10, jinSheng:10, fengXian:6, profile:'党建' },
            { name: '县纪委副书记', dept: '纪委', system: '党委', caiQuan:3, renQuan:6, shiQuan:7, xinXiQuan:10, jinSheng:8, fengXian:9, profile:'党建' },
        ],
        massOrg: [
            { name: '团县委书记', dept: '团县委', system: '群团', caiQuan:2, renQuan:3, shiQuan:3, xinXiQuan:6, jinSheng:10, fengXian:2, profile:'党建' },
            { name: '县总工会常务副主席', dept: '总工会', system: '群团', caiQuan:2, renQuan:3, shiQuan:3, xinXiQuan:4, jinSheng:4, fengXian:1, profile:'民生' },
        ],
        soe: [
            { name: '县城投公司总经理', dept: '城投公司', system: '国企', caiQuan:8, renQuan:5, shiQuan:6, xinXiQuan:6, jinSheng:6, fengXian:7, profile:'经济', enterprise:'临溪县城市投资建设有限公司' },
        ],
    },

    // ====== 辅助方法 ======
    // 获取某个级别的所有岗位
    getByRank(rankName) {
        const map = {
            '办事员': this.guJi,
            '副股级': this.fuGu,
            '正股级': this.zhengGu,
            '副科级': this.fuKe,
            '正科级': this.zhengKe,
        };
        return map[rankName] || null;
    },

    // 展平某个级别的所有岗位（带PPI值）
    flattenRank(rankName, locationPrefix = '') {
        const rankData = this.getByRank(rankName);
        if (!rankData) return [];

        const all = [];
        Object.entries(rankData).forEach(([category, positions]) => {
            positions.forEach(p => {
                const ppi = PPI.calc(p.caiQuan, p.renQuan, p.shiQuan, p.xinXiQuan, p.jinSheng, p.fengXian);
                const tier = PPI.tier(ppi);
                all.push({
                    ...p,
                    ppi,
                    stars: tier.stars,
                    competition: tier.competition,
                    unlockScore: PPI.unlockThreshold(tier.stars),
                    category,
                    fullName: locationPrefix ? `${locationPrefix}${p.name}` : p.name,
                });
            });
        });

        // 按PPI降序排列
        all.sort((a, b) => b.ppi - a.ppi);
        return all;
    },

    // 部门→画像硬绑定
    deptProfileMap: {
        '发改委':'经济','财政局':'经济','工信局':'经济','住建局':'经济',
        '交通局':'经济','自然资源局':'经济','城投公司':'经济','交投公司':'经济',
        '经济发展办':'经济','财政所':'经济','城建办':'经济',
        '教育局':'民生','卫健委':'民生','农业农村局':'民生','民政局':'民生',
        '乡村振兴局':'民生','文旅局':'民生','农经站':'民生','社会事务办':'民生','文旅投公司':'民生',
        '公安局':'维稳','应急管理局':'维稳','司法局':'维稳','信访局':'维稳',
        '城管局':'维稳','综治办':'维稳','武装部':'维稳',
        '组织部':'党建','纪委':'党建','宣传部':'党建','统战部':'党建',
        '团县委':'党建','组织办':'党建','宣传办':'党建',
        '党政办':'综合','县委办':'综合','人社局':'综合','审计局':'综合',
        '统计局':'综合','街道办':'综合','人大':'综合','政协':'综合',
        '总工会':'综合','科协':'综合','工商联':'综合','妇联':'综合','残联':'综合',
    },

    getProfileForDept(dept) { return this.deptProfileMap[dept] || '综合'; },

    getPPICeiling(score) {
        if (score >= 85) return 999;
        if (score >= 75) return 5.5;
        if (score >= 65) return 4.5;
        if (score >= 55) return 3.5;
        if (score >= 45) return 2.5;
        return 1.5;
    },

    getCeilingLabel(score) {
        if (score >= 85) return '∞ 全开';
        if (score >= 75) return '5.5';
        if (score >= 65) return '4.5';
        if (score >= 55) return '3.5';
        if (score >= 45) return '2.5';
        return '1.5';
    },

    filterByProfile(positions, targetProfile, minScore) {
        return positions.filter(p => {
            const profileMatch = p.profile === targetProfile || targetProfile === '综合';
            const scoreOk = p.unlockScore <= minScore;
            return profileMatch && scoreOk;
        });
    },
};
