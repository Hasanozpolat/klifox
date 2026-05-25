window.App = window.App || {};
App.Config = App.Config || {};
App.Config.Errors = {
    AUTH_ERROR: { code: 401, message: "Kritik Kimlik Doğrulama Hatası (Token Geçersiz veya Süresi Dolmuş)", recovery: "Login sayfasına yönlendir" },
    RATE_LIMIT: { code: 429, message: "Aşırı İstek (Rate Limit) Aşıldı. Lütfen bekleyin.", recovery: "Kullanıcıya cooldown UI göster" },
    SERVICE_UNAVAILABLE: { code: 503, message: "Yapay Zeka veya Çekirdek Servis Geçici Olarak Kapalı", recovery: "İstekleri kuyruğa al (ChatPersistence)" },
    DISPATCH_TIMEOUT: { code: 408, message: "Otonom Eşleşme Zaman Aşımı. Bölgede uygun usta bulunamadı.", recovery: "Operatöre delege et" },
    AI_PROVIDER_FAIL: { code: 502, message: "Geri Besleme İstisnası: AI Sağlayıcısı Yanıt Vermiyor", recovery: "Fallback sağlayıcıya (Claude/Local) geç" },
    VALIDATION_FAIL: { code: 400, message: "Sözleşme Validasyon Hatası (Geçersiz Giriş Formati)", recovery: "Girdiği düzeltmesini iste" }
};
