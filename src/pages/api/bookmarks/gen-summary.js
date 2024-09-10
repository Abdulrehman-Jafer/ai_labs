//api for updating youtube video insights and Q&As
import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {    
            // Parse the POST body to get the parameters
            const { id } = req.body;
            console.log(`Received id: ${id}`);
            if (!id) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // Call the Flask API endpoint to compute embedding
            const resp = await fetch(`${process.env.NEXT_PRIVATE_BASE_URL}/get-overall-summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: id }) 
            });
            if (resp.ok) {
                const data = await resp.json();
                // Return a summary data 
                return res.status(200).json(data);
            } else {
                const data = await resp.json();
                return res.status(500).json(data);
            }
        } catch (error) {
            console.error('Error updating summary:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // Handle any methods other than POST
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}