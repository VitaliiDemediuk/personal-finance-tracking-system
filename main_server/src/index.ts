import express from 'express'
import { Response } from 'express';
import bodyParser from 'body-parser'

import cors from 'cors'
import { auth, AuthResult } from 'express-oauth2-jwt-bearer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express()
app.use(cors())
app.use(bodyParser.json())

const port = 8081

const categoryTypesInt: { [key: string]: number} = {
    expense: 0,
    income: 1,
};

const getTypeString = (typeInt: number) => {
    const categoryTypesStr: { [key: number]: string } = {
        0: 'expense',
        1: 'income',
    };
    return categoryTypesStr[typeInt] || 'unknown';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cleanData = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleanObject = (obj: any) => {
        // Remove userId and convert type
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, type, ...rest } = obj;
        const cleanedData = { ...rest, type: getTypeString(type) };

        // Remove null values
        return Object.fromEntries(
            Object.entries(cleanedData).filter(([_, value]) => value !== null)
        );
    };

    // Check if the data is an array and apply cleanObject to each element
    return Array.isArray(data) ? data.map(cleanObject) : cleanObject(data);
};



const getUserId = (auth: AuthResult | undefined) => {
    if (auth === undefined) {
        throw new Error('Auth is undefined');
    }

    const sub = auth.payload.sub;
    if (sub === undefined) {
        throw new Error('Sub is undefined');
    }

    return sub as string;
};

const handleError = (error: unknown, response: Response) => {
    if (error instanceof Error) {
        response.status(500).send(error.message);
        
    } else {
        response.status(500).send('An unknown error occurred');
    }
  };

const checkJwt = auth({
    audience: 'pfts_main_back_end',
    issuerBaseURL: `https://dev-sc26458w7gubcp3e.us.auth0.com/`,
});

const categoryRouter = express.Router();

// GET: Read all categories
categoryRouter.get('/all', checkJwt, async (request, response) => {
    try {
        const userId = getUserId(request.auth);

        const categories = await prisma.category.findMany( {where: { user_id: userId }});
        response.json(cleanData(categories));
    } catch (error) {
        handleError(error, response);
    }
});
      
// GET: Read a single category by ID
categoryRouter.get('/:id', checkJwt, async (request, response) => {
    try {
        const userId = getUserId(request.auth);

        const id = parseInt(request.params.id);
        const category = await prisma.category.findUnique({
            where: { id, user_id: userId },
        });
        if (category) {
            response.json(cleanData(category));
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
        const userId = getUserId(request.auth);

        const { name, description, type } = request.body;
        // Convert type string to its corresponding integer
        const typeInt = categoryTypesInt[type];
        if (typeInt === undefined) {
            return response.status(400).send('Invalid category type');
        }

        const category = await prisma.category.create({
            data: { name, description, type: typeInt, user_id: userId },
        });
        response.json(cleanData(category));
    } catch (error) {
        handleError(error, response);
    }
});


// PUT: Update a category
categoryRouter.put('/:id', checkJwt, async (request, response) => {
try {
    const userId = getUserId(request.auth);

    const id = parseInt(request.params.id);
    const { name, description } = request.body;
    const category = await prisma.category.update({
        where: { id, user_id: userId },
        data: { name, description },
    });
    response.json(cleanData(category));
} catch (error) {
    handleError(error, response);
}
});

// DELETE: Delete a category
categoryRouter.delete('/:id', checkJwt, async (request, response) => {
    try {
        const userId = getUserId(request.auth);

        const id = parseInt(request.params.id);
        await prisma.category.delete({
            where: { id: id, user_id: userId },
        });
        response.send();
    } catch (error) {
        handleError(error, response);
    }
});

app.use('/category', categoryRouter);

app.listen(port, () => console.log(`Running on port ${port}`))