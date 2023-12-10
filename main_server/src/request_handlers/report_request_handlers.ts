import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { checkJwt } from '../utils/auth_middleware.js';
import { typesInt, getTypeString } from "../utils/transaction_type_utils.js";
import { handleError, extractUserIdFromAuthInfo, formatApiResponse } from "../utils/request_handler_utils.js";
import { aggregateTransactionsByCategory } from "../algorithms/aggregate_transactions_by_category.js";

const prisma = new PrismaClient();

export const reportRouter = Router();

reportRouter.get('/all', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const reports = await prisma.report.findMany({
            where: { user_id: userId }
        });
        response.json(formatApiResponse(reports));
    } catch (error) {
        handleError(error, response);
    }
});

reportRouter.get('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        const report = await prisma.report.findUnique({
            where: { id, user_id: userId },
        });

        if (report) {
            response.json(formatApiResponse(report));
        } else {
            response.status(404).send('Report not found');
        }
    } catch (error) {
        handleError(error, response);
    }
});

reportRouter.post('', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);
        const { name, periodStart, periodEnd, type } = request.body;

        const convertedType = typesInt[type];
        if (convertedType === undefined) {
            return response.status(400).send('Invalid transaction type');
        }

        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        if (startDate > endDate) {
            return response.status(400).send('periodStart must be less than or equal to periodEnd');
        }

        const report = await prisma.report.create({
            data: {
                name,
                createdOn: new Date(), // Automatically set the creation date
                periodStart: startDate,
                periodEnd: endDate,
                type: convertedType,
                user_id: userId,
            },
        });
        response.json(formatApiResponse(report));
    } catch (error) {
        handleError(error, response);
    }
});

reportRouter.put('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        const { name, periodStart, periodEnd, type } = request.body;

        const convertedType = typesInt[type];
        if (convertedType === undefined) {
            return response.status(400).send('Invalid transaction type');
        }

        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        if (startDate > endDate) {
            return response.status(400).send('periodStart must be less than or equal to periodEnd');
        }

        const report = await prisma.report.update({
            where: { id, user_id: userId },
            data: {
                name,
                periodStart: startDate,
                periodEnd: endDate,
                type: convertedType,
            },
        });
        response.json(formatApiResponse(report));
    } catch (error) {
        handleError(error, response);
    }
});

reportRouter.delete('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        await prisma.report.delete({
            where: { id: id, user_id: userId },
        });
        response.send();
    } catch (error) {
        handleError(error, response);
    }
});

reportRouter.get('/build/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);
        const reportId = parseInt(request.params.id);

        // Fetch the report details
        const report = await prisma.report.findUnique({
            where: {
                id: reportId,
                user_id: userId,
            },
        });

        if (!report) {
            return response.status(404).send('Report not found');
        }

        // Fetch transactions that match the report criteria
        const transactions = await prisma.transaction.findMany({
            where: {
                user_id: userId,
                date: {
                    gte: report.periodStart,
                    lte: report.periodEnd,
                },
            }
        });
        
        const mappedTransactions = transactions.map(transaction => ({ 
            ...transaction, 
            type: getTypeString(transaction.type),
        }));

        // Aggregate the transactions by category
        const aggregatedData = aggregateTransactionsByCategory(getTypeString(report.type))(mappedTransactions);


        response.json(aggregatedData);
    } catch (error) {
        handleError(error, response);
    }
});