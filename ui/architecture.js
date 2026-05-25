App.UI.Architecture = {
    render() {
        const archContainer = document.getElementById('arch-graph-render');
        if (!archContainer) return;

        const html = `
        <div class="arch-layer">
            <div class="arch-title"><i class="fas fa-desktop"></i> FRONTEND UI (React/VanillaJS)</div>
            <div class="arch-box client-box">DOM Rendering (ui/dom.js) | Gamification UI | Socket Listeners</div>
        </div>

        <i class="fas fa-arrow-down arch-arrow"></i>

        <div class="arch-layer">
            <div class="arch-title"><i class="fas fa-server"></i> API GATEWAY (Node.js & Express)</div>
            <div class="arch-nodes">
                <div class="arch-box api-box">AUTH Adapter (JWT)</div>
                <div class="arch-box api-box">REST API (/api/v1/)</div>
                <div class="arch-box api-box">Socket.io WSS Server</div>
            </div>
        </div>

        <i class="fas fa-arrow-down arch-arrow"></i>

        <div class="arch-layer">
            <div class="arch-title"><i class="fas fa-cogs"></i> MICROSERVICES & WORKERS (engine/)</div>
            <div class="arch-nodes">
                <div class="arch-box sv-box">Dispatch Routing Core</div>
                <div class="arch-box sv-box">AI Provider Bridge</div>
                <div class="arch-box sv-box">Rule Engine & Risk Validation</div>
            </div>
        </div>

        <i class="fas fa-arrow-down arch-arrow"></i>

        <div class="arch-layer">
            <div class="arch-title"><i class="fas fa-database"></i> DATA LAYER (PostgreSQL & Redis)</div>
            <div class="arch-nodes">
                <div class="arch-box db-box">PgSQL (Users/Ledgers)</div>
                <div class="arch-box db-box">Redis (Session/Queue caching)</div>
            </div>
        </div>
        `;

        archContainer.innerHTML = html;
        document.getElementById('db-schema-output').textContent = App.Adapters.DB_Schema;
    }
};
