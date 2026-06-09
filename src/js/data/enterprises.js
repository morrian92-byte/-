// 国企命名库 — 省级/市级/县级

const EnterpriseDB = {
    // 行业→公司名模板
    industries: {
        '城建': { suffix: ['城市建设投资集团有限公司','城市发展控股集团有限公司','城市建设开发有限公司'], grayType: '工程回扣+土地开发' },
        '交通': { suffix: ['交通投资控股有限公司','交通建设集团有限公司','交通基建集团有限公司'], grayType: '招标围标+材料采购' },
        '港务': { suffix: ['港口航运集团有限公司','港务控股股份有限公司','港口物流集团有限公司'], grayType: '码头租赁+通关灰色' },
        '水务': { suffix: ['水务环保股份有限公司','水利发展集团有限公司','公用事业控股有限公司'], grayType: '管网工程+特许经营' },
        '能源': { suffix: ['能源投资集团有限公司','能源供应集团有限公司','新能源投资有限公司'], grayType: '垄断供应+接入费' },
        '金融': { suffix: ['金融控股有限公司','金融投资控股有限公司','金融资产经营有限公司'], grayType: '资金拆借+融资平台' },
        '文旅': { suffix: ['文化旅游发展集团有限公司','文化旅游投资有限公司','文化体育产业集团有限公司'], grayType: '景区开发+演艺采购' },
        '高新': { suffix: ['高新技术产业投资有限公司','科技创新投资有限公司','数字经济发展有限公司'], grayType: '补贴套取+土地变性' },
        '农业': { suffix: ['农业发展投资集团有限公司','农业发展集团有限公司','粮食购销有限公司'], grayType: '补贴+收储利益' },
        '矿产': { suffix: ['矿产资源投资有限公司','矿业开发有限公司','煤炭工业集团有限公司'], grayType: '矿权出让+安全监管' },
        '地铁': { suffix: ['地铁建设运营有限公司','轨道交通集团有限公司'], grayType: '工程+设备采购' },
        '园区': { suffix: ['工业园区开发集团有限公司','经济开发区投资有限公司','空港经济区开发有限公司'], grayType: '招商优惠+土地' },
        '国际': { suffix: ['国际商贸集团有限公司','国际控股集团有限公司','国际交流中心有限公司'], grayType: '外贸配额+交流经费' },
    },

    // 省级国企（每个省8-12家）
    provincial: {
        '江海省': [
            { name: '江海城建投资集团有限公司', industry: '城建', ppiBase: 6.5 },
            { name: '江海交通投资控股有限公司', industry: '交通', ppiBase: 6.8 },
            { name: '江海港口航运集团有限公司', industry: '港务', ppiBase: 7.0 },
            { name: '江海水务环保股份有限公司', industry: '水务', ppiBase: 5.5 },
            { name: '江海能源投资集团有限公司', industry: '能源', ppiBase: 7.2 },
            { name: '江海金融控股有限公司', industry: '金融', ppiBase: 8.0 },
            { name: '江海文化旅游发展集团有限公司', industry: '文旅', ppiBase: 5.8 },
            { name: '江海高新技术产业投资有限公司', industry: '高新', ppiBase: 6.0 },
            { name: '江海农业发展投资有限公司', industry: '农业', ppiBase: 4.5 },
            { name: '江海国际商贸集团有限公司', industry: '国际', ppiBase: 6.2 },
        ],
        '岭东省': [
            { name: '岭东国际控股集团有限公司', industry: '国际', ppiBase: 7.5 },
            { name: '岭东科技创新投资有限公司', industry: '高新', ppiBase: 6.5 },
            { name: '岭东港口物流集团有限公司', industry: '港务', ppiBase: 7.2 },
            { name: '岭东城市建设开发有限公司', industry: '城建', ppiBase: 6.8 },
            { name: '岭南金融投资控股有限公司', industry: '金融', ppiBase: 8.5 },
            { name: '岭东交通基建集团有限公司', industry: '交通', ppiBase: 7.0 },
            { name: '岭东水务环境集团有限公司', industry: '水务', ppiBase: 5.5 },
            { name: '岭东文化旅游发展有限公司', industry: '文旅', ppiBase: 5.8 },
            { name: '岭东新能源投资有限公司', industry: '能源', ppiBase: 6.8 },
            { name: '岭东数字经济发展有限公司', industry: '高新', ppiBase: 6.2 },
            { name: '岭东生物医药投资有限公司', industry: '高新', ppiBase: 6.0 },
            { name: '南粤国际商贸集团有限公司', industry: '国际', ppiBase: 7.0 },
        ],
        '北原省': [
            { name: '北原煤炭工业集团有限公司', industry: '矿产', ppiBase: 7.5 },
            { name: '北原钢铁控股有限公司', industry: '矿产', ppiBase: 7.0 },
            { name: '北原重型机械集团有限公司', industry: '城建', ppiBase: 6.5 },
            { name: '北原能源化工投资有限公司', industry: '能源', ppiBase: 7.2 },
            { name: '北原交通建设集团有限公司', industry: '交通', ppiBase: 6.8 },
            { name: '北原城市建设投资有限公司', industry: '城建', ppiBase: 6.2 },
            { name: '北原水利发展集团有限公司', industry: '水务', ppiBase: 5.0 },
            { name: '北原文化旅游投资有限公司', industry: '文旅', ppiBase: 5.2 },
            { name: '北原农业开发集团有限公司', industry: '农业', ppiBase: 4.0 },
            { name: '北原矿产资源投资有限公司', industry: '矿产', ppiBase: 6.8 },
        ],
        '西川省': [
            { name: '西川交通投资集团有限公司', industry: '交通', ppiBase: 6.8 },
            { name: '西川水利水电开发有限公司', industry: '水务', ppiBase: 5.5 },
            { name: '西川文化旅游发展有限公司', industry: '文旅', ppiBase: 5.5 },
            { name: '西川城市建设投资有限公司', industry: '城建', ppiBase: 6.2 },
            { name: '西川白酒产业集团有限公司', industry: '国际', ppiBase: 6.5 },
            { name: '西川生态环保投资有限公司', industry: '水务', ppiBase: 5.0 },
            { name: '西川数字经济投资有限公司', industry: '高新', ppiBase: 5.8 },
            { name: '西川农业发展集团有限公司', industry: '农业', ppiBase: 4.2 },
            { name: '西川矿产开发投资有限公司', industry: '矿产', ppiBase: 6.5 },
            { name: '川府国际商贸有限公司', industry: '国际', ppiBase: 6.0 },
        ],
        '云岭省': [
            { name: '云岭旅游投资集团有限公司', industry: '文旅', ppiBase: 6.5 },
            { name: '云岭生物资源开发有限公司', industry: '农业', ppiBase: 4.5 },
            { name: '云岭水利电力投资有限公司', industry: '能源', ppiBase: 6.0 },
            { name: '云岭交通建设集团有限公司', industry: '交通', ppiBase: 6.5 },
            { name: '云岭城市建设投资有限公司', industry: '城建', ppiBase: 5.8 },
            { name: '云岭特色农业发展有限公司', industry: '农业', ppiBase: 3.8 },
            { name: '云岭民族文化产业发展有限公司', industry: '文旅', ppiBase: 4.5 },
            { name: '云岭矿业开发有限公司', industry: '矿产', ppiBase: 6.2 },
            { name: '云岭生态林业投资有限公司', industry: '农业', ppiBase: 4.0 },
        ],
        '京州市': [
            { name: '京州城市发展控股集团有限公司', industry: '城建', ppiBase: 7.5 },
            { name: '京州公共交通集团有限公司', industry: '交通', ppiBase: 6.5 },
            { name: '京州水务环保集团有限公司', industry: '水务', ppiBase: 6.0 },
            { name: '京州能源供应集团有限公司', industry: '能源', ppiBase: 7.0 },
            { name: '京州金融投资控股有限公司', industry: '金融', ppiBase: 8.5 },
            { name: '京州科技创新投资有限公司', industry: '高新', ppiBase: 7.0 },
            { name: '京州文化体育产业集团有限公司', industry: '文旅', ppiBase: 6.5 },
            { name: '京州地铁建设运营有限公司', industry: '地铁', ppiBase: 7.0 },
            { name: '京州国际交流中心有限公司', industry: '国际', ppiBase: 7.5 },
            { name: '京州数字经济投资集团有限公司', industry: '高新', ppiBase: 7.2 },
        ],
    },

    // 市级国企（按省-市索引，每市5-8家）
    city: {
        // 江海省各市
        '通阳市': [
            { name: '通阳城市发展集团有限公司', industry: '城建', ppiBase: 5.0 },
            { name: '通阳交通建设投资有限公司', industry: '交通', ppiBase: 5.2 },
            { name: '通阳地铁运营集团有限公司', industry: '地铁', ppiBase: 5.5 },
            { name: '通阳公用事业控股有限公司', industry: '水务', ppiBase: 4.5 },
            { name: '通阳文化旅游投资有限公司', industry: '文旅', ppiBase: 4.2 },
            { name: '通阳高新技术投资有限公司', industry: '高新', ppiBase: 4.8 },
            { name: '通阳金融资产经营有限公司', industry: '金融', ppiBase: 6.0 },
            { name: '通阳空港经济区开发有限公司', industry: '园区', ppiBase: 5.0 },
        ],
        '苏城市': [
            { name: '苏州工业园区开发集团有限公司', industry: '园区', ppiBase: 6.5 },
            { name: '苏城城市建设投资有限公司', industry: '城建', ppiBase: 5.5 },
            { name: '苏城交通基建集团有限公司', industry: '交通', ppiBase: 5.5 },
            { name: '苏城太湖旅游发展有限公司', industry: '文旅', ppiBase: 4.5 },
            { name: '苏城科技创新投资有限公司', industry: '高新', ppiBase: 5.2 },
            { name: '苏城供应链物流集团有限公司', industry: '交通', ppiBase: 4.8 },
            { name: '苏城数字产业发展有限公司', industry: '高新', ppiBase: 5.0 },
        ],
    },

    // 县级国企（按市-县索引，每县3-5家）
    county: {
        '临溪县': [
            { name: '临溪县城市投资建设有限公司', industry: '城建', ppiBase: 3.5 },
            { name: '临溪县交通投资发展有限公司', industry: '交通', ppiBase: 3.2 },
            { name: '临溪县文化旅游投资有限公司', industry: '文旅', ppiBase: 2.8 },
            { name: '临溪县水利发展有限公司', industry: '水务', ppiBase: 2.5 },
            { name: '临溪县粮食购销有限公司', industry: '农业', ppiBase: 2.0 },
        ],
    },

    // 根据地址获取国企列表
    getEnterprises(province, city, county) {
        const results = [];
        // 省级
        if (this.provincial[province]) {
            this.provincial[province].forEach(e => {
                results.push({ ...e, level: '省级' });
            });
        }
        // 市级
        if (this.city[city]) {
            this.city[city].forEach(e => {
                results.push({ ...e, level: '市级' });
            });
        }
        // 县级
        if (this.county[county]) {
            this.county[county].forEach(e => {
                results.push({ ...e, level: '县级' });
            });
        }
        return results;
    },
};
