App.Adapters.PaymentGateway = {
    // Abstraction Sandbox for iyzico, Stripe, Papara, Bank Transfer
    mode: 'SANDBOX', // PRODUCTION when real banking connects

    async processTransaction(amount, method = 'CREDIT_CARD', metadata = {}) {
        return new Promise((resolve, reject) => {
            App.Logger.log(`[PAYMENT] Gateway İsteği: ${amount} TL, Method: ${method}`, 'Finance');
            
            // Sandbox Mode Simulation
            setTimeout(() => {
                if (method === 'ERROR_MOCK' || amount < 0) {
                    App.Logger.error('Ödeme Reddedildi (Sandbox)', 'Finance', { reason: 'Insufficient funds or fraud flag' });
                    return reject({ status: 'FAILED', reason: 'Bakiye yetersiz veya şüpheli işlem' });
                }

                if (method === 'TIMEOUT_MOCK') {
                    App.Logger.error('Ödeme Zaman Aşımı', 'Finance', { reason: 'Gateway timeout' });
                    return reject({ status: 'TIMEOUT', reason: 'Banka yanıt vermedi' });
                }
                
                // Success Simulation
                const txId = 'TX-' + crypto.randomUUID().substr(0,10).toUpperCase();
                resolve({
                    status: 'SUCCESS',
                    transactionId: txId,
                    amount: amount,
                    method: method,
                    timestamp: new Date().toISOString(),
                    escrowLocked: true
                });
                
            }, 1500); // UI Friction/Loading Simulation
        });
    },

    async processRefund(transactionId, amount, reason) {
        return new Promise((resolve) => {
            App.Logger.log(`[REFUND] İade İsteği Başlatıldı. TX: ${transactionId}`, 'Finance');
            setTimeout(() => {
                resolve({ status: 'REFUNDED', amount, transactionId });
            }, 1000);
        });
    }
};
