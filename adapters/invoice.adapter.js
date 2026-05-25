App.Adapters.InvoiceEngine = {
    COMMISSION_RATE: 0.15, // 15% Platform Commission
    TAX_RATE: 0.20, // 20% VAT (KDV)

    calculateBreakdown(grossAmount) {
        const platformFee = grossAmount * this.COMMISSION_RATE;
        const subtotal = grossAmount - platformFee;
        const craftsmanNet = subtotal; // Gross - Commission
        const taxAmount = grossAmount * this.TAX_RATE;
        const totalToCharge = grossAmount + taxAmount;

        return {
            grossServiceAmount: grossAmount,
            platformFee,
            craftsmanNet,
            taxAmount,
            totalToCharge
        };
    },

    generateEscrowReceipt(transactionId, userParams, breakdown) {
        const receipt = {
            receiptId: 'REC-' + Date.now(),
            txId: transactionId,
            customerName: userParams.name,
            escrowLockDate: new Date().toISOString(),
            status: 'LOCKED',
            financials: breakdown
        };
        
        App.Logger.log(`[INVOICE] Emanet Kasa Makbuzu Oluşturuldu: ${receipt.receiptId}`, 'Finance');
        return receipt;
    },

    renderInvoiceUI(receipt) {
        const f = receipt.financials;
        return `
        <div class="invoice-slip" style="background:#0f172a; border:1px solid #1e293b; border-radius:12px; padding:20px; font-family:var(--font-mono); margin:10px 0;">
            <div style="text-align:center; border-bottom:1px dashed #334155; padding-bottom:15px; margin-bottom:15px;">
                <h3 style="color:#10b981; margin:0;"><i class="fas fa-file-invoice"></i> KliFox Emanet Makbuzu</h3>
                <span style="font-size:10px; color:#64748b;">Güvenli E-Sözleşme İşlemi</span>
            </div>
            <div style="font-size:0.85rem; color:#cbd5e1; display:flex; flex-direction:column; gap:6px;">
                <div style="display:flex; justify-content:space-between;"><span>Hizmet Tutarı:</span> <strong>${f.grossServiceAmount.toFixed(2)} ₺</strong></div>
                <div style="display:flex; justify-content:space-between; color:#94a3b8;"><span>Platform Hizmet Bedeli (%15):</span> <span>-${f.platformFee.toFixed(2)} ₺</span></div>
                <div style="display:flex; justify-content:space-between;"><span>Net Usta Hakedişi:</span> <strong style="color:#c084fc;">${f.craftsmanNet.toFixed(2)} ₺</strong></div>
                <div style="border-top:1px dashed #334155; margin:5px 0;"></div>
                <div style="display:flex; justify-content:space-between; color:#ef4444;"><span>KDV (%20):</span> <span>+${f.taxAmount.toFixed(2)} ₺</span></div>
                <div style="display:flex; justify-content:space-between; font-size:1rem; margin-top:5px;"><span>Toplam Çekilen:</span> <strong style="color:#fff;">${f.totalToCharge.toFixed(2)} ₺</strong></div>
            </div>
            <div style="margin-top:15px; text-align:center; background:rgba(16,185,129,0.1); padding:8px; border-radius:8px; display:flex; align-items:center; justify-content:center; gap:8px;">
                <i class="fas fa-lock text-success"></i> <span style="font-size:0.8rem; color:#10b981; font-weight:bold;">Tutar emanet hesaba bloke edildi.</span>
            </div>
        </div>`;
    }
};
