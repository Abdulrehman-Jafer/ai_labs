//api for updating youtube video insights and Q&As
import clientPromise from '../../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {    

            console.log('Received request to update YT chunk data');
            // Parse the POST body to get the parameters
            const { docid, data, type } = req.body;
            console.log(`Received docid: ${docid}, data: ${data}, type: ${type}`);
            if (!docid || !data || !type) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const client = await clientPromise;
            const db = client.db("Notes");
            const qas_collection = db.collection('QAs');

            if (type === 'question'){
                // Call the Flask API endpoint to compute embedding
                const resp = await fetch(`${process.env.NEXT_PRIVATE_BASE_URL}/get-embedding`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: data }) 
                });
                if (resp.ok) {
                    const embeddingData = await resp.json();
                    const embedding = embeddingData.content_embedding;

                    // Update the document with the new data
                    const result = await qas_collection.updateOne(
                        { _id: new ObjectId(docid) },
                        { $set: { q: data, embedding: embedding } }
                    );

                    if (result.modifiedCount === 0) {
                        return res.status(404).json({ error: 'No document has been updated' });
                    }

                    console.log('question data updated successfully');
                    // Return a success response
                    return res.status(200).json({ message: 'question data updated successfully' });
                } else {
                    return res.status(500).json({ error: 'Error computing embedding' });
                }
            }
            else if (type === 'answer'){
                // Update the document with the new data
                const result = await qas_collection.updateOne(
                    { _id: new ObjectId(docid) },
                    { $set: { a: data } }
                );

                if (result.modifiedCount === 0) {
                    return res.status(404).json({ error: 'No document has been updated' });
                }

                console.log('answer data updated successfully');
                // Return a success response
                return res.status(200).json({ message: 'answer data updated successfully' });
            }

        } catch (error) {
            console.error('Error updating QA data:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // Handle any methods other than POST
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}