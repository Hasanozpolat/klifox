App.UI.ApiDocs = {
    render() {
        const target = document.getElementById('api-docs-render-target');
        if(!target) return;

        let html = `
            <div class="enterprise-header" style="margin-bottom:20px; border-bottom: 1px solid rgba(16, 185, 129, 0.2); padding-bottom: 10px;">
                <h2 style="color: #10b981;"><i class="fas fa-file-code"></i> Developer API Contracts</h2>
                <p style="color: #a1a1aa; font-size: 0.9rem;">v1 Backend Specification & WebSocket Reference</p>
            </div>
        `;

        // 1. REST ENDPOINTS
        html += `<h3 style="color: #6ee7b7; margin-top:20px;"><i class="fas fa-server"></i> REST Endpoints</h3><div class="api-grid" style="display:flex; flex-direction:column; gap:10px; margin-top:10px;">`;
        App.API_Contracts.Endpoints_V1.forEach(ep => {
            const methodColor = ep.method === 'GET' ? '#3b82f6' : (ep.method === 'POST' ? '#10b981' : '#f59e0b');
            html += `
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #27272a; padding: 15px; border-radius: 8px;">
                    <div style="display:flex; align-items:center; gap:10px; margin-bottom: 8px;">
                        <span style="background: ${methodColor}; color:black; padding: 2px 8px; border-radius: 4px; font-weight:bold; font-size: 0.8rem;">${ep.method}</span>
                        <code style="color: #f4f4f5; font-size: 1rem;">${ep.path}</code>
                        <span style="color:#71717a; font-size:0.8rem; margin-left:auto;">${ep.group}</span>
                    </div>
                    <p style="color: #a1a1aa; font-size: 0.9rem; margin-bottom:10px;">${ep.description}</p>
                    ${ep.body ? `<div style="margin-bottom:5px;"><strong style="color:#d4d4d8; font-size:0.85rem;">Body:</strong> <pre style="background:#18181b; padding:8px; border-radius:4px; font-size:0.8rem; color:#a1a1aa;">${JSON.stringify(ep.body)}</pre></div>` : ''}
                    <div style="margin-bottom:5px;"><strong style="color:#d4d4d8; font-size:0.85rem;">Response:</strong> <pre style="background:#18181b; padding:8px; border-radius:4px; font-size:0.8rem; color:#a1a1aa;">${JSON.stringify(ep.response)}</pre></div>
                </div>
            `;
        });
        html += `</div>`;

        // 2. SOCKET EVENTS
        const ws = App.API_Contracts.SocketEvents;
        html += `<h3 style="color: #8b5cf6; margin-top:30px;"><i class="fas fa-bolt"></i> WebSocket Architecture</h3>
                 <div style="background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); padding: 15px; border-radius: 8px; margin-top:10px;">`;
        html += `<h4 style="color: #d8b4fe; margin-bottom: 5px; font-size:0.9rem;">Server -> Client (Listeners)</h4> <ul style="color:#a1a1aa; font-size:0.85rem; margin-bottom:15px; padding-left:20px;">`;
        ws.ServerToClient.forEach(e => { html += `<li><strong style="color:#fff;">${e.event}</strong>: <code style="color:#8b5cf6;">${JSON.stringify(e.payload)}</code></li>`; });
        html += `</ul>`;
        
        html += `<h4 style="color: #d8b4fe; margin-bottom: 5px; font-size:0.9rem;">Client -> Server (Emitters)</h4> <ul style="color:#a1a1aa; font-size:0.85rem; padding-left:20px;">`;
        ws.ClientToServer.forEach(e => { html += `<li><strong style="color:#fff;">${e.event}</strong>: <code style="color:#8b5cf6;">${JSON.stringify(e.payload)}</code></li>`; });
        html += `</ul></div>`;

        // 3. AI STREAMING
        html += `<h3 style="color: #ec4899; margin-top:30px;"><i class="fas fa-brain"></i> AI Streaming Strategy</h3>
                 <div style="background: rgba(236, 72, 153, 0.05); border: 1px solid rgba(236, 72, 153, 0.2); padding: 15px; border-radius: 8px; margin-top:10px;">
                    <p style="color:#a1a1aa; font-size: 0.85rem; margin-bottom:10px;">The AI orchestrator sends deltas to prevent UI blocking. Fallbacks are triggered seamlessly.</p>
                    <pre style="background:#18181b; padding:10px; border-radius:4px; font-size:0.8rem; color:#ec4899;">
START: ${ws.AI_Streaming.start.event} -> ${JSON.stringify(ws.AI_Streaming.start.payload)}
CHUNK: ${ws.AI_Streaming.chunk.event} -> ${JSON.stringify(ws.AI_Streaming.chunk.payload)}
END:   ${ws.AI_Streaming.end.event} -> ${JSON.stringify(ws.AI_Streaming.end.payload)}
                    </pre>
                 </div>`;

        target.innerHTML = html;
    }
};
