//api for updating youtube video insights and Q&As
import clientPromise from '../../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {    

            console.log('Received request to update YT summaries');
            // Parse the POST body to get the parameters
            const { video_id, summaries } = req.body;
            console.log(`Received video_id: ${video_id}, summaries: ${summaries}`);
            if (!video_id || !summaries) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            const client = await clientPromise;
            const db = client.db("Notes");
            const processed_collection = db.collection('YoutubeProcessedData');

            // Here you would typically perform operations with the summaries,
            // such as validating or processing them before updating the database.
            // For this example, let's assume summaries is an array of summary objects
            // and we want to update them all.

            const updatePromises = summaries.map(sum => {
                const { start, starts, title, summary: summaryData } = sum;
                const summary_json_string = JSON.stringify(summaryData);
                console.log(`Updating summary at start: ${start}\n with string: ${summary_json_string}`);
                
                return processed_collection.updateOne(
                    { vid_id: video_id, type: 'summary', start: { '$eq': start } },
                    { '$set': { starts: starts, title: title, data: summary_json_string } },
                    { upsert: true }
                );
            });

            // Execute all update operations in parallel
            await Promise.all(updatePromises);

            // Return a success response
            return res.status(200).json({ message: 'Summaries updated successfully' });
        } catch (error) {
            console.error('Error updating YT summaries:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        // Handle any methods other than POST
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}