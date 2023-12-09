import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

import { checkJwt } from '../utils/auth_middleware.js';
import { typesInt } from "../utils/transaction_type_utils.js";
import { handleError, extractUserIdFromAuthInfo, formatApiResponse } from "../utils/request_handler_utils.js";

const prisma = new PrismaClient();

export const categoryRouter = Router();

// GET: Read all categories
categoryRouter.get('/all', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const categories = await prisma.category.findMany( {where: { user_id: userId }});
        response.json(formatApiResponse(categories));
    } catch (error) {
        handleError(error, response);
    }
});
      
// GET: Read a single category by ID
categoryRouter.get('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        const category = await prisma.category.findUnique({
            where: { id, user_id: userId },
        });
        if (category) {
            response.json(formatApiResponse(category));
        } else {
            response.status(404).send('Category not found');
        }
    } catch (error) {
        handleError(error, response);
    }
});

// POST: Create a new category
categoryRouter.post('', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const { name, description, type } = request.body;
        // Convert type string to its corresponding integer
        const convertedType = typesInt[type];
        if (convertedType === undefined) {
            return response.status(400).send('Invalid category type');
        }

        const category = await prisma.category.create({
            data: { name, description, type: convertedType, user_id: userId },
        });
        response.json(formatApiResponse(category));
    } catch (error) {
        handleError(error, response);
    }
});


// PUT: Update a category
categoryRouter.put('/:id', checkJwt, async (request, response) => {
try {
    const userId = extractUserIdFromAuthInfo(request.auth);

    const id = parseInt(request.params.id);
    const { name, description } = request.body;
    const category = await prisma.category.update({
        where: { id, user_id: userId },
        data: { name, description },
    });
    response.json(formatApiResponse(category));
} catch (error) {
    handleError(error, response);
}
});

// DELETE: Delete a category
categoryRouter.delete('/:id', checkJwt, async (request, response) => {
    try {
        const userId = extractUserIdFromAuthInfo(request.auth);

        const id = parseInt(request.params.id);
        await prisma.category.delete({
            where: { id: id, user_id: userId },
        });
        response.send();
    } catch (error) {
        handleError(error, response);
    }
});