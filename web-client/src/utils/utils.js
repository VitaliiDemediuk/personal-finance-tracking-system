// utils/auth.js or a similar file

import { useAuth0 } from '@auth0/auth0-vue';

export const getUri = (urn) => {
    return `http://localhost:8081${urn}`;
}

export const getAuthHeader = async () => {
    const { getAccessTokenSilently } = useAuth0();

    try {
        const token = await getAccessTokenSilently();
        return {
            Authorization: `Bearer ${token}`
        };
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error; // You might want to handle this error differently
    }
};