App.Rules.Risk = {
    ANOMALY_THRESHOLDS: {
        excessiveReferrals: 20,
        abnormalInvoiceValue: 50000,
        fastServiceCompletionSecs: 15 // Usually service takes hours
    },

    evaluateTransaction(user, invoiceTotal, serviceTimeSecs) {
        let riskScore = 0;
        let flags = [];

        if (invoiceTotal > this.ANOMALY_THRESHOLDS.abnormalInvoiceValue) {
            riskScore += 40;
            flags.push("HIGH_INVOICE_VALUE");
        }

        if (serviceTimeSecs < this.ANOMALY_THRESHOLDS.fastServiceCompletionSecs) {
            riskScore += 65; 
            flags.push("SUSPICIOUS_SERVICE_COMPLETION_TIME");
        }

        if (user.referrals.invitedCount > this.ANOMALY_THRESHOLDS.excessiveReferrals) {
            riskScore += 15;
            flags.push("ABNORMAL_REFERRAL_RATE");
        }

        const trustScore = Math.max(0, 100 - riskScore);
        return {
            riskScore,
            trustScore,
            flags,
            actionRequired: riskScore >= 50
        };
    }
};
