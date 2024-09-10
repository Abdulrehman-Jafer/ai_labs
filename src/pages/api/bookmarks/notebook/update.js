
import clientPromise from '../../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Only allow PUT method
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Connect to the MongoDB client
        const client = await clientPromise;
        const db = client.db("Notes");

        // Get the notebookId and newTitle from the request body
        const { notebookId, newTitle } = req.body;

        console.log("Notebook ID: {notebookId}, New Title: {newTitle}");

        // Check if the notebookId is provided and valid
        if (!notebookId || !ObjectId.isValid(notebookId)) {
            return res.status(400).json({ error: 'Invalid or missing notebook ID' });
        }

        // Check if the new title is provided
        if (!newTitle) {
            return res.status(400).json({ error: 'New title is missing' });
        }

        // Convert the notebookId from a string to an ObjectId for MongoDB
        const id = new ObjectId(notebookId);

        // Update the notebook's title in the collection
        const result = await db.collection('Notebook').updateOne(
            { _id: id },
            { $set: { title: newTitle } }
        );

        // If no notebook was updated, return a 404 error
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        // Return a success message
        res.status(200).json({ message: 'Notebook title updated successfully' });
    } catch (e) {
        // Handle any errors that occur during the process
        res.status(500).json({ error: e.message });
    }
}