import express from 'express';
import request from 'supertest';
import { expect } from 'chai';
import { describe, it, before } from 'mocha';

import { categoryRouter } from '../src/request_handlers/category_request_handlers.js';
// Import other necessary modules and routers

const app = express();
app.use(express.json());
app.use('/category', categoryRouter);

interface Auth0Response {
    access_token: string;
}

describe('Integration Tests', () => {

    let accessToken: string;

    before(async () => {
        // Obtain the access token from Auth0
        const response = await fetch('https://dev-sc26458w7gubcp3e.us.auth0.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.TEST_AUTH0_CLIENT_ID,
                client_secret: process.env.TEST_AUTH0_CLIENT_SECRET,
                audience: process.env.TEST_AUTH0_AUDIENCE,
                grant_type: "client_credentials"
            })
        });

        const data = await response.json() as Auth0Response;
        accessToken = data.access_token;
    });

    describe('Protected request handlers through authorization middleware', () => {
        it('Should reject unauthorized access to a protected route', async () => {
            const res = await request(app).get('/category/all');
            expect(res.status).to.equal(401); // Assuming 401 for unauthorized
        });

        it('should allow access to a protected route with valid token', async () => {
            const res = await request(app)
                .get('/category/all')
                .set('Authorization', `Bearer ${accessToken}`);
            
            expect(res.status).to.equal(200);  // Assuming 200 for successful access
        });
    });
});