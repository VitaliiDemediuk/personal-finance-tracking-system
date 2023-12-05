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

const typesInt: {[key: string]: number} = {
    expense: 0,
    income: 1,
};

const getTypeString = (typeInt: number) => {
    const typesStr: { [key: number]: string } = {
        0: 'expense',
        1: 'income',
    };
    return typesStr[typeInt] || 'unknown';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatApiResponse = (data: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatObject = (obj: any) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { user_id, type, amount, ...rest } = obj;
        return Object.fromEntries(
            Object.entries({ ...rest, type: getTypeString(type), amount: amount / 100 })
                .filter(([_, value]) => value !== null)
        );
    };

    return Array.isArray(data) ? data.map(formatObject) : formatObject(data);
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

////// Category Routes /////////////////////////////////

const categoryRouter = express.Router();

// GET: Read all categories
categoryRouter.get('/all', checkJwt, async (request, response) => {
    try {
        const userId = getUserId(request.auth);

        const categories = await prisma.category.findMany( {where: { user_id: userId }});
        response.json(formatApiResponse(categories));
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
        const userId = getUserId(request.auth);

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
    const userId = getUserId(request.auth);

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

//////////// Transaction Routes //////////////////////////////
const transactionRouter = express.Router();

transactionRouter.get('/all', checkJwt, async (request, response) => {
    try {
        const userId = getUserId(request.auth);

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
        const userId = getUserId(request.auth);

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
        const userId = getUserId(request.auth);

        const { amount, type, description, categoryId } = request.body;
        const convertedType = typesInt[type];
        if (convertedType === undefined) {
            return response.status(400).send('Invalid transaction type');
        }

        // Fetch the category to validate the type
        const category = await prisma.category.findUnique({
            where: { id: categoryId, user_id: userId }
        });

        if (!category || category.type !== convertedType) {
            return response.status(400).send('Transaction type does not match category type');
        }

        const transaction = await prisma.transaction.create({
            data: {
                amount: Math.round(parseFloat(amount) * 100),
                type: convertedType,
                date: new Date(), // Set the current date
                description,
                categoryId,
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
        const userId = getUserId(request.auth);

        const id = parseInt(request.params.id);
        const { amount, description, categoryId } = request.body;

        // Fetch the existing transaction and category to validate the type
        const existingTransaction = await prisma.transaction.findUnique({
            where: { id, user_id: userId }
        });

        if (!existingTransaction) {
            return response.status(404).send('Transaction not found');
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId, user_id: userId }
        });

        if (!category || category.type !== existingTransaction.type) {
            return response.status(400).send('Transaction type does not match category type');
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


app.use('/category', categoryRouter);
app.use('/transaction', transactionRouter);

app.listen(port, () => console.log(`Running on port ${port}`))