
const paymentStatus = {
    PENDING: "PENDING",
    DECLINED: "DECLINED",
    RETURNED: "RETURNED",
    SETTLING: "SETTLING",
    WAIVED: "WAIVED",
    DEFERRED: "DEFERRED",
    AMENDED: "AMENDED",
    PAID: "PAID"
}

const phase = {
    PRE_ACH: "ACH_FILE_CREATED",
    POST_ACH: "POST_ACH"
}

module.exports = {
    
    attributes: {
        paymentId: {
            model: 'Payment'
        },
        paymentmanagement: {
            model: 'PaymentManagement'
        },
        user: {
            model: 'User'
        },
        transaction: {
            model: 'Transaction'
        },
        amount: {
            type: "float"
        },
        scheduledDate: {
            type: "date"
        },
        paymentStatus: {
            type: "string"
        }
    },
};
