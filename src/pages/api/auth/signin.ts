import { serialize } from 'cookie';
import { auth } from '../../../firebase/server'; // Adjust the path as needed
import clientPromise from '../../../components/mongodb';

export default async function signin(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end('Method not allowed');
    }
    
    try {
        const { idToken, email } = req.body;
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // Set session expiration as needed

        // Check if the user with the provided email exists in the "users" collection
        const client = await clientPromise;
        const db = client.db('Platformr');
        const collection = db.collection('users');
        const existingUser = await collection.findOne({ email });

        if (!existingUser) {
            // If the user doesn't exist, create this user in the db
            await collection.insertOne({
                email,
                timestamp: Date.now(),
            });
        }

        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
        
        // Serialize the cookie
        const cookie = serialize('session', sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            path: '/',
        });

        // Set the cookie in the response header
        res.setHeader('Set-Cookie', cookie);
        res.status(200).send({ status: 'success' });
    } catch (error) {
        console.error('Failed to create session:', error);
        res.status(500).send({ error: 'Internal server error: '+error });
    }
}
