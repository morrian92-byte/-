// 事件系统 — Core Layer
// 参数化事件模板 + 条件触发

const EventSystem = {
    pendingEvents: [],
    eventHistory: [],
    activeSeeds: [],
    currentEvent: null,

    _pickNPC(role) {
        // 根据角色类型随机选一个符合条件的NPC，增加叙事多样性
        const pool = NPCPool.npcs.filter(n => {
            if (role === '上级') return n.rank && RankDB.getRankByName(GameState.playerRank) && RankDB.getRankByName(n.rank) && RankDB.getRankByName(n.rank).id > RankDB.getRankByName(GameState.playerRank).id;
            if (role === '同级') return n.position.includes('副') || n.position.includes('主任') || n.position.includes('长');
            if (role === '下属') return n.position.includes('干事') || n.position.includes('科员') || n.position.includes('助理');
            if (role === '企业') return n.position.includes('老板') || n.position.includes('公司') || n.position.includes('经理');
            return true;
        });
        return pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
    },
    _pickProject() {
        return ProjectSystem.activeProjects.length > 0
            ? ProjectSystem.activeProjects[Math.floor(Math.random() * ProjectSystem.activeProjects.length)]
            : null;
    },
    _currentLoc() {
        const loc = GameState.playerLocation || '';
        const short = loc.replace(/^.+省/, '').replace(/^.+?市/, '');
        return short || '本地';
    },

    templates: [
        // ====== 政务类（4个） ======
        {
            id: 'superior_inspect',
            title: '上级突击检查',
            category: '政务',
            trigger: () => TimeSystem.month % 4 === 0,
            body: () => {
                const topic = ['扶贫成效','党建材料','环保整改','安全生产','营商环境'][Math.floor(Math.random()*5)];
                return `县委督查组下周到${EventSystem._currentLoc()}突击检查${topic}工作。据说这次检查结果将直接影响年度考核排名。`;
            },
            options: [
                { label: '连夜准备材料，全员加班迎检', effects: { budget: -12, perf: 4 }, risk: 0 },
                { label: '如实展示，不做额外准备', effects: { perf: Math.random() > 0.5 ? 2 : -2 }, risk: 0 },
                { label: '提前打探检查组偏好，有针对性地准备', effects: { budget: -8, perf: 3, conn: 2 }, risk: 0, needConn: 30 },
            ],
        },
        {
            id: 'project_deadline',
            title: '项目验收冲刺',
            category: '政务',
            trigger: () => ProjectSystem.activeProjects.some(p => p.progress >= p.duration * 0.7),
            body: () => {
                const proj = EventSystem._pickProject();
                return proj ? `「${proj.name}」已接近尾声，但最后30%的进度还差几个关键环节。如果本月能加把劲，有望在验收时拿到「优良」评级。` : `手头有个重点项目接近收尾，但资金和人手都开始吃紧。`;
            },
            options: [
                { label: '追加投入，确保按期高质量完成', effects: { budget: -15, perf: 5 }, risk: 0 },
                { label: '按现有节奏推进，不做额外投入', effects: { perf: 1 }, risk: 0 },
                { label: '赶工期——质量差一点，但按时交', effects: { perf: 3, budget: -5 }, risk: 2, grayLevel: 1 },
            ],
        },
        {
            id: 'dept_conflict',
            title: '跨部门推诿扯皮',
            category: '政务',
            trigger: () => Math.random() < 0.35,
            body: () => {
                const npc = EventSystem._pickNPC('同级');
                const otherDept = ['财政所','城建办','农经站','综治办'][Math.floor(Math.random()*4)];
                return `${npc ? npc.name : otherDept+'负责人'}把一件本该他们部门处理的事推到了你这里。这件事费力不讨好，但拖下去对工作不利。`;
            },
            options: [
                { label: '主动接手，把事办好', effects: { perf: 3, conn: 3 }, risk: 0 },
                { label: '据理力争，明确责任归属', effects: { perf: 1 }, risk: 0 },
                { label: '找到分管领导评理', effects: { budget: -3, conn: 4 }, risk: 0, needConn: 30 },
                { label: '拖着——看谁先着急', effects: { perf: -2 }, risk: 1 },
            ],
        },
        {
            id: 'policy_change',
            title: '新政策落地困局',
            category: '政务',
            trigger: () => Math.random() < 0.3,
            body: () => {
                const policy = ['精简审批流程','环保新规','乡村振兴考核办法','基层减负令'][Math.floor(Math.random()*4)];
                return `县里刚下发了关于「${policy}」的最新文件，要求各乡镇限期落实。但文件里的要求和本镇实际情况差距很大，硬推可能引发矛盾。`;
            },
            options: [
                { label: '严格按文件执行，不讲条件', effects: { perf: 2, conn: -3 }, risk: 0 },
                { label: '因地制宜，做变通处理', effects: { perf: 3 }, risk: 1 },
                { label: '先观望，等其他乡镇怎么做再说', effects: {}, risk: 0 },
            ],
        },

        // ====== 关系类（4个） ======
        {
            id: 'ask_for_help',
            title: '同僚请托',
            category: '关系',
            trigger: () => !!NPCPool.npcs.find(n => RelationshipSystem.get(n.id) >= 30),
            body: () => {
                const npc = NPCPool.npcs.find(n => RelationshipSystem.get(n.id) >= 30);
                const favors = ['亲戚想承包镇上的一个小工程','朋友的孩子想进镇上的事业单位','老同学的公司在隔壁镇吃了闭门羹，想通过你牵线','村里想争取一笔专项补贴，需要镇上签字'];
                return `${npc ? npc.name : '一位同僚'}私下找到你：${favors[Math.floor(Math.random()*favors.length)]}。这件事说大不大，但需要你动用一些关系。`;
            },
            options: [
                { label: '全力帮忙，亲自跑腿协调', effects: { conn: 10, budget: -8 }, risk: 1 },
                { label: '象征性打个招呼，成不成看运气', effects: { conn: 4 }, risk: 0 },
                { label: '婉拒——这事不好插手', effects: { conn: -8, perf: 1 }, risk: 0 },
                { label: '暗示需要「表示表示」', effects: { conn: 3, budget: 25 }, risk: 2, grayLevel: 1, needConn: 40 },
            ],
        },
        {
            id: 'leader_hint',
            title: '领导的弦外之音',
            category: '关系',
            trigger: () => !!NPCPool.npcs.find(n => {
                const att = RelationshipSystem.get(n.id);
                const r = RankDB.getRankByName(n.rank);
                const pr = RankDB.getRankByName(GameState.playerRank);
                return att >= 15 && r && pr && r.id > pr.id;
            }),
            body: () => {
                const npc = EventSystem._pickNPC('上级');
                return `${npc ? npc.name : '分管领导'}在走廊上「偶遇」你，聊了几句工作后，忽然话锋一转：「最近镇上有些声音，说我们班子不够团结。你怎么看？」——你意识到，这是在试探你的立场。`;
            },
            options: [
                { label: '表态支持领导，明确站队', effects: { conn: 6, perf: 1 }, risk: 1 },
                { label: '含混带过，不表态', effects: {}, risk: 0 },
                { label: '坦诚表达自己的看法', effects: { conn: -3, perf: 2 }, risk: 1 },
            ],
        },
        {
            id: 'subordinate_seeks',
            title: '下属求上进',
            category: '关系',
            trigger: () => !!NPCPool.npcs.find(n => RelationshipSystem.get(n.id) >= 40 && n.position.includes('干事')),
            body: () => {
                const npc = NPCPool.npcs.find(n => RelationshipSystem.get(n.id) >= 40 && (n.position.includes('干事') || n.position.includes('科员')));
                return `${npc ? npc.name : '你部门的一个年轻人'}最近工作格外卖力。今天他鼓起勇气，委婉地问你能不能考虑推荐他参加今年的后备干部培训。你知道他能力还行，但资历确实还差一点。`;
            },
            options: [
                { label: '大力推荐，给他机会', effects: { conn: 6, budget: -3 }, risk: 0 },
                { label: '实话实说——再锻炼半年', effects: { conn: -2, perf: 1 }, risk: 0 },
                { label: '暗示需要点「实际行动」', effects: { conn: 2, budget: 15 }, risk: 2, grayLevel: 1 },
            ],
        },
        {
            id: 'dinner_network',
            title: '饭局上的暗流',
            category: '关系',
            trigger: () => Math.random() < 0.4,
            body: () => {
                const dept = ['财政','组织','宣传','政法'][Math.floor(Math.random()*4)];
                return `周末一个私人饭局上，${dept}口线的几个干部都在。三杯酒下肚，话题开始往「上面的人事安排」上靠。有人看似不经意地问你对新来的副书记怎么看。`;
            },
            options: [
                { label: '顺着大家的话说，融入圈子', effects: { conn: 5, budget: -8 }, risk: 1 },
                { label: '少喝酒多听，不发表看法', effects: {}, risk: 0 },
                { label: '借机表达自己的见解，争取认同', effects: { conn: 3, perf: 1 }, risk: 0, needConn: 35 },
            ],
        },

        // ====== 灰色类（4个） ======
        {
            id: 'businessman_gift',
            title: '节日的「心意」',
            category: '灰色',
            trigger: () => TimeSystem.month % 5 === 0,
            body: () => {
                const npc = EventSystem._pickNPC('企业');
                const gifts = ['一张购物卡','两瓶好酒和一盒高档茶叶','一个不起眼的信封','一部新手机「给你试用」'];
                return `${npc ? npc.name : '一位企业主'}借着过节的名义，悄悄塞给你${gifts[Math.floor(Math.random()*gifts.length)]}，笑着说「一点心意，不成敬意」。`;
            },
            options: [
                { label: '坚决推回去', effects: { perf: 1 }, risk: 0 },
                { label: '推辞一番后收下', effects: { budget: 15, perf: -1 }, risk: 1, grayLevel: 1 },
                { label: '坦然收下——他也找过别人', effects: { budget: 30, conn: 2 }, risk: 2, grayLevel: 1 },
            ],
        },
        {
            id: 'bid_hint',
            title: '招标前的来电',
            category: '灰色',
            trigger: () => ProjectSystem.activeProjects.some(p => p.category === '基础设施'),
            body: () => {
                const npc = EventSystem._pickNPC('同级');
                return `镇上的工程项目马上要招标了。${npc ? npc.name+'打来电话' : '有人打来电话'}，说他有个「朋友」的公司对这个项目很感兴趣，「如果你能在评标时关照一下，事后必有重谢」。`;
            },
            options: [
                { label: '拒绝——按程序招标', effects: { perf: 2 }, risk: 0 },
                { label: '答应，暗示他直接找评标的人', effects: { budget: 30, perf: -3 }, risk: 3, grayLevel: 2, needConn: 35 },
                { label: '应承下来但不打算真帮忙', effects: { conn: 3 }, risk: 1 },
            ],
        },
        {
            id: 'expense_padding',
            title: '报销单上的学问',
            category: '灰色',
            trigger: () => Math.random() < 0.35,
            body: () => {
                const amt = 3 + Math.floor(Math.random() * 10);
                return `月底报账，你发现有几笔公务支出可以「灵活处理」——把${amt}条个人消费塞进公务账单并不难，财务那边也不会细查。大家都在这么做。`;
            },
            options: [
                { label: '如实填写，一分不多报', effects: { perf: 1 }, risk: 0 },
                { label: '多报个几百块——小钱没人计较', effects: { budget: 8, perf: -1 }, risk: 1, grayLevel: 1 },
                { label: '既然做了就做大点，把最近的消费都塞进去', effects: { budget: 25, perf: -3 }, risk: 3, grayLevel: 1 },
            ],
        },
        {
            id: 'land_favor',
            title: '土地变性的诱惑',
            category: '灰色',
            trigger: () => ProjectSystem.activeProjects.some(p => p.category === '招商引资') && ResourceSystem.connections >= 40,
            body: () => {
                return `一个开发商看中了镇郊的一块农用地，想改成商业用地建物流园。按规定需要层层审批，但他表示「如果你能帮忙推动，可以给你留几个点的干股」。这块地确实有开发价值，但手续上需要「灵活处理」。`;
            },
            options: [
                { label: '拒绝——农用地转用红线不能碰', effects: { perf: 3 }, risk: 0 },
                { label: '帮他指条「明路」但不亲自插手', effects: { conn: 5, budget: 20, perf: -2 }, risk: 3, grayLevel: 2, needConn: 50 },
                { label: '积极参与运作——这是大机会', effects: { budget: 100, conn: 3, perf: -8 }, risk: 5, grayLevel: 3, needConn: 65 },
            ],
        },

        // ====== 危机类（4个） ======
        {
            id: 'public_complaint',
            title: '群众实名举报',
            category: '危机',
            trigger: () => {
                const hasGray = GrayZoneSystem.riskLevel > 10;
                const hasEnemy = !!NPCPool.npcs.find(n => RelationshipSystem.get(n.id) < -25);
                return (hasGray || hasEnemy) && Math.random() < 0.4;
            },
            body: () => {
                const issue = ['违规审批','利益输送','滥用职权','漠视群众诉求','项目质量低劣'][Math.floor(Math.random()*5)];
                return `镇纪委收到一份实名举报信，反映你在${issue}方面存在问题。虽然信中的指控有些夸大，但有几处细节确实不太好解释。纪委已经开始初步核实。`;
            },
            options: [
                { label: '主动找纪委说明情况，配合调查', effects: { perf: -5 }, risk: 0 },
                { label: '私下找人斡旋，争取把事压下来', effects: { budget: -35, conn: -8, perf: -2 }, risk: 4, grayLevel: 2, needConn: 45 },
                { label: '反击——找出举报人的问题举报回去', effects: { conn: -15, perf: -8 }, risk: 5, needConn: 55 },
            ],
        },
        {
            id: 'online_rumor',
            title: '网上有人爆料',
            category: '危机',
            trigger: () => Math.random() < 0.25,
            body: () => {
                const platform = ['本地论坛','微信朋友圈','短视频平台','微博'][Math.floor(Math.random()*4)];
                return `一条关于你的帖子在${platform}上开始传播。帖子说你「在工作中搞特殊化、优亲厚友」。虽然内容真假参半，但转发量已经过百，县里宣传部门也注意到了。`;
            },
            options: [
                { label: '正面回应，公布事实', effects: { perf: 1, budget: -3 }, risk: 0 },
                { label: '联系平台删帖', effects: { budget: -20, conn: -3 }, risk: 2, grayLevel: 1, needConn: 35 },
                { label: '冷处理——让它自己沉下去', effects: {}, risk: 1 },
            ],
        },
        {
            id: 'safety_accident',
            title: '安全出事了',
            category: '危机',
            trigger: () => ProjectSystem.activeProjects.some(p => p.category === '基础设施') && Math.random() < 0.3,
            body: () => {
                const proj = ProjectSystem.activeProjects.find(p => p.category === '基础设施');
                return `${proj ? '「'+proj.name+'」' : '一个在建'}工地上出了安全事故——一名工人从脚手架上摔下来，目前在医院急救。虽然没有生命危险，但这事如果处理不好，就是你的责任事故。`;
            },
            options: [
                { label: '第一时间赶到现场，安排救治和善后', effects: { perf: -1, budget: -20 }, risk: 0 },
                { label: '派人去处理，自己保持距离', effects: { perf: -4, conn: -5 }, risk: 1 },
                { label: '封锁消息，私了赔偿', effects: { budget: -50, perf: -6 }, risk: 4, grayLevel: 2, needConn: 45 },
            ],
        },
        {
            id: 'political_rival',
            title: '暗处的对手',
            category: '危机',
            trigger: () => {
                const enemy = NPCPool.npcs.find(n => RelationshipSystem.get(n.id) < -30);
                return !!enemy && Math.random() < 0.3;
            },
            body: () => {
                const enemy = NPCPool.npcs.find(n => RelationshipSystem.get(n.id) < -30);
                return `你偶然得知，${enemy ? enemy.name : '有人在背后'}一直在收集你的「材料」——一些工作中的小失误、几次不合时宜的表态、甚至几年前的旧账。对方似乎在等一个合适的时机把这些东西递上去。`;
            },
            options: [
                { label: '我行我素——身正不怕影子斜', effects: {}, risk: 2 },
                { label: '主动找对方「谈谈」，缓和关系', effects: { conn: 3, budget: -10 }, risk: 1, needConn: 30 },
                { label: '收集对方的把柄，互相制衡', effects: { conn: -5, perf: -2 }, risk: 3, grayLevel: 1, needConn: 50 },
            ],
        },

        // ====== 机遇类（4个） ======
        {
            id: 'superior_notice',
            title: '领导的赏识',
            category: '机遇',
            trigger: () => ResourceSystem.performance >= 65 && TimeSystem.month % 6 === 0,
            body: () => {
                const npc = EventSystem._pickNPC('上级');
                return `${npc ? npc.name : '一位领导'}在最近一次会议上点名表扬了你近期的工作，特别提到了你在${['项目推进','经济发展','民生改善','社会稳定'][Math.floor(Math.random()*4)]}方面的成绩。这在镇上是少有的正面信号。`;
            },
            options: [
                { label: '抓住机会，主动汇报下一步工作计划', effects: { conn: 6, perf: 2 }, risk: 0 },
                { label: '谦逊回应，把功劳归于团队', effects: { conn: 4, perf: 1 }, risk: 0 },
                { label: '借机提出一个需要领导支持的大项目', effects: { conn: 3, perf: 5, budget: -8 }, risk: 1, needConn: 40 },
            ],
        },
        {
            id: 'media_attention',
            title: '媒体要采访你',
            category: '机遇',
            trigger: () => ResourceSystem.performance >= 55 && Math.random() < 0.25,
            body: () => {
                const media = ['县融媒体中心','市电视台','省报驻站记者'][Math.floor(Math.random()*3)];
                return `${media}的记者联系镇上，想采访你在${['脱贫攻坚','产业发展','基层治理','为民服务'][Math.floor(Math.random()*4)]}方面的经验做法。这是一个难得的正面曝光机会，但也意味着你的一言一行都会被放大。`;
            },
            options: [
                { label: '精心准备，抓住机会展示形象', effects: { perf: 4, conn: 3 }, risk: 0 },
                { label: '低调处理，让宣传委员去对接', effects: { conn: 2 }, risk: 0 },
                { label: '借媒体之口，隐晦地反映一些上面关注的问题', effects: { perf: 2, conn: -3 }, risk: 2, needConn: 45 },
            ],
        },
        {
            id: 'vacancy_opens',
            title: '上面有空缺了',
            category: '机遇',
            trigger: () => TimeSystem.yearsAtCurrentRank >= 1 && Math.random() < 0.2,
            body: () => {
                const positions = ['经济发展办主任','党政办主任','财政所副所长','综治办副主任'];
                const pos = positions[Math.floor(Math.random()*positions.length)];
                return `镇上突然传出消息——${pos}的岗位因为原任调离出现了空缺。虽然你的年限还不一定够正式晋升，但如果你表现出足够的积极性，也许能争取到一个「主持工作」的机会。`;
            },
            options: [
                { label: '主动请缨，向领导表达意愿', effects: { conn: 5, perf: 1 }, risk: 0 },
                { label: '先打听清楚有多少人在竞争', effects: { conn: 2, budget: -5 }, risk: 0, needConn: 25 },
                { label: '按兵不动——是你的跑不掉', effects: {}, risk: 0 },
            ],
        },
        {
            id: 'major_event',
            title: '重大活动主办权',
            category: '机遇',
            trigger: () => ResourceSystem.performance >= 70 && ProjectSystem.completedHistory.length >= 3 && Math.random() < 0.3,
            body: () => `县里计划举办「${['乡村振兴现场会','基层党建观摩','产业发展经验交流','农村人居环境整治示范'][Math.floor(Math.random()*4)]}」，正在选主办乡镇。如果争取到主办权，办好这场活动将是一次绝佳的露脸机会——但办砸了也会很狼狈。`,
            options: [
                { label: '全力争取主办权，精心筹备', effects: { budget: -25, perf: 8, conn: 5 }, risk: 2 },
                { label: '表示愿意承办但不主动竞争', effects: { perf: 2 }, risk: 0 },
                { label: '评估一下——如果风险太大就放弃', effects: {}, risk: 0 },
            ],
        },
        // ====== 新增：话术密码 / 饭局 / 亲信（MVP） ======
        {
            id: 'dinner_test',
            title: '饭局试探',
            category: '关系',
            trigger: () => TimeSystem.month % 3 === 0,
            body: () => {
                const guests = NPCPool.npcs.filter(n => n.rank && n.rank !== '—').slice(0, 5);
                const names = guests.map(n => n.name).join('、') || '几位同事';
                const topic = ['新来的副书记','年底的人事调整','县里的重点项目分配','最近上面的巡视动态'][Math.floor(Math.random()*4)];
                return `周末饭局，${names}都在。三杯酒下肚，话题转到「${topic}」。有人看似不经意地问你：「你是怎么看的？」`;
            },
            options: function() {
                const guests = NPCPool.npcs.filter(n => n.rank && n.rank !== '—').slice(0, 4);
                const npcEff = {}; guests.forEach(n => npcEff[n.id] = 3 + Math.floor(Math.random() * 5));
                const offenseTarget = guests.length > 0 ? guests[Math.floor(Math.random()*guests.length)] : null;
                return [
                    { label: '打个太极——「上面怎么安排我们就怎么执行嘛」', effects: {}, risk: 0 },
                    { label: '说说真心话，借此拉近关系', effects: { npcEffects: npcEff }, risk: 2,
                        seed: offenseTarget ? { type: 'offense', window: [2,6], probability: 35, data: { npcId: offenseTarget.id, delta: -12 } } : null },
                    { label: '借机试探——「在座各位觉得张书记会怎么想？」', effects: { conn: 3 }, risk: 0, needConn: 35,
                        seed: { type: 'alliance', window: [3,8], probability: 50, data: { npcId: guests[0]?.id, delta: 8 } } },
                ];
            },
        },
        {
            id: 'coded_speech',
            title: '领导的暗示',
            category: '关系',
            trigger: () => !!NPCPool.npcs.find(n => {
                const r = RankDB.getRankByName(n.rank); const pr = RankDB.getRankByName(GameState.playerRank);
                return r && pr && r.id > pr.id && RelationshipSystem.get(n.id) >= 10;
            }) && Math.random() < 0.35,
            body: () => {
                const superior = NPCPool.npcs.find(n => {
                    const r = RankDB.getRankByName(n.rank); const pr = RankDB.getRankByName(GameState.playerRank);
                    return r && pr && r.id > pr.id && RelationshipSystem.get(n.id) >= 10;
                });
                const hints = ['「年轻人要多做少说」','「最近有些声音，你自己要注意」','「你上次在会上的发言，有人不太高兴」','「上面在考察一些人，你要有准备」'];
                return `${superior ? superior.name : '领导'}把你叫到办公室，关上门说了一句：${hints[Math.floor(Math.random()*hints.length)]}。然后什么都没再说，让你走了。`;
            },
            options: [
                { label: '心领神会，回去自查自纠', effects: { perf: 2 }, risk: 0 },
                { label: '追问他具体指的什么', effects: {}, risk: 1, needConn: 40,
                    seed: { type: 'offense', window: [3,6], probability: 40, data: { delta: -10 } } },
                { label: '认为领导在敲打你，先送礼表示表态', effects: { budget: -15, conn: 4 }, risk: 1, grayLevel: 1 },
            ],
        },
        {
            id: 'protege_trouble',
            title: '亲信出事了',
            category: '危机',
            trigger: () => (GameState.proteges || []).length > 0 && Math.random() < 0.3,
            body: () => {
                const pid = (GameState.proteges || [])[Math.floor(Math.random() * GameState.proteges.length)];
                const npc = NPCPool.getNPC(pid);
                const issues = ['被纪委约谈','在工程验收中收了施工方的礼','把一笔扶贫款挪用了','被人举报滥用职权'];
                return `${npc ? npc.name : '你一手提拔的人'}出事了——${issues[Math.floor(Math.random()*issues.length)]}。他来找你求救，说事情是因你安排的任务而起的。`;
            },
            options: function() {
                const proteges = GameState.proteges || [];
                const pid = proteges[Math.floor(Math.random() * proteges.length)];
                const npcEffects = {}; if (pid) npcEffects[pid] = -30;
                return [
                    { label: '主动切割——「组织原则不能违背」', effects: { perf: 3, conn: -10, npcEffects }, risk: 0 },
                    { label: '帮他摆平——找人说情', effects: { budget: -40, conn: -8 }, risk: 3, grayLevel: 2, needConn: 45 },
                    { label: '替他扛一部分——「是我的责任」', effects: { perf: -8, conn: 5 }, risk: 2, needConn: 50,
                        seed: { type: 'exposure', window: [4,10], probability: 60, data: {} } },
                ];
            },
        },
    ],

    init() {
        this.pendingEvents = [];
        this.eventHistory = [];
        this.activeSeeds = [];
        this.currentEvent = null;
    },

    checkTriggers() {
        if (TimeSystem.state !== 'NORMAL') return [];
        const newEvents = [];
        this.templates.forEach(tpl => {
            if (tpl.trigger() && Math.random() < 0.7) {
                const event = {
                    id: 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
                    templateId: tpl.id,
                    title: tpl.title,
                    category: tpl.category,
                    body: typeof tpl.body === 'function' ? tpl.body() : tpl.body,
                    options: typeof tpl.options === 'function' ? tpl.options() : tpl.options.map(o => ({...o})),
                };
                newEvents.push(event);
            }
        });
        return newEvents.slice(0, 2); // Max 2 new events per month
    },

    resolveEvent(eventId, optionIndex) {
        const event = this.pendingEvents.find(e => e.id === eventId);
        if (!event) return null;

        const option = event.options[optionIndex];
        if (!option) return null;

        // Apply self effects
        if (option.effects.perf) ResourceSystem.adjustPerformance(option.effects.perf);
        if (option.effects.conn) ResourceSystem.adjustConnections(option.effects.conn);
        if (option.effects.budget) ResourceSystem.adjustBudget(option.effects.budget);

        // Apply multi-NPC effects (饭局等场景影响多人)
        if (option.effects.npcEffects) {
            Object.entries(option.effects.npcEffects).forEach(([npcId, delta]) => {
                RelationshipSystem.adjust(npcId, delta);
            });
        }

        // Track gray operation
        if (option.grayLevel) {
            GrayZoneSystem.recordOperation(option.grayLevel, option.risk);
        }

        this.pendingEvents = this.pendingEvents.filter(e => e.id !== eventId);
        this.eventHistory.push({ ...event, chosenOption: optionIndex, resolvedMonth: TimeSystem.totalMonths });

        // Plant seed (通用延迟后果)
        if (option.seed) {
            this.activeSeeds.push({
                type: option.seed.type || 'generic',
                sourceEventId: event.id,
                triggerWindow: option.seed.window || [3, 12],
                probability: option.seed.probability || 30,
                plantedMonth: TimeSystem.totalMonths,
                data: option.seed.data || {},
            });
        }
        // backward compat: old risk-based exposure seeds
        else if (option.risk > 1 && Math.random() < option.risk * 0.15) {
            this.activeSeeds.push({
                type: 'exposure',
                sourceEventId: event.id,
                triggerWindow: 3 + Math.floor(Math.random() * 10),
                probability: option.risk * 15,
                plantedMonth: TimeSystem.totalMonths,
                data: {},
            });
        }

        return { event, option, effects: option.effects };
    },

    monthlyTick() {
        // Check chain seeds with type-specific handling
        const triggeredSeeds = [];
        this.activeSeeds = this.activeSeeds.filter(seed => {
            const elapsed = TimeSystem.totalMonths - seed.plantedMonth;
            const window = Array.isArray(seed.triggerWindow) ? seed.triggerWindow : [seed.triggerWindow, seed.triggerWindow];
            const [windowMin, windowMax] = window;

            // seedType: 'exposure' | 'offense' | 'alliance' | 'betrayal' | 'generic'
            let triggered = false;
            if (elapsed >= windowMin && Math.random() * 100 <= seed.probability) {
                triggered = true;
            }
            // 超过窗口最大值也强制触发（不能在事件系统里永远挂着）
            if (elapsed > windowMax) {
                triggered = seed.type !== 'offense'; // 'offense'类型过期作废
            }

            if (triggered) {
                triggeredSeeds.push(seed);
                // offense类型：被得罪的人态度下降
                if (seed.type === 'offense' && seed.data.npcId) {
                    RelationshipSystem.adjust(seed.data.npcId, seed.data.delta || -15);
                }
                // alliance类型：盟友态度提升
                if (seed.type === 'alliance' && seed.data.npcId) {
                    RelationshipSystem.adjust(seed.data.npcId, seed.data.delta || 10);
                }
                return false;
            }
            return true;
        });

        // Generate new events
        const newEvents = this.checkTriggers();
        this.pendingEvents.push(...newEvents);

        return { newEvents, triggeredSeeds };
    },

    getSaveState() {
        return {
            pendingEvents: this.pendingEvents.map(e => ({...e})),
            eventHistory: this.eventHistory.slice(-50),
            activeSeeds: this.activeSeeds.map(s => ({...s})),
        };
    },
    loadSaveState(data) {
        this.pendingEvents = data.pendingEvents || [];
        this.eventHistory = data.eventHistory || [];
        this.activeSeeds = data.activeSeeds || [];
    },
};
