import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { checkJwt } from '../utils/auth_middleware.js';
import { typesInt } from "../utils/transaction_type_utils.js";
import { handleError, extractUserIdFromAuthInfo, formatApiResponse } from "../utils/request_handler_utils.js";

const prisma = new PrismaClient();

export const transactionRouter = Router();

transactionRouter.get('/all', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const transactions = await prisma.transaction.findMany({
            where: { user_id: userId }
        });
        response.json(formatApiResponse(transactions));
    } catch (error) {
        handleError(error, response);
    }
});

transactionRouter.get('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        const transaction = await prisma.transaction.findUnique({
            where: { id, user_id: userId },
        });
        if (transaction) {
            response.json(formatApiResponse(transaction));
        } else {
            response.status(404).send('Transaction not found');
        }
    } catch (error) {
        handleError(error, response);
    }
});

transactionRouter.post('', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const { amount, type, description, categoryId } = request.body;
        const convertedType = typesInt[type];
        if (convertedType === undefined) {
            return response.status(400).send('Invalid transaction type');
        }

        // Fetch the category to validate the type only if categoryId is provided
        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: categoryId, user_id: userId }
            });

            if (!category || category.type !== convertedType) {
                return response.status(400).send('Transaction type does not match category type');
            }
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: Math.round(parseFloat(amount) * 100),
                type: convertedType,
                date: new Date(), // Set the current date
                description,
                categoryId: categoryId || null, // Allow null categoryId
                user_id: userId
            },
        });
        response.json(formatApiResponse(transaction));
    } catch (error) {
        handleError(error, response);
    }
});

transactionRouter.put('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        const { amount, description, categoryId } = request.body;

        // Fetch the existing transaction and category to validate the type
        const existingTransaction = await prisma.transaction.findUnique({
            where: { id, user_id: userId }
        });

        if (!existingTransaction) {
            return response.status(404).send('Transaction not found');
        }

        if (categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: categoryId, user_id: userId }
            });

            if (!category || category.type !== existingTransaction.type) {
                return response.status(400).send('Transaction type does not match category type');
            }
        }

        const transaction = await prisma.transaction.update({
            where: { id, user_id: userId },
            data: {
                amount: Math.round(parseFloat(amount) * 100),
                description,
                categoryId
                // Date is not included here, so it will not be updated
            },
        });
        response.json(formatApiResponse(transaction));
    } catch (error) {
        handleError(error, response);
    }
});

transactionRouter.delete('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        await prisma.transaction.delete({
            where: { id: id, user_id: userId },
        });
        response.send();
    } catch (error) {
        handleError(error, response);
    }
});