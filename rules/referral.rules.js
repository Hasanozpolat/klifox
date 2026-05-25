App.Rules.Referral = {
    REWARD_AMOUNT: 750,
    PENDING_DURATION_HOURS: 48,
    REQUIREMENTS: {
        minInvoiceTotal: 1000,
        abuseScoreMax: 30
    },

    isEligibleForReward(invoiceTotal, trustScore) {
        // Must be a legitimate invoice size and a highly trusted interaction
        return invoiceTotal >= this.REQUIREMENTS.minInvoiceTotal && trustScore >= (100 - this.REQUIREMENTS.abuseScoreMax);
    }
};
