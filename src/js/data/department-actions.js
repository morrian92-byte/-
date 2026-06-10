// 部门行动池 — 通用5 + 大类5 + 部门特有10 = 20，每回合随机抽5

const DeptActions = {
    // ====== 通用行动（5个，所有岗位共用）======
    universal: [
        { id:'u1', label:'📄 常规办公', cost:0, perf:1, conn:0, budget:0, risk:0,
            desc:'完成本月例行文件处理和工作记录', bonus:'无' },
        { id:'u2', label:'📖 学习文件', cost:0, perf:2, conn:0, budget:0, risk:0,
            desc:'认真学习上级下发的最新政策文件', bonus:'无' },
        { id:'u3', label:'🌙 加班赶工', cost:0, perf:3, conn:0, budget:0, risk:0,
            desc:'加班推进紧急任务，牺牲休息换进度', bonus:'精力-1(后续版本实装)' },
        { id:'u4', label:'☕ 走访调研', cost:2, perf:1, conn:2, budget:-2, risk:0,
            desc:'下基层走访，了解一线实际情况', bonus:'15%概率：随机触发一个小事件' },
        { id:'u5', label:'📞 沟通汇报', cost:0, perf:1, conn:2, budget:0, risk:0,
            desc:'向上级汇报工作进展，争取理解支持', bonus:'无' },
    ],

    // ====== 大类行动（每画像5个）======
    categoryPools: {
        '经济': [
            { id:'e1', label:'🏭 招商对接', cost:5, perf:3, conn:2, budget:-5, risk:1,
                desc:'对接有意向投资的企业，推动项目落地', bonus:'无' },
            { id:'e2', label:'📊 指标调度', cost:0, perf:2, conn:1, budget:0, risk:0,
                desc:'分析经济运行数据，调度重点指标', bonus:'无' },
            { id:'e3', label:'🏗️ 项目推进', cost:8, perf:4, conn:1, budget:-8, risk:1,
                desc:'集中资源推进重点项目进度', bonus:'所有经济类项目进度+1' },
            { id:'e4', label:'🤝 企业走访', cost:2, perf:2, conn:2, budget:-2, risk:1,
                desc:'走访辖区重点企业，了解经营困难', bonus:'25%概率：企业主来访·灰色机会+25💰' },
            { id:'e5', label:'📈 形势分析', cost:0, perf:1, conn:1, budget:0, risk:0,
                desc:'撰写经济形势分析报告，为决策提供依据', bonus:'无' },
        ],
        '民生': [
            { id:'l1', label:'🎓 教育走访', cost:2, perf:2, conn:2, budget:-2, risk:0,
                desc:'到学校了解教学质量和设施情况', bonus:'无' },
            { id:'l2', label:'🏥 卫生巡查', cost:2, perf:2, conn:1, budget:-2, risk:0,
                desc:'检查卫生院和社区卫生服务运行', bonus:'安全加固：减少突发公卫开支+3💰' },
            { id:'l3', label:'🤲 扶贫走访', cost:3, perf:3, conn:3, budget:-3, risk:0,
                desc:'到贫困户家中了解脱贫后续情况', bonus:'无' },
            { id:'l4', label:'📋 民生台账', cost:0, perf:2, conn:0, budget:0, risk:0,
                desc:'梳理更新民生工程台账', bonus:'民生指标↑·政绩+2' },
            { id:'l5', label:'🏘️ 下乡调研', cost:2, perf:2, conn:3, budget:-2, risk:0,
                desc:'到村里调研群众生产生活情况', bonus:'无' },
        ],
        '维稳': [
            { id:'w1', label:'🔐 安全排查', cost:0, perf:2, conn:0, budget:0, risk:0,
                desc:'对重点场所开展安全隐患排查', bonus:'安全加固：减少事故应急开支+5💰' },
            { id:'w2', label:'📝 信访接待', cost:0, perf:2, conn:1, budget:0, risk:1,
                desc:'接待来访群众，协调化解矛盾纠纷', bonus:'无' },
            { id:'w3', label:'🚨 应急演练', cost:3, perf:2, conn:1, budget:-3, risk:0,
                desc:'组织应急队伍开展实战演练', bonus:'安全加固：减少伤亡善后开支+3💰' },
            { id:'w4', label:'📞 热线督办', cost:0, perf:2, conn:0, budget:0, risk:0,
                desc:'督办 12345 热线群众诉求办理', bonus:'无' },
            { id:'w5', label:'👁️ 舆情监控', cost:0, perf:1, conn:0, budget:0, risk:1,
                desc:'关注网络舆情，及时发现苗头性问题', bonus:'无' },
        ],
        '党建': [
            { id:'d1', label:'🏫 主题学习', cost:0, perf:1, conn:2, budget:0, risk:0,
                desc:'组织党员干部开展理论学习', bonus:'无' },
            { id:'d2', label:'📋 干部谈话', cost:0, perf:1, conn:3, budget:0, risk:0,
                desc:'与干部进行个别谈心谈话', bonus:'22%概率：发现可培养的下属' },
            { id:'d3', label:'🔔 警示教育', cost:0, perf:2, conn:0, budget:0, risk:0,
                desc:'组织观看警示教育片，绷紧纪律弦', bonus:'灰色风险-2' },
            { id:'d4', label:'🎯 党日活动', cost:2, perf:2, conn:2, budget:-2, risk:0,
                desc:'组织主题党日活动', bonus:'无' },
            { id:'d5', label:'📝 组织考评', cost:0, perf:2, conn:1, budget:0, risk:0,
                desc:'对基层党组织进行考核评估', bonus:'无' },
        ],
        '综合': [
            { id:'z1', label:'📄 综合协调', cost:0, perf:2, conn:2, budget:0, risk:0,
                desc:'协调各部门推进重点事项落实', bonus:'所有项目进度+1' },
            { id:'z2', label:'📰 信息报送', cost:0, perf:1, conn:2, budget:0, risk:0,
                desc:'向上级报送工作亮点信息', bonus:'20%概率：上级关注·人脉+2政绩+1' },
            { id:'z3', label:'📋 督查督办', cost:0, perf:2, conn:0, budget:0, risk:0,
                desc:'对重点交办事项进行督查', bonus:'滞后项目进度+2' },
            { id:'z4', label:'📝 文稿起草', cost:0, perf:2, conn:2, budget:0, risk:0,
                desc:'起草重要会议讲话或汇报材料', bonus:'无' },
            { id:'z5', label:'🏛️ 会议筹备', cost:2, perf:1, conn:2, budget:-2, risk:0,
                desc:'筹备组织重要会议', bonus:'无' },
        ],
    },

    // ====== 部门特有行动（每部门10个）======
    deptPools: {
        // === 经济部门 ===
        '经济发展办': [
            { id:'jj1', label:'🏭 外出招商', cost:8, perf:4, conn:2, budget:-8, risk:1, desc:'带队去外地对接企业，争取投资项目', bonus:'无' },
            { id:'jj2', label:'📊 企业走访', cost:2, perf:2, conn:2, budget:-2, risk:1, desc:'走访辖区重点企业，了解困难', bonus:'25%概率：企业主来访·灰色机会+25💰' },
            { id:'jj3', label:'📋 项目包装', cost:3, perf:2, conn:1, budget:-3, risk:0, desc:'策划包装新的招商引资项目', bonus:'无' },
            { id:'jj4', label:'🤝 客商接待', cost:5, perf:2, conn:3, budget:-5, risk:1, desc:'接待来访客商考察投资环境', bonus:'无' },
            { id:'jj5', label:'📈 经济普查', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'开展辖区经济数据普查登记', bonus:'无' },
            { id:'jj6', label:'🏗️ 园区推介', cost:5, perf:3, conn:2, budget:-5, risk:0, desc:'到外地推介本地产业园', bonus:'无' },
            { id:'jj7', label:'📋 政策宣讲', cost:0, perf:1, conn:2, budget:0, risk:0, desc:'向企业宣讲最新优惠政策', bonus:'无' },
            { id:'jj8', label:'🔍 税源排查', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'排查辖区税源和财政收入情况', bonus:'无' },
            { id:'jj9', label:'📊 工商统计', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'统计上报工商经营数据', bonus:'无' },
            { id:'jj10', label:'🏭 产业调研', cost:2, perf:2, conn:2, budget:-2, risk:0, desc:'调研本地产业现状和发展瓶颈', bonus:'无' },
        ],
        '财政所': [
            { id:'cz1', label:'💰 预算编制', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'编制下年度财政收支预算', bonus:'无' },
            { id:'cz2', label:'📋 资金审核', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'严格审核各部门报销凭证', bonus:'灰色风险-3' },
            { id:'cz3', label:'💳 项目拨款', cost:0, perf:2, conn:2, budget:0, risk:1, desc:'按进度拨付各项目资金', bonus:'无' },
            { id:'cz4', label:'🔍 财务审计', cost:0, perf:2, conn:0, budget:0, risk:2, desc:'对重点单位开展财务审计', bonus:'30%概率：发现财务/管理漏洞线索' },
            { id:'cz5', label:'📊 收支月报', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'编制月度财政收支月报', bonus:'无' },
            { id:'cz6', label:'🏦 银政对接', cost:2, perf:2, conn:3, budget:-2, risk:1, desc:'对接银行争取融资支持', bonus:'无' },
            { id:'cz7', label:'📋 采购招标', cost:3, perf:2, conn:2, budget:-3, risk:2, desc:'组织政府采购项目招标', bonus:'25%概率：灰色机会·+25💰' },
            { id:'cz8', label:'💰 专项资金', cost:0, perf:3, conn:2, budget:0, risk:1, desc:'争取上级专项转移支付资金', bonus:'无' },
            { id:'cz9', label:'🔐 国库管理', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'管理国库集中支付系统', bonus:'无' },
            { id:'cz10', label:'📈 绩效评价', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'开展财政资金使用绩效评价', bonus:'无' },
        ],
        '发改委': [
            { id:'fg1', label:'🏗️ 项目立项', cost:10, perf:5, conn:2, budget:-10, risk:2, desc:'启动重大项目前期论证和报批', bonus:'无' },
            { id:'fg2', label:'📈 经济调度', cost:0, perf:3, conn:2, budget:0, risk:0, desc:'召开经济运行调度会', bonus:'所有项目进度+1' },
            { id:'fg3', label:'📋 规划编制', cost:5, perf:3, conn:2, budget:-5, risk:0, desc:'编制中长期发展规划', bonus:'无' },
            { id:'fg4', label:'💰 投资审批', cost:0, perf:4, conn:2, budget:0, risk:2, desc:'审批核准重大投资项目', bonus:'25%概率：灰色机会·+25💰' },
            { id:'fg5', label:'🔍 项目稽查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'稽查在建政府投资项目', bonus:'无' },
            { id:'fg6', label:'🏭 产业调研', cost:2, perf:2, conn:1, budget:-2, risk:0, desc:'调研重点产业发展情况', bonus:'无' },
            { id:'fg7', label:'📊 物价监测', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'监测市场价格波动', bonus:'无' },
            { id:'fg8', label:'🤝 招商引资', cost:5, perf:3, conn:3, budget:-5, risk:1, desc:'对接重大项目投资者', bonus:'无' },
            { id:'fg9', label:'📋 政策研究', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'研究宏观经济政策走向', bonus:'无' },
            { id:'fg10', label:'🏗️ 基建统筹', cost:0, perf:3, conn:2, budget:0, risk:1, desc:'统筹协调基础设施建设', bonus:'无' },
        ],
        '财政局': [ // 县级财政局，与乡镇财政所不同
            { id:'xcz1', label:'💳 预算分配', cost:0, perf:4, conn:3, budget:0, risk:1, desc:'制定全县财政预算分配方案', bonus:'无' },
            { id:'xcz2', label:'🔍 专项审计', cost:0, perf:3, conn:0, budget:0, risk:2, desc:'对重点部门开展专项审计', bonus:'35%概率：选择性处置·政绩+3或灰色+25💰' },
            { id:'xcz3', label:'💰 转移支付', cost:0, perf:3, conn:3, budget:0, risk:0, desc:'争取上级转移支付资金', bonus:'无' },
            { id:'xcz4', label:'📊 财政分析', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'撰写全县财政运行分析报告', bonus:'无' },
            { id:'xcz5', label:'🏦 债券发行', cost:3, perf:4, conn:3, budget:20, risk:2, desc:'推动地方政府专项债券发行', bonus:'无' },
            { id:'xcz6', label:'📋 国库管理', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'管理县级国库集中支付', bonus:'无' },
            { id:'xcz7', label:'🔐 资金监管', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'监控财政资金使用流向', bonus:'无' },
            { id:'xcz8', label:'💼 政府采购', cost:2, perf:2, conn:2, budget:-2, risk:2, desc:'监管全县政府采购工作', bonus:'25%概率：灰色机会·+25💰' },
            { id:'xcz9', label:'📈 绩效管理', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'推进全面预算绩效管理', bonus:'无' },
            { id:'xcz10', label:'🏗️ 投资评审', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'组织政府投资项目财政评审', bonus:'无' },
        ],
        '住建局': [
            { id:'zj1', label:'🏠 规划审批', cost:5, perf:3, conn:2, budget:-5, risk:2, desc:'审批建设项目规划方案', bonus:'25%概率：灰色机会·+25💰' },
            { id:'zj2', label:'🚧 质量检查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'抽查在建工程质量安全', bonus:'无' },
            { id:'zj3', label:'🏢 房产管理', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'管理房地产市场秩序', bonus:'无' },
            { id:'zj4', label:'🏘️ 保障房建', cost:6, perf:4, conn:3, budget:-6, risk:1, desc:'推进保障性住房建设', bonus:'无' },
            { id:'zj5', label:'📋 工程验收', cost:0, perf:3, conn:1, budget:0, risk:2, desc:'组织工程项目竣工验收', bonus:'无' },
            { id:'zj6', label:'🌳 园林绿化', cost:3, perf:2, conn:0, budget:-3, risk:0, desc:'推进城市园林绿化工程', bonus:'无' },
            { id:'zj7', label:'💧 污水处理', cost:4, perf:3, conn:0, budget:-4, risk:1, desc:'推进污水处理设施建设', bonus:'无' },
            { id:'zj8', label:'🚗 停车场建', cost:3, perf:2, conn:1, budget:-3, risk:0, desc:'规划建设公共停车场', bonus:'无' },
            { id:'zj9', label:'🔧 老旧改造', cost:5, perf:4, conn:3, budget:-5, risk:1, desc:'推进老旧小区改造工程', bonus:'民生指标↑·政绩+2' },
            { id:'zj10', label:'📊 城建统计', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'统计上报城建领域数据', bonus:'无' },
        ],
        '交通局': [
            { id:'jt1', label:'🛣️ 工程推进', cost:8, perf:4, conn:1, budget:-8, risk:2, desc:'集中力量推进交通重点项目', bonus:'交通项目进度+2' },
            { id:'jt2', label:'🚌 运输调度', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'协调城乡公共交通运输', bonus:'无' },
            { id:'jt3', label:'🔧 公路养护', cost:3, perf:2, conn:0, budget:-3, risk:0, desc:'组织农村公路养护维修', bonus:'无' },
            { id:'jt4', label:'📋 路政巡查', cost:0, perf:1, conn:0, budget:0, risk:1, desc:'开展公路路政执法巡查', bonus:'无' },
            { id:'jt5', label:'🏗️ 桥梁检测', cost:3, perf:2, conn:0, budget:-3, risk:1, desc:'对辖区内桥梁进行安全检测', bonus:'无' },
            { id:'jt6', label:'🚦 交通设施', cost:2, perf:2, conn:0, budget:-2, risk:0, desc:'完善交通标志标线等设施', bonus:'无' },
            { id:'jt7', label:'🚗 治超执法', cost:0, perf:2, conn:0, budget:0, risk:2, desc:'开展超限超载治理执法', bonus:'25%概率：灰色机会·+25💰' },
            { id:'jt8', label:'📊 交通规划', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'编制交通发展规划', bonus:'无' },
            { id:'jt9', label:'🏭 物流协调', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'协调物流运输保障', bonus:'无' },
            { id:'jt10', label:'🔐 安全督查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'督查交通运输安全生产', bonus:'无' },
        ],
        '城投公司': [
            { id:'ct1', label:'🏢 土地开发', cost:15, perf:5, conn:2, budget:30, risk:4, desc:'主导土地一级开发项目', bonus:'45%概率：额外收益+30💰·但灰色风险+5' },
            { id:'ct2', label:'🤝 融资洽谈', cost:3, perf:2, conn:4, budget:20, risk:2, desc:'对接金融机构争取融资', bonus:'无' },
            { id:'ct3', label:'🏗️ 项目发包', cost:5, perf:3, conn:3, budget:-5, risk:3, desc:'组织工程项目招标发包', bonus:'55%概率：灰色机会·+40💰' },
            { id:'ct4', label:'📊 资产评估', cost:2, perf:2, conn:1, budget:-2, risk:1, desc:'评估公司资产和投资回报', bonus:'无' },
            { id:'ct5', label:'💼 投资决策', cost:5, perf:4, conn:2, budget:-5, risk:3, desc:'研究决定重大投资项目', bonus:'无' },
            { id:'ct6', label:'📋 合同谈判', cost:2, perf:2, conn:3, budget:-2, risk:2, desc:'与合作方进行商务合同谈判', bonus:'无' },
            { id:'ct7', label:'💰 利润调度', cost:0, perf:3, conn:1, budget:15, risk:2, desc:'调度公司经营利润和现金流', bonus:'无' },
            { id:'ct8', label:'🏠 房产销售', cost:0, perf:3, conn:2, budget:25, risk:1, desc:'推进商品房销售回款', bonus:'无' },
            { id:'ct9', label:'🔍 成本审计', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'审计在建项目成本支出', bonus:'无' },
            { id:'ct10', label:'🌆 新区开发', cost:20, perf:6, conn:3, budget:50, risk:5, desc:'主导城市新区综合开发', bonus:'50%概率：成功→政绩+8+财力+60；失败→灰色风险+50' },
        ],

        // === 民生部门 ===
        '社会事务办': [
            { id:'sh1', label:'🎓 教育督导', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'检查学校教学质量和安全', bonus:'无' },
            { id:'sh2', label:'🏥 卫生巡查', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'检查卫生院和卫生室运行', bonus:'无' },
            { id:'sh3', label:'👴 养老走访', cost:2, perf:2, conn:2, budget:-2, risk:0, desc:'走访敬老院和独居老人', bonus:'无' },
            { id:'sh4', label:'📋 低保核查', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'核查低保户资格和经济状况', bonus:'无' },
            { id:'sh5', label:'🏘️ 社区活动', cost:2, perf:1, conn:3, budget:-2, risk:0, desc:'组织社区居民文化活动', bonus:'无' },
            { id:'sh6', label:'💊 医疗救助', cost:3, perf:2, conn:2, budget:-3, risk:0, desc:'为困难群众申请医疗救助', bonus:'无' },
            { id:'sh7', label:'🎓 助学帮扶', cost:2, perf:2, conn:3, budget:-2, risk:0, desc:'帮助贫困学生申请助学金', bonus:'无' },
            { id:'sh8', label:'📋 残疾人服务', cost:1, perf:2, conn:2, budget:-1, risk:0, desc:'为残疾人提供辅具和服务', bonus:'无' },
            { id:'sh9', label:'🏥 医保宣传', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'宣传城乡居民医保政策', bonus:'无' },
            { id:'sh10', label:'📊 民生统计', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'统计上报民生领域数据', bonus:'无' },
        ],
        '农业农村局': [
            { id:'ny1', label:'🌾 产业扶持', cost:5, perf:3, conn:2, budget:-5, risk:0, desc:'扶持特色农产品产业发展', bonus:'无' },
            { id:'ny2', label:'🏘️ 乡村振兴', cost:6, perf:4, conn:3, budget:-6, risk:1, desc:'推进乡村振兴项目建设', bonus:'无' },
            { id:'ny3', label:'🐄 畜牧防疫', cost:2, perf:2, conn:0, budget:-2, risk:1, desc:'组织畜禽疫病防控', bonus:'无' },
            { id:'ny4', label:'💧 水利建设', cost:5, perf:3, conn:1, budget:-5, risk:1, desc:'推进农田水利设施建设', bonus:'无' },
            { id:'ny5', label:'🌳 造林绿化', cost:3, perf:2, conn:0, budget:-3, risk:0, desc:'组织开展春季造林绿化', bonus:'无' },
            { id:'ny6', label:'📋 土地确权', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'推进农村土地确权登记', bonus:'无' },
            { id:'ny7', label:'🏠 危房改造', cost:4, perf:3, conn:2, budget:-4, risk:1, desc:'推进农村危房改造工程', bonus:'无' },
            { id:'ny8', label:'📊 农情监测', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'监测农作物生长和病虫害', bonus:'无' },
            { id:'ny9', label:'🚜 农机推广', cost:2, perf:2, conn:1, budget:-2, risk:0, desc:'推广新型农业机械和技术', bonus:'无' },
            { id:'ny10', label:'💰 惠农补贴', cost:0, perf:2, conn:3, budget:0, risk:0, desc:'发放核实各项惠农补贴资金', bonus:'无' },
        ],
        '教育局': [
            { id:'jy1', label:'📚 师资建设', cost:4, perf:3, conn:2, budget:-4, risk:0, desc:'引进优秀教师改善师资', bonus:'无' },
            { id:'jy2', label:'🏫 校园安全', cost:2, perf:2, conn:0, budget:-2, risk:1, desc:'全面排查校园安全隐患', bonus:'无' },
            { id:'jy3', label:'📋 招生统筹', cost:0, perf:2, conn:2, budget:0, risk:1, desc:'统筹义务教育阶段招生', bonus:'无' },
            { id:'jy4', label:'🎯 素质教育', cost:2, perf:2, conn:1, budget:-2, risk:0, desc:'推进学校特色素质教育', bonus:'无' },
            { id:'jy5', label:'🏗️ 学校建设', cost:8, perf:4, conn:2, budget:-8, risk:1, desc:'推进新学校或改扩建项目', bonus:'无' },
            { id:'jy6', label:'💻 信息化建设', cost:3, perf:2, conn:1, budget:-3, risk:0, desc:'推进教育信息化设备采购', bonus:'无' },
            { id:'jy7', label:'👨‍🏫 教师培训', cost:2, perf:2, conn:2, budget:-2, risk:0, desc:'组织教师业务能力提升培训', bonus:'无' },
            { id:'jy8', label:'📊 教学督导', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'督导学校教学质量评估', bonus:'无' },
            { id:'jy9', label:'🍎 营养餐监管', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'监管学生营养餐食品安全', bonus:'无' },
            { id:'jy10', label:'🏅 评优评先', cost:0, perf:1, conn:3, budget:0, risk:0, desc:'组织优秀教师评选表彰', bonus:'无' },
        ],
        '卫健委': [
            { id:'wj1', label:'💉 公卫防控', cost:3, perf:3, conn:0, budget:-3, risk:1, desc:'加强公共卫生监测防控', bonus:'无' },
            { id:'wj2', label:'🏥 医改推进', cost:6, perf:4, conn:2, budget:-6, risk:1, desc:'推进基层医疗体制改革', bonus:'无' },
            { id:'wj3', label:'👨‍⚕️ 人才引进', cost:3, perf:2, conn:2, budget:-3, risk:0, desc:'引进紧缺医疗专业人才', bonus:'无' },
            { id:'wj4', label:'📋 医院巡查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'巡查公立医院运行情况', bonus:'无' },
            { id:'wj5', label:'💊 药品监管', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'监管药品采购和使用安全', bonus:'无' },
            { id:'wj6', label:'🏥 基层建设', cost:5, perf:3, conn:2, budget:-5, risk:1, desc:'推进乡镇卫生院标准化建设', bonus:'无' },
            { id:'wj7', label:'👵 老龄健康', cost:2, perf:2, conn:2, budget:-2, risk:0, desc:'推进医养结合老龄健康服务', bonus:'无' },
            { id:'wj8', label:'🩺 健康体检', cost:2, perf:2, conn:3, budget:-2, risk:0, desc:'组织基层群众免费健康体检', bonus:'无' },
            { id:'wj9', label:'📊 疫情监测', cost:0, perf:2, conn:0, budget:0, risk:2, desc:'监测传染病疫情动态', bonus:'无' },
            { id:'wj10', label:'🚑 急救体系', cost:3, perf:3, conn:1, budget:-3, risk:1, desc:'完善院前急救体系建设', bonus:'无' },
        ],

        // === 维稳部门 ===
        '综治办': [
            { id:'zz1', label:'📝 信访化解', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'主动约访重点信访人员', bonus:'无' },
            { id:'zz2', label:'🔐 安全排查', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'排查辖区安全隐患', bonus:'无' },
            { id:'zz3', label:'👁️ 网格巡查', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'组织网格员日常巡查', bonus:'无' },
            { id:'zz4', label:'🤝 矛盾调解', cost:0, perf:2, conn:2, budget:0, risk:1, desc:'调解邻里纠纷和民事矛盾', bonus:'无' },
            { id:'zz5', label:'📋 扫黑除恶', cost:3, perf:4, conn:0, budget:-3, risk:3, desc:'配合上级开展扫黑除恶', bonus:'无' },
            { id:'zz6', label:'🚨 治安巡逻', cost:0, perf:1, conn:0, budget:0, risk:1, desc:'组织治安联防巡逻', bonus:'无' },
            { id:'zz7', label:'📞 热线受理', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'受理 12345 热线转办事项', bonus:'无' },
            { id:'zz8', label:'🔔 重点管控', cost:0, perf:2, conn:0, budget:0, risk:2, desc:'对重点人员进行管控', bonus:'无' },
            { id:'zz9', label:'📊 治安研判', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'分析研判辖区治安形势', bonus:'无' },
            { id:'zz10', label:'🏘️ 平安创建', cost:2, perf:2, conn:2, budget:-2, risk:0, desc:'推进平安社区创建活动', bonus:'无' },
        ],
        '公安局': [
            { id:'ga1', label:'👮 专项行动', cost:3, perf:4, conn:1, budget:-3, risk:2, desc:'组织治安专项整治行动', bonus:'无' },
            { id:'ga2', label:'🔍 案件侦办', cost:0, perf:3, conn:0, budget:0, risk:2, desc:'亲自督办重点案件侦办', bonus:'35%概率：执法中选择·放人(+人脉5)或严办(+政绩4)' },
            { id:'ga3', label:'🚔 巡逻防控', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'安排街面巡逻防控', bonus:'无' },
            { id:'ga4', label:'📋 人口管理', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'做好流动人口登记管理', bonus:'无' },
            { id:'ga5', label:'🚗 交通执法', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'组织开展交通违法行为查处', bonus:'无' },
            { id:'ga6', label:'🔐 网络安全', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'监控网络有害信息', bonus:'无' },
            { id:'ga7', label:'👥 审讯突破', cost:0, perf:3, conn:0, budget:0, risk:1, desc:'亲自参与重点嫌疑人审讯', bonus:'无' },
            { id:'ga8', label:'📊 情报分析', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'分析研判治安情报信息', bonus:'无' },
            { id:'ga9', label:'🏘️ 社区警务', cost:0, perf:1, conn:2, budget:0, risk:0, desc:'推进社区警务室建设', bonus:'无' },
            { id:'ga10', label:'🚨 应急处突', cost:2, perf:3, conn:0, budget:-2, risk:3, desc:'组织突发事件应急处置', bonus:'无' },
        ],
        '应急管理局': [
            { id:'yj1', label:'🚨 应急演练', cost:3, perf:2, conn:1, budget:-3, risk:0, desc:'组织安全生产应急演练', bonus:'无' },
            { id:'yj2', label:'📋 执法检查', cost:0, perf:3, conn:0, budget:0, risk:2, desc:'对重点企业安全生产执法', bonus:'25%概率：灰色机会·+25💰' },
            { id:'yj3', label:'🔐 隐患排查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'排查重大事故隐患', bonus:'无' },
            { id:'yj4', label:'📊 安全评估', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'开展区域安全风险评估', bonus:'无' },
            { id:'yj5', label:'💼 许可审批', cost:0, perf:2, conn:1, budget:0, risk:2, desc:'审批危险化学品经营许可', bonus:'25%概率：灰色机会·+25💰' },
            { id:'yj6', label:'🚒 消防检查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'开展消防安全专项检查', bonus:'无' },
            { id:'yj7', label:'📝 事故调查', cost:0, perf:3, conn:0, budget:0, risk:3, desc:'牵头调查生产安全事故', bonus:'无' },
            { id:'yj8', label:'🏭 矿山监管', cost:0, perf:2, conn:0, budget:0, risk:2, desc:'监管非煤矿山安全生产', bonus:'无' },
            { id:'yj9', label:'📞 应急值守', cost:0, perf:1, conn:0, budget:0, risk:1, desc:'做好应急值班值守工作', bonus:'无' },
            { id:'yj10', label:'🔔 预警发布', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'发布自然灾害预警信息', bonus:'无' },
        ],
        '信访局': [
            { id:'xf1', label:'🤝 领导接访', cost:0, perf:2, conn:2, budget:0, risk:1, desc:'安排领导接待信访群众', bonus:'无' },
            { id:'xf2', label:'📞 热线督办', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'督办 12345 热线办理', bonus:'无' },
            { id:'xf3', label:'📋 积案化解', cost:2, perf:3, conn:2, budget:-2, risk:1, desc:'攻坚化解信访积案', bonus:'无' },
            { id:'xf4', label:'🔍 案件转办', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'转办交办信访事项', bonus:'无' },
            { id:'xf5', label:'👁️ 源头排查', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'排查信访矛盾源头', bonus:'无' },
            { id:'xf6', label:'📊 数据分析', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'分析信访数据趋势', bonus:'无' },
            { id:'xf7', label:'🏘️ 下访走访', cost:2, perf:2, conn:3, budget:-2, risk:1, desc:'到信访人家中走访了解', bonus:'无' },
            { id:'xf8', label:'📝 复查复核', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'对信访事项进行复查复核', bonus:'无' },
            { id:'xf9', label:'🔔 预警通报', cost:0, perf:1, conn:0, budget:0, risk:1, desc:'通报可能引发群体事件的风险', bonus:'无' },
            { id:'xf10', label:'🤝 调解协商', cost:0, perf:2, conn:2, budget:0, risk:1, desc:'组织矛盾纠纷调解协商', bonus:'无' },
        ],

        // === 党建部门 ===
        '组织办': [
            { id:'zzb1', label:'📋 干部考察', cost:0, perf:1, conn:4, budget:0, risk:0, desc:'深入考察后备干部人选', bonus:'22%概率：发现可培养的亲信下属' },
            { id:'zzb2', label:'🏫 党校培训', cost:2, perf:2, conn:2, budget:-2, risk:0, desc:'组织干部参加党校学习', bonus:'无' },
            { id:'zzb3', label:'📊 班子研判', cost:0, perf:2, conn:3, budget:0, risk:0, desc:'分析研判各单位班子运行', bonus:'无' },
            { id:'zzb4', label:'👤 人事档案', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'整理完善干部人事档案', bonus:'无' },
            { id:'zzb5', label:'🎯 换届筹备', cost:2, perf:2, conn:3, budget:-2, risk:1, desc:'筹备基层党组织换届', bonus:'无' },
            { id:'zzb6', label:'📋 选调招录', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'组织选调生招录工作', bonus:'无' },
            { id:'zzb7', label:'📈 绩效考核', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'组织干部年度绩效考核', bonus:'无' },
            { id:'zzb8', label:'🏅 评优推荐', cost:0, perf:1, conn:4, budget:0, risk:0, desc:'推荐优秀干部参加评选', bonus:'无' },
            { id:'zzb9', label:'🔍 任职审查', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'开展干部任职资格审查', bonus:'无' },
            { id:'zzb10', label:'📝 述职评议', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'组织干部述职评议大会', bonus:'无' },
        ],
        '组织部': [
            { id:'zzbr1', label:'👤 人事调配', cost:0, perf:2, conn:5, budget:0, risk:2, desc:'研究制定干部调整方案', bonus:'25%概率：推荐成功·亲信晋升+人脉+5' },
            { id:'zzbr2', label:'📊 班子研判', cost:0, perf:2, conn:3, budget:0, risk:0, desc:'全面研判县级各单位班子', bonus:'信息权↑·人脉+2' },
            { id:'zzbr3', label:'🎯 人才引进', cost:3, perf:3, conn:3, budget:-3, risk:0, desc:'引进高层次紧缺人才', bonus:'无' },
            { id:'zzbr4', label:'📋 编制管理', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'管理全县行政事业编制', bonus:'无' },
            { id:'zzbr5', label:'🏫 干部教育', cost:2, perf:2, conn:2, budget:-2, risk:0, desc:'制定干部教育培训计划', bonus:'无' },
            { id:'zzbr6', label:'🔍 监督问责', cost:0, perf:2, conn:0, budget:0, risk:2, desc:'对失职干部提出问责建议', bonus:'无' },
            { id:'zzbr7', label:'👥 后备培养', cost:0, perf:1, conn:4, budget:0, risk:0, desc:'选拔培养优秀年轻后备干部', bonus:'22%概率：发现可培养下属' },
            { id:'zzbr8', label:'📈 职务晋升', cost:0, perf:3, conn:5, budget:0, risk:2, desc:'研究干部职级晋升方案', bonus:'无' },
            { id:'zzbr9', label:'💼 公开选拔', cost:2, perf:3, conn:2, budget:-2, risk:1, desc:'组织公开选拔领导干部', bonus:'无' },
            { id:'zzbr10', label:'📊 年报统计', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'完成党内统计年报', bonus:'无' },
        ],
        '纪委': [
            { id:'jw1', label:'🔍 线索核查', cost:0, perf:3, conn:0, budget:0, risk:3, desc:'对举报线索进行初步核查', bonus:'30%概率：选择性处置·可上报(+政绩)或压下(+灰色)' },
            { id:'jw2', label:'📝 廉政教育', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'组织开展警示教育', bonus:'灰色风险-2' },
            { id:'jw3', label:'📋 立案审查', cost:0, perf:4, conn:-3, budget:0, risk:4, desc:'对有问题的干部立案审查', bonus:'无' },
            { id:'jw4', label:'🔔 作风督查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'督查各单位作风建设', bonus:'无' },
            { id:'jw5', label:'💼 谈话函询', cost:0, perf:2, conn:1, budget:0, risk:2, desc:'对轻微问题进行谈话提醒', bonus:'无' },
            { id:'jw6', label:'📊 数据比对', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'通过大数据筛查违纪线索', bonus:'无' },
            { id:'jw7', label:'🔐 案件审理', cost:0, perf:3, conn:0, budget:0, risk:3, desc:'审理违纪案件并做出处分建议', bonus:'无' },
            { id:'jw8', label:'📝 巡视整改', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'督促各单位落实巡视整改', bonus:'无' },
            { id:'jw9', label:'👁️ 明察暗访', cost:2, perf:3, conn:0, budget:-2, risk:2, desc:'对重点问题开展明察暗访', bonus:'无' },
            { id:'jw10', label:'🏛️ 以案促改', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'推动发案单位以案促改', bonus:'无' },
        ],
        '团县委': [
            { id:'tw1', label:'🌟 青年活动', cost:2, perf:2, conn:4, budget:-2, risk:0, desc:'组织青年干部交流活动', bonus:'无' },
            { id:'tw2', label:'🎯 推优入党', cost:0, perf:2, conn:3, budget:0, risk:0, desc:'推荐优秀青年加入党组织', bonus:'无' },
            { id:'tw3', label:'🏫 团课培训', cost:0, perf:1, conn:2, budget:0, risk:0, desc:'组织团员青年团课学习', bonus:'无' },
            { id:'tw4', label:'🤝 志愿服务', cost:1, perf:2, conn:3, budget:-1, risk:0, desc:'组织青年志愿服务活动', bonus:'无' },
            { id:'tw5', label:'💼 创业扶持', cost:3, perf:2, conn:3, budget:-3, risk:0, desc:'扶持青年创新创业项目', bonus:'无' },
            { id:'tw6', label:'🏅 五四表彰', cost:2, perf:2, conn:3, budget:-2, risk:0, desc:'组织五四青年节表彰活动', bonus:'无' },
            { id:'tw7', label:'📋 少工委工作', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'指导少先队工作', bonus:'无' },
            { id:'tw8', label:'🌍 对外交流', cost:3, perf:2, conn:4, budget:-3, risk:0, desc:'组织青年对外交流活动', bonus:'无' },
            { id:'tw9', label:'📊 团内统计', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'完成团内组织统计', bonus:'无' },
            { id:'tw10', label:'🎓 青马工程', cost:2, perf:2, conn:3, budget:-2, risk:0, desc:'推进青年马克思主义者培养', bonus:'无' },
        ],

        // === 综合部门 ===
        '党政办': [
            { id:'dz1', label:'📄 综合协调', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'协调各部门推进重点工作', bonus:'所有项目进度+1' },
            { id:'dz2', label:'📰 信息报送', cost:0, perf:1, conn:2, budget:0, risk:0, desc:'向上级报送工作亮点信息', bonus:'无' },
            { id:'dz3', label:'📝 文稿起草', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'起草重要汇报材料', bonus:'无' },
            { id:'dz4', label:'🏛️ 会议筹备', cost:2, perf:1, conn:2, budget:-2, risk:0, desc:'筹备组织重要会议', bonus:'无' },
            { id:'dz5', label:'📋 文件流转', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'处理来文来电和文件传阅', bonus:'无' },
            { id:'dz6', label:'🔐 机要保密', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'做好机要文件保密管理', bonus:'无' },
            { id:'dz7', label:'📊 督查督办', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'对交办事项进行督查', bonus:'无' },
            { id:'dz8', label:'🤝 公务接待', cost:2, perf:1, conn:3, budget:-2, risk:1, desc:'接待上级来人来访', bonus:'无' },
            { id:'dz9', label:'📅 日程安排', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'协调安排领导日程', bonus:'无' },
            { id:'dz10', label:'📋 档案整理', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'整理归档年度文件资料', bonus:'无' },
        ],
        '县委办': [
            { id:'xwb1', label:'📋 督查督办', cost:0, perf:3, conn:1, budget:0, risk:1, desc:'对县委重点决策进行督查', bonus:'无' },
            { id:'xwb2', label:'📝 文稿起草', cost:0, perf:2, conn:3, budget:0, risk:0, desc:'起草县委重要文稿', bonus:'信息权提升·人脉+3' },
            { id:'xwb3', label:'📊 信息报送', cost:0, perf:2, conn:3, budget:0, risk:0, desc:'向省委市委报送重大信息', bonus:'无' },
            { id:'xwb4', label:'🔐 机要保密', cost:0, perf:1, conn:1, budget:0, risk:1, desc:'管理县委机要文件和密码', bonus:'信息权大幅提升·人脉+4' },
            { id:'xwb5', label:'🏛️ 常委会议', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'筹备县委常委会议', bonus:'无' },
            { id:'xwb6', label:'📅 领导调研', cost:2, perf:2, conn:3, budget:-2, risk:0, desc:'安排县委书记调研活动', bonus:'无' },
            { id:'xwb7', label:'🤝 综合协调', cost:0, perf:2, conn:2, budget:0, risk:0, desc:'协调县委各部门工作', bonus:'无' },
            { id:'xwb8', label:'📋 值班值守', cost:0, perf:1, conn:0, budget:0, risk:0, desc:'做好县委值班应急工作', bonus:'无' },
            { id:'xwb9', label:'🔍 政策研究', cost:0, perf:2, conn:1, budget:0, risk:0, desc:'研究上级重大决策部署', bonus:'无' },
            { id:'xwb10', label:'📝 简报编发', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'编发县委工作简报', bonus:'无' },
        ],
        '人社局': [
            { id:'rs1', label:'👥 招聘录用', cost:2, perf:2, conn:3, budget:-2, risk:1, desc:'组织事业单位公开招聘', bonus:'30%概率：安排自己人·人脉+4' },
            { id:'rs2', label:'📊 社保核查', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'核查社保基金运行', bonus:'40%概率：发现漏洞·可选上报(+政绩3)或压下(+财力25)' },
            { id:'rs3', label:'💼 劳动仲裁', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'调解劳动人事争议', bonus:'无' },
            { id:'rs4', label:'📋 工资福利', cost:0, perf:1, conn:2, budget:0, risk:0, desc:'核定调整干部职工工资', bonus:'无' },
            { id:'rs5', label:'🏅 职称评审', cost:0, perf:2, conn:3, budget:0, risk:1, desc:'组织专业技术职称评审', bonus:'无' },
            { id:'rs6', label:'👴 退休审批', cost:0, perf:1, conn:2, budget:0, risk:0, desc:'审批干部职工退休手续', bonus:'无' },
            { id:'rs7', label:'📈 人才服务', cost:2, perf:2, conn:3, budget:-2, risk:0, desc:'为引进人才提供服务保障', bonus:'无' },
            { id:'rs8', label:'🔍 劳动监察', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'检查用人单位用工合规', bonus:'无' },
            { id:'rs9', label:'📋 档案管理', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'管理干部职工人事档案', bonus:'无' },
            { id:'rs10', label:'💰 就业扶持', cost:3, perf:2, conn:2, budget:-3, risk:0, desc:'落实就业创业扶持政策', bonus:'无' },
        ],
        '审计局': [
            { id:'sj1', label:'🔍 专项审计', cost:0, perf:4, conn:0, budget:0, risk:2, desc:'对重点部门开展专项审计', bonus:'35%概率：发现问题·可选上报或压下' },
            { id:'sj2', label:'📋 离任审计', cost:0, perf:2, conn:-3, budget:0, risk:2, desc:'对离任干部进行经济责任审计', bonus:'无' },
            { id:'sj3', label:'💰 预算执行', cost:0, perf:2, conn:0, budget:0, risk:1, desc:'审计预算执行情况', bonus:'无' },
            { id:'sj4', label:'🏗️ 投资项目', cost:0, perf:3, conn:0, budget:0, risk:2, desc:'审计政府投资项目造价', bonus:'无' },
            { id:'sj5', label:'📊 数据分析', cost:0, perf:2, conn:0, budget:0, risk:0, desc:'通过数据分析发现审计疑点', bonus:'无' },
            { id:'sj6', label:'📝 审计报告', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'撰写审计报告提出建议', bonus:'无' },
            { id:'sj7', label:'🔐 整改跟踪', cost:0, perf:2, conn:1, budget:0, risk:1, desc:'跟踪督促审计整改落实', bonus:'无' },
            { id:'sj8', label:'💼 国资审计', cost:0, perf:3, conn:0, budget:0, risk:2, desc:'审计国有企业资产情况', bonus:'无' },
            { id:'sj9', label:'📋 内审指导', cost:0, perf:1, conn:1, budget:0, risk:0, desc:'指导各单位内部审计工作', bonus:'无' },
            { id:'sj10', label:'🏛️ 移送线索', cost:0, perf:3, conn:0, budget:0, risk:3, desc:'向纪委移送审计发现问题线索', bonus:'无' },
        ],
    },

    // ====== 核心方法 ======
    // 根据玩家当前部门获取完整行动池
    getPool() {
        const dept = this.getPlayerDept();
        const profile = this.getPlayerProfile();

        // 1. 通用5个
        const pool = [...this.universal];

        // 2. 大类5个
        const catActs = this.categoryPools[profile] || this.categoryPools['综合'];
        pool.push(...catActs);

        // 3. 部门特有10个
        const deptActs = this.deptPools[dept];
        if (deptActs) {
            pool.push(...deptActs);
        } else {
            // 无部门特有 → 用综合部门兜底
            const fallback = this.deptPools['党政办'] || [];
            pool.push(...fallback.slice(0, 10));
        }

        return pool;
    },

    // 从池中随机抽5个
    getRandomActions(count = 5) {
        const pool = this.getPool();
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    // 获取当前部门名称
    getPlayerDept() {
        const pos = GameState.playerPosition || '';
        const knownDepts = Object.keys(this.deptPools);
        // 按长度降序匹配（优先匹配长名，如"财政局"优先于"财政所"但财政所在前）
        const sorted = [...knownDepts].sort((a, b) => b.length - a.length);
        for (const dept of sorted) {
            if (pos.includes(dept)) return dept;
        }
        return null;
    },

    // 获取当前画像
    getPlayerProfile() {
        return GameState.playerProfile || '综合';
    },
};
