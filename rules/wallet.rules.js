App.Rules.Wallet = {
    MAX_CREDIT_USAGE_PERCENTAGE: 0.50, // Users can only cover 50% of an invoice max via credits
    NON_WITHDRAWABLE: true,
    CREDIT_EXPIRATION_DAYS: 30,

    calculateUsableCredit(invoiceTotal, userBalance) {
        const allowedMax = invoiceTotal * this.MAX_CREDIT_USAGE_PERCENTAGE;
        return Math.min(allowedMax, userBalance);
    }
};
