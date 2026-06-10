// 纯 SVG 插图库 — 零外部依赖

const Illustrations = {

    // 顶栏天安门剪影（金色SVG）
    topBarEmblem() {
        return `<svg viewBox="0 0 60 48" width="60" height="48" style="margin-right:8px;opacity:0.9">
            <g fill="none" stroke="${this._gold()}" stroke-width="1.5">
                <!-- 城楼屋顶 -->
                <path d="M10 20 L30 8 L50 20" stroke-width="2"/>
                <line x1="15" y1="20" x2="15" y2="38"/>
                <line x1="25" y1="14" x2="25" y2="38"/>
                <line x1="30" y1="12" x2="30" y2="38"/>
                <line x1="35" y1="14" x2="35" y2="38"/>
                <line x1="45" y1="20" x2="45" y2="38"/>
                <!-- 城楼底座 -->
                <rect x="8" y="38" width="44" height="4" rx="1" fill="${this._gold()}" fill-opacity="0.6"/>
                <!-- 红旗 -->
                <path d="M6 8 L6 42 M6 9 L16 14 L6 18" fill="${this._gold()}" fill-opacity="0.3"/>
            </g>
        </svg>`;
    },

    // 入场页大幅天安门
    entryHero() {
        return `<svg viewBox="0 0 280 180" style="width:100%;max-width:280px;margin:0 auto 20px;display:block">
            <!-- 天空渐变 -->
            <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${this._red()}" stop-opacity="0.15"/>
                    <stop offset="100%" stop-color="${this._red()}" stop-opacity="0.02"/>
                </linearGradient>
                <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${this._red()}"/>
                    <stop offset="100%" stop-color="${this._redDark()}"/>
                </linearGradient>
            </defs>
            <rect width="280" height="180" fill="url(#skyGrad)" rx="12"/>

            <!-- 光芒 -->
            <g opacity="0.15">
                ${Array.from({length:12}, (_,i) => {
                    const angle = i * 30;
                    const x2 = 140 + 90 * Math.cos(angle * Math.PI/180);
                    const y2 = 50 + 90 * Math.sin(angle * Math.PI/180);
                    return `<line x1="140" y1="50" x2="${x2}" y2="${y2}" stroke="${this._gold()}" stroke-width="2"/>`;
                }).join('')}
            </g>

            <!-- 天安门 -->
            <g transform="translate(70,40)">
                <!-- 城楼底色 -->
                <rect x="30" y="12" width="100" height="50" rx="2" fill="url(#redGrad)"/>
                <!-- 城楼屋顶 -->
                <polygon points="20,12 80,0 140,12" fill="${this._gold()}" opacity="0.8"/>
                <!-- 中层屋檐 -->
                <polygon points="25,22 80,14 135,22" fill="${this._gold()}" opacity="0.5"/>
                <!-- 柱子 -->
                ${[45,60,75,90,105,120].map(x =>
                    `<rect x="${x}" y="25" width="4" height="37" fill="${this._gold()}" opacity="0.4"/>`
                ).join('')}
                <!-- 城门 -->
                <rect x="68" y="35" width="24" height="27" rx="12 12 0 0" fill="${this._gold()}" opacity="0.3"/>
                <!-- 国徽位置 -->
                <circle cx="80" cy="10" r="8" stroke="${this._gold()}" stroke-width="1.5" fill="none" opacity="0.7"/>
                <circle cx="80" cy="10" r="3" fill="${this._gold()}" opacity="0.5"/>
                <!-- 标语位 -->
                <rect x="32" y="56" width="20" height="4" rx="1" fill="${this._gold()}" opacity="0.3"/>
                <rect x="110" y="56" width="20" height="4" rx="1" fill="${this._gold()}" opacity="0.3"/>
            </g>

            <!-- 文字 -->
            <text x="140" y="140" text-anchor="middle" font-family="serif" font-size="16" font-weight="bold" fill="${this._red()}">为人民服务</text>
            <text x="140" y="160" text-anchor="middle" font-family="sans-serif" font-size="10" fill="${this._gold()}" opacity="0.6">— 公务员录用考试 —</text>
        </svg>`;
    },

    // 印章 — 晋升/认证用
    seal(text, size = 72) {
        return `<svg viewBox="0 0 80 80" width="${size}" height="${size}" class="stamp-animate">
            <circle cx="40" cy="40" r="36" fill="none" stroke="${this._red()}" stroke-width="3"/>
            <circle cx="40" cy="40" r="30" fill="none" stroke="${this._red()}" stroke-width="1.5" stroke-dasharray="3 3"/>
            <text x="40" y="38" text-anchor="middle" font-family="serif" font-size="18" fill="${this._red()}" font-weight="bold">${text}</text>
            <text x="40" y="55" text-anchor="middle" font-family="serif" font-size="8" fill="${this._red()}">批 准</text>
        </svg>`;
    },

    // 晋升成功页
    promotionCelebration() {
        const stars = Array.from({length:20}, (_,i) => {
            const x = 30 + Math.random() * 220;
            const y = 10 + Math.random() * 60;
            const size = 3 + Math.random() * 5;
            const delay = Math.random() * 0.5;
            return `<circle cx="${x}" cy="${y}" r="${size}" fill="${this._gold()}" opacity="0.8">
                <animate attributeName="cy" from="${y-5}" to="${y+80}" dur="1.5s" begin="${delay}s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" begin="${delay}s" repeatCount="indefinite"/>
            </circle>`;
        }).join('');

        return `<div style="text-align:center;padding:20px 0">
            <svg viewBox="0 0 280 100" style="width:100%;max-width:280px;margin-bottom:12px">
                <!-- 绶带 -->
                <rect x="60" y="35" width="160" height="30" rx="4" fill="${this._red()}" opacity="0.15"/>
                <!-- 勋章 -->
                <circle cx="140" cy="45" r="25" fill="none" stroke="${this._gold()}" stroke-width="2.5"/>
                <circle cx="140" cy="45" r="18" fill="${this._gold()}" opacity="0.2"/>
                <polygon points="140,20 145,38 164,38 148,48 154,66 140,56 126,66 132,48 116,38 135,38" fill="${this._gold()}" opacity="0.8"/>
                <!-- 飘带 -->
                <path d="M55 50 Q30 70 44 75" fill="none" stroke="${this._red()}" stroke-width="3"/>
                <path d="M225 50 Q250 70 236 75" fill="none" stroke="${this._red()}" stroke-width="3"/>
                ${stars}
            </svg>
        </div>`;
    },

    // 空状态 — 无项目
    emptyProjects() {
        return `<svg viewBox="0 0 120 60" style="width:100%;opacity:0.3">
            <rect x="30" y="25" width="60" height="35" rx="2" fill="${this._textLight()}" stroke="${this._textLight()}" stroke-width="1"/>
            <rect x="35" y="30" width="50" height="4" rx="1" fill="${this._textLight()}"/>
            <rect x="35" y="38" width="35" height="3" rx="1" fill="${this._textLight()}"/>
            <rect x="35" y="44" width="42" height="3" rx="1" fill="${this._textLight()}"/>
            <!-- 笔筒 -->
            <rect x="95" y="18" width="8" height="18" rx="2" fill="${this._textLight()}"/>
        </svg>`;
    },

    // 空状态 — 无事件
    emptyEvents() {
        return `<svg viewBox="0 0 80 50" style="width:100%;opacity:0.3">
            <rect x="28" y="22" width="24" height="16" rx="3" fill="${this._textLight()}" stroke="${this._textLight()}" stroke-width="1"/>
            <rect x="30" y="25" width="18" height="3" rx="1" fill="${this._textLight()}"/>
            <!-- 茶杯热气 -->
            <path d="M36 19 Q38 14 34 12" fill="none" stroke="${this._textLight()}" stroke-width="1.5"/>
            <path d="M41 20 Q43 15 39 13" fill="none" stroke="${this._textLight()}" stroke-width="1"/>
        </svg>`;
    },

    // 空状态 — 无人际关系
    emptyNPCs() {
        return `<svg viewBox="0 0 100 50" style="width:100%;opacity:0.3">
            <rect x="35" y="22" width="8" height="16" rx="3" fill="${this._textLight()}"/>
            <rect x="46" y="22" width="20" height="3" rx="1" fill="${this._textLight()}"/>
            <rect x="46" y="30" width="14" height="2" rx="1" fill="${this._textLight()}"/>
            <circle cx="53" cy="18" r="8" fill="none" stroke="${this._textLight()}" stroke-width="1.5"/>
        </svg>`;
    },

    // 灰色操作 — 水墨竹
    grayBamboo() {
        return `<svg viewBox="0 0 40 60" width="40" height="60" style="opacity:0.15;position:absolute;right:8px;bottom:8px">
            <path d="M20 60 Q18 40 20 20 Q22 0 18 -10" fill="none" stroke="#333" stroke-width="2"/>
            <path d="M20 35 Q30 28 34 30" fill="none" stroke="#333" stroke-width="1.5"/>
            <ellipse cx="34" cy="30" rx="4" ry="1.5" fill="#333"/>
        </svg>`;
    },

    // 危机 — 红色警示纹
    crisisAlert() {
        return `<svg viewBox="0 0 40 40" width="40" height="40" style="opacity:0.2;position:absolute;right:4px;top:4px">
            <polygon points="20,2 38,36 2,36" fill="${this._red()}" stroke="${this._red()}" stroke-width="1"/>
            <text x="20" y="28" text-anchor="middle" font-size="18" fill="white">!</text>
        </svg>`;
    },

    // 祥云纹
    xiangYun() {
        return `<svg viewBox="0 0 60 30" width="60" height="30" style="opacity:0.12">
            <path d="M8 24 Q8 14 18 14 Q20 4 30 6 Q38 0 44 8 Q54 6 54 16 Q60 18 56 24 Z" fill="${this._gold()}"/>
            <circle cx="18" cy="16" r="3" fill="${this._gold()}"/>
            <circle cx="44" cy="10" r="2.5" fill="${this._gold()}"/>
        </svg>`;
    },

    _gold() { return '#d4a853'; },
    _red() { return '#c41e1a'; },
    _redDark() { return '#a01815'; },
    _textLight() { return '#cccccc'; },
};
