import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())

const port = 8080

import { auth } from 'express-oauth2-jwt-bearer';

const checkJwt = auth({
  audience: 'pfts_main_back_end',
  issuerBaseURL: `https://dev-sc26458w7gubcp3e.us.auth0.com/`,
});

app.get('/public', (request, response) => {
    response.send('Hello world!')
})

app.get('/private', checkJwt, (request, response) => {
    response.send('Hello world!')
})

app.listen(port, () => console.log(`Running on port ${port}`))