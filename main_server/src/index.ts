import express from 'express'
import bodyParser from 'body-parser'

import cors from 'cors'

import { categoryRouter } from './request_handlers/category_request_handlers.js';
import { transactionRouter } from './request_handlers/transaction_request_handlers.js';
import { reportRouter } from './request_handlers/report_request_handlers.js';

const app = express()
app.use(cors())
app.use(bodyParser.json())

const port = 8081

app.use('/category', categoryRouter);
app.use('/transaction', transactionRouter);
app.use('/report', reportRouter);

app.listen(port, () => console.log(`Running on port ${port}`))