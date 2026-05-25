App.Rules.Dispatch = {
    TIMEOUT_MS: 30000,
    MAX_RETRIES: 3,
    PRIORITY_WEIGHTS: {
        districtMatch: 0.3,
        rating: 0.5,
        responseSpeed: 0.2
    },
    EMERGENCY_CATEGORIES: ['akıtıyor', 'elektrik', 'tehlike', 'koku', 'kısa devre', 'yanık', 'acil'],
    
    isEmergency(text) {
        if(!text) return false;
        return this.EMERGENCY_CATEGORIES.some(w => text.toLowerCase().includes(w));
    },

    evaluateMatchScore(craftsman, userLocation, urgency) {
        let score = 0;
        if (craftsman.status !== 'online') return -1; 
        
        if (App.Config.PILOT && App.Config.PILOT.strictGeofence) {
            const allowed = App.Config.PILOT.regions.map(r => r.toLowerCase());
            const safeLoc = userLocation ? userLocation.toLowerCase() : '';
            const cLoc = (craftsman.region || craftsman.district || '').toLowerCase();
            
            // Allow if either user or craftsman matches pilot zone keyword loosely
            if (!allowed.some(a => safeLoc.includes(a)) && !allowed.some(a => cLoc.includes(a))) {
                App.Logger.log(`[GEOFENCE] ${userLocation} bölgesi için eşleştirme reddedildi (Pilot dışı)`, 'warning');
                return -1; // Block dispatch
            }
        }
        
        const cReg = (craftsman.region || craftsman.district || '').toLowerCase();
        const uLoc = (userLocation || '').toLowerCase();
        
        // Match logic: uLoc is "City, District". cReg is "City: District1, District2"
        // Simply check if both the city and the district from uLoc appear in cReg, or just do a substring check.
        // Actually since uLoc has city and district, we can extract district and check if cReg includes it.
        const parts = uLoc.split(',').map(p=>p.trim());
        const uCity = parts[0];
        const uDist = parts.length > 1 ? parts[1] : '';

        if (cReg.includes(uCity) && (cReg.includes(uDist) || cReg.includes('tüm bölgeler'))) {
            score += this.PRIORITY_WEIGHTS.districtMatch * 100;
        } else if (cReg === uLoc) {
            score += this.PRIORITY_WEIGHTS.districtMatch * 100;
        }

        score += craftsman.rating * 15;
        
        // Boost for craftsmen with higher reviews and partner endorsements
        if (craftsman.reviews > 10) score += 10;
        if (craftsman.partnerEndorsed) score += 25;

        if (craftsman.speed === 'Çok Hızlı') score += this.PRIORITY_WEIGHTS.responseSpeed * 100;
        else if (craftsman.speed === 'Hızlı') score += this.PRIORITY_WEIGHTS.responseSpeed * 50;

        // Severe penalty for assigning slow craftsmen to critical situations
        if ((urgency === 'CRITICAL' || urgency === 'EMERGENCY') && craftsman.speed === 'Yavaş') {
            score -= 150; 
        }

        return score;
    }
};
