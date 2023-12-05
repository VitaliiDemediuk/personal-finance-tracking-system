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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const removeUserId = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectUsefull = (data: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, ...rest } = data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const cleanedData = Object.fromEntries(Object.entries(rest).filter(([key, value]) => value !== null));
        return cleanedData;
    };

    return Array.isArray(data) ? data.map(selectUsefull) : selectUsefull(data);
}

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
        response.json(removeUserId(categories));
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
            response.json(removeUserId(category));
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

        console.log(request.query);
        const { name, description } = request.body;
        const category = await prisma.category.create({
            data: { name, description, user_id: userId },
        });
        response.json(removeUserId(category));
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
    response.json(removeUserId(category));
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