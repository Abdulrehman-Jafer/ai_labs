// pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '../../../firebase/server'; 
import clientPromise from '../../../components/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).send('Missing form data');
    }

    await auth.createUser({
      email,
      password,
      displayName: name,
    });

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

    res.status(200).send({ status: 'success' });
  } catch (error: any) {
    if (error.errorInfo?.code === 'auth/email-already-exists') {
      res.status(400).send('Email already exists');
    } else {
      console.error('Error creating user:', error);
      res.status(500).send('Something went wrong');
    }
  }
}
