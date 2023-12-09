import { getTypeString } from "../utils/transaction_type_utils.js";

export const aggregateTransactionsByCategory = (transactionType: string) => (transactions: Array<any>) => {
    return transactions.reduce((acc, transaction) => {
        // Filter transactions by the specified type
        if (getTypeString(transaction.type) !== transactionType) {
            return acc;
        }

        // Handle null or undefined categoryId as 'Uncategorized'
        const categoryId = transaction.categoryId || 'Uncategorized';

        if (!acc[categoryId]) {
            acc[categoryId] = { totalAmount: 0, count: 0};
        }
        acc[categoryId].totalAmount += transaction.amount / 100;
        acc[categoryId].count += 1;

        return acc;
    }, {});
};