//api for updating youtube video insights and Q&As
import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {    

            console.log('Received request to update note summaries');
            // Parse the POST body to get the parameters
            const { noteid, summaries } = req.body;
            console.log(`Received noteid: ${noteid}, summaries: ${summaries}`);
            if (!noteid || !summaries) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const client = await clientPromise;
            const db = client.db("Notes");
            const doc_collection = db.collection('DocData');

            // Here you would typically perform operations with the summaries,
            // such as validating or processing them before updating the database.
            // For this example, let's assume summaries is an array of summary objects
            // and we want to update them all.

            const updatePromises = summaries.map(sum => {
                const summaryData = sum.data;
                const summary_json_string = JSON.stringify(summaryData);
                console.log(`Updating summary with string: ${summary_json_string}`);
                
                return doc_collection.updateOne(
                    { _id: new ObjectId(sum._id)},
                    { '$set': { data: summary_json_string } },
                    { upsert: true }
                );
            });

            // Execute all update operations in parallel
            await Promise.all(updatePromises);

            // Return a success response
            return res.status(200).json({ message: 'Summaries updated successfully' });
        } catch (error) {
            console.error('Error updating note summaries:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // Handle any methods other than POST
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}