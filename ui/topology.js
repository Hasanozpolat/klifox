App.UI.Topology = {
    realMetrics: null,
    inited: false,

    render() {
        if (!this.inited) {
            if (App.Adapters.EventBus) {
                App.Adapters.EventBus.on('metrics.server', (m) => {
                    this.realMetrics = m;
                    this.updateQueueMetrics();
                });
            }
            this.inited = true;
        }

        const target = document.getElementById('topology-render-target');
        if(!target || !App.Engine.Orchestrator) return;
        
        let html = `
            <div class="enterprise-header" style="margin-bottom:20px; border-bottom: 1px solid rgba(59, 130, 246, 0.2); padding-bottom: 10px;">
                <h2 style="color: ${App.Config.SIMULATION_MODE ? '#3b82f6' : '#10b981'};"><i class="fas fa-network-wired"></i> ${App.Config.SIMULATION_MODE ? 'Backend Simulation (Offline)' : 'Backend Active (Real Node.js)'}</h2>
                <p style="color: #94a3b8; font-size: 0.9rem;">Distributed Microservices & Orchestration</p>
            </div>
            
            ${this.realMetrics && !App.Config.SIMULATION_MODE ? `
            <div style="background:rgba(16, 185, 129, 0.1); border:1px solid rgba(16, 185, 129, 0.3); border-radius:8px; padding:15px; margin-bottom:20px; display:flex; gap:20px;">
                <div><span style="color:#a1a1aa; font-size:0.8rem;">Live Nodes</span><br><strong style="color:#34d399; font-size:1.2rem;">${this.realMetrics.users}</strong></div>
                <div><span style="color:#a1a1aa; font-size:0.8rem;">Sockets/Sec</span><br><strong style="color:#34d399; font-size:1.2rem;">${this.realMetrics.mps}</strong></div>
                <div><span style="color:#a1a1aa; font-size:0.8rem;">Active Rooms</span><br><strong style="color:#34d399; font-size:1.2rem;">${this.realMetrics.rooms}</strong></div>
            </div>` : ''}

            <div style="display:flex; gap:20px; margin-bottom: 20px; flex-wrap:wrap;">
        `;
        
        // --- QUEUE METRICS ---
        html += `<div style="flex:1; background:rgba(0,0,0,0.3); border:1px solid #1e293b; border-radius:8px; padding:15px; min-width:250px;">
            <h3 style="color:#60a5fa; font-size:1rem; margin-bottom:10px;"><i class="fas fa-layer-group"></i> Broker Queues</h3>`;
            
        Object.entries(App.Engine.Queues.queues).forEach(([name, arr]) => {
            let color = name==='critical' ? '#ef4444' : (name==='standard' ? '#10b981' : (name==='delayed' ? '#f59e0b' : '#6b7280'));
            html += `<div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #1e293b; padding-bottom:3px;">
                <span style="color:#cbd5e1; font-size:0.85rem; text-transform:uppercase;">${name} Q</span>
                <strong style="color:${color}; font-size:0.9rem;">${arr.length} pending</strong>
            </div>`;
        });
        
        html += `<div style="margin-top:10px; font-size:0.8rem; color:#94a3b8;">
            Total Proc: <span style="color:#10b981;">${App.Engine.Queues.stats.processed}</span> |
            Retries: <span style="color:#f59e0b;">${App.Engine.Queues.stats.retried}</span> |
            DLQ/Fails: <span style="color:#ef4444;">${App.Engine.Queues.stats.failed}</span>
        </div></div>`;

        // --- WORKER CLUSTERS ---
        html += `<div style="flex:2; background:rgba(0,0,0,0.3); border:1px solid #1e293b; border-radius:8px; padding:15px; min-width:400px;">
            <h3 style="color:#c084fc; font-size:1rem; margin-bottom:10px;"><i class="fas fa-server"></i> Distributed Worker Cluster</h3>
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">
        `;

        App.Engine.Workers.registry.forEach(w => {
            let statusColor = w.status === 'idle' ? '#10b981' : (w.status === 'busy' ? '#f59e0b' : '#ef4444');
            let statusAnim = w.status === 'busy' ? 'pulse-icon' : '';
            html += `
                <div style="background:#0f172a; border:1px solid ${statusColor}; border-radius:6px; padding:10px; text-align:center;">
                    <i class="fas ${w.type==='AI' ? 'fa-brain' : (w.type==='DISPATCH' ? 'fa-satellite-dish' : 'fa-wallet')} ${statusAnim}" style="color:${statusColor}; font-size:1.5rem; margin-bottom:5px;"></i>
                    <div style="font-size:0.75rem; color:#cbd5e1; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${w.id}</div>
                    <div style="font-size:0.7rem; color:#64748b; margin-bottom:5px;">[${w.cluster}]</div>
                    <div style="font-size:0.75rem; background:rgba(0,0,0,0.5); padding:2px; border-radius:4px; color:${statusColor};">${w.status.toUpperCase()}</div>
                    <div style="font-size:0.7rem; color:#94a3b8; margin-top:5px;">Jobs: ${w.jobs} | Up: ${Math.floor(w.uptime)}s</div>
                </div>
            `;
        });
        
        html += `</div></div></div>`;
        target.innerHTML = html;
    },

    updateQueueMetrics() {
        if(document.getElementById('view-topology') && document.getElementById('view-topology').classList.contains('active')) {
             this.render();
        }
    }
};
