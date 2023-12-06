import { Response } from 'express';
import { AuthResult } from 'express-oauth2-jwt-bearer';
import { getTypeString } from './transaction_type_utils.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const formatApiResponse = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatObject = (obj: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, type, amount, ...rest } = obj;
        return Object.fromEntries(
            Object.entries({ ...rest, type: getTypeString(type), amount: amount / 100})
                .filter(([_, value]) => !Number.isNaN(value) && value !== null)
        );
    };

    return Array.isArray(data) ? data.map(formatObject) : formatObject(data);
};

export const aggregateTransactionsByCategory = (transactions: Array<any>, transactionType: string) => {
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


export const getUserId = (auth: AuthResult | undefined) => {
    if (auth === undefined) {
        throw new Error('Auth is undefined');
    }

    const sub = auth.payload.sub;
    if (sub === undefined) {
        throw new Error('Sub is undefined');
    }

    return sub as string;
};

export const handleError = (error: unknown, response: Response) => {
    if (error instanceof Error) {
        response.status(500).send(error.message);
        
    } else {
        response.status(500).send('An unknown error occurred');
    }
  };