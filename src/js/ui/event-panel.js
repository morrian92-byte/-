// 事件面板 UI

const EventPanel = {
    selectedOptionIndex: -1,

    showEvent(event) {
        EventSystem.currentEvent = event;
        this.selectedOptionIndex = -1;

        document.getElementById('event-title').textContent =
            (event.category === '危机' ? '⚡ ' : '') + event.title;
        document.getElementById('event-body').textContent = event.body;

        const optionsDiv = document.getElementById('event-options');
        optionsDiv.innerHTML = event.options.map((opt, i) => {
            const locked = opt.needConn && ResourceSystem.connections < opt.needConn;
            const cls = locked ? 'event-option locked' : 'event-option';
            const lockText = locked
                ? `<div class="risk">⚠ 需要人脉 ≥ ${opt.needConn}（当前 ${ResourceSystem.connections}）</div>`
                : '';
            const riskText = opt.risk > 0
                ? `<div class="risk">风险：${'★'.repeat(opt.risk)}${'☆'.repeat(4-opt.risk)}</div>`
                : '';
            const effectsText = opt.effects
                ? Object.entries(opt.effects).filter(([,v]) => typeof v === 'number').map(([k,v]) => {
                    const sign = v > 0 ? '+' : '';
                    const label = { perf:'政绩', conn:'人脉', budget:'财力' }[k] || k;
                    return `${label} ${sign}${v}`;
                }).join(' · ')
                    + (opt.effects.npcEffects ? ` · 影响${Object.keys(opt.effects.npcEffects).length}人` : '')
                : '';

            return `<div class="${cls}" onclick="EventPanel.selectOption(${i})" data-index="${i}">
                ${opt.label}
                <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">${effectsText}</div>
                ${riskText}${lockText}
            </div>`;
        }).join('');

        document.getElementById('btn-confirm-choice').disabled = true;
        document.getElementById('event-modal').classList.remove('hidden');
    },

    selectOption(index) {
        const event = EventSystem.currentEvent;
        if (!event) return;
        const opt = event.options[index];
        if (opt.needConn && ResourceSystem.connections < opt.needConn) return;

        // Deselect all, select this
        document.querySelectorAll('.event-option').forEach(el => el.classList.remove('selected'));
        const selected = document.querySelector(`.event-option[data-index="${index}"]`);
        if (selected) selected.classList.add('selected');

        this.selectedOptionIndex = index;
        document.getElementById('btn-confirm-choice').disabled = false;
    },

    confirmChoice() {
        try {
        if (this.selectedOptionIndex < 0) return;
        const event = EventSystem.currentEvent;
        if (!event) return;

        // Find event in pending list
        const pendingEvent = EventSystem.pendingEvents.find(e => e.id === event.id);
        if (!pendingEvent) {
            EventSystem.pendingEvents.push(event);
        }

        const result = EventSystem.resolveEvent(event.id, this.selectedOptionIndex);

        document.getElementById('event-modal').classList.add('hidden');
        EventSystem.currentEvent = null;
        this.selectedOptionIndex = -1;

        // 处理事件不消耗行动点
        Dashboard.refresh();

        // If no more pending events and was in crisis, resume
        if (EventSystem.pendingEvents.length === 0 && TimeSystem.state === 'CRISIS_PAUSED') {
            TimeSystem.resumeFromCrisis();
            Dashboard.refresh();
        }
        } catch(err) {
            alert('[事件处理出错] ' + err.message);
            document.getElementById('event-modal').classList.add('hidden');
        }
    },

    showNextPending() {
        if (EventSystem.pendingEvents.length > 0) {
            this.showEvent(EventSystem.pendingEvents[0]);

            // Enter crisis mode for 危机 category
            if (EventSystem.pendingEvents[0].category === '危机') {
                TimeSystem.pauseForCrisis();
                Dashboard.refresh();
            }
        }
    },
};
