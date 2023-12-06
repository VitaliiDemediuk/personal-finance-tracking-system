import { auth } from 'express-oauth2-jwt-bearer';

export const checkJwt = auth({
    audience: 'pfts_main_back_end',
    issuerBaseURL: `https://dev-sc26458w7gubcp3e.us.auth0.com/`,
});