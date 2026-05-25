window.App = window.App || {};
App.API_Contracts = App.API_Contracts || {};
App.API_Contracts.Models = {
    Users: {
        fields: {
            id: "UUID (Primary Key)",
            role: "ENUM ('customer', 'craftsman', 'operator', 'partner', 'admin')",
            name: "String",
            phone: "String (Unique, Indexed)",
            created_at: "Timestamp",
            status: "ENUM ('online', 'offline', 'banned')"
        },
        relations: {
            "Wallets": "1:1",
            "Referrals": "1:N (as referrer)",
            "Services": "1:N (as requester)"
        }
    },
    Wallets: {
        fields: {
            id: "UUID",
            user_id: "UUID (Foreign Key)",
            balance: "Decimal",
            currency: "String (TRY)",
            tier: "String ('standard', 'premium', 'vip')"
        },
        relations: { "Users": "BelongsTo" }
    },
    Services: {
        fields: {
            id: "UUID",
            customer_id: "UUID (Foreign Key)",
            craftsman_id: "UUID (Foreign Key, Nullable)",
            status: "ENUM ('pending', 'matched', 'in_progress', 'completed', 'escalated')",
            category: "String",
            urgency: "ENUM('low', 'normal', 'critical')",
            price: "Decimal",
            created_at: "Timestamp"
        },
        relations: { "Users": "BelongsTo (Customer & Craftsman)" }
    },
    Escalations: {
        fields: {
            id: "UUID",
            service_id: "UUID",
            operator_id: "UUID",
            trigger_reason: "String (eg. AI_SENTIMENT_NEGATIVE)",
            resolution: "String"
        },
        relations: { "Services": "1:1", "Users": "BelongsTo (Operator)" }
    }
};
