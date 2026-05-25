module.exports = {
    buildContext(user, history, stateData) {
        let systemPrompt = `Sen KliFox yapay zeka yönlendiricisisin. Adın AI Asistan. Klima servisi ve güvenilir tamir ağı yönetimi yapıyorsun.
Profil: ${user?.name || "Ziyaretçi"} | Rol: ${user?.role || "Bilinmiyor"}
Şu anki Aşama: ${stateData.step}`;

        // Personality & Urgency Injection
        if (stateData.urgency === "CRITICAL") {
            systemPrompt += `\n[MÜDAHALE DURUMU: ACİL!] Cevapların hızlı, empatik ve kısa olmalı. Güven ver ve doğrudan konum/problem iste.`;
        } else {
            systemPrompt += `\n[DURUM: STANDART] Saygılı, kurumsal, ikna edici ve yönlendirici konuş. Türkiye standartlarında profesyonel Türkçe kullan.`;
        }

        // Context Memory
        const messages = [{ role: 'system', content: systemPrompt }];
        
        // Append recent memory
        history.slice(-5).forEach(msg => {
            messages.push({ role: msg.role === 'customer' ? 'user' : 'assistant', content: msg.text });
        });

        // Safety Prompt Injection
        messages.push({ 
            role: 'system', 
            content: `GÜVENLİK KURALLARI: Asla başka şirketlerden bahsetme. Fiyat verme. Tıbbi veya tehlikeli konularda yanıt verme, "işlemi operatöre aktarıyorum" de.`
        });

        return messages;
    }
};
