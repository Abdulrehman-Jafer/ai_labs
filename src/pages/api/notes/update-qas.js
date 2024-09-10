import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Extract query parameters from the request
    const { note_id, force_update} = req.query;
  
    // Check if the required query parameters are provided
    if (!note_id ) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }
  
    try {

        const client = await clientPromise;

        // Get the Bookmarks collection from the database
        const db = client.db("Notes");
        const bmCollection = db.collection('Bookmarks');        
        const ytProcessedCollection = db.collection('YoutubeProcessedData');
        const docCollection = db.collection('DocData');
        const qasCollection = db.collection('QAs');
        console.log('Connected to database. searching for note_id:', note_id );

        // load data from bookmarks collection
        const bookmark = await bmCollection.findOne({_id: new ObjectId(note_id)});

        if(!bookmark)
            return res.status(404).json({ error: 'Note not found' });

        console.log('Found note:', bookmark.title);
        // check if source is youtube.com
        let summaries = [];
        // Extract and process summaries
        if (bookmark.source === 'youtube.com') {
            console.log('Processing QAs for youtube video:', bookmark.title);
            // extract video_id from the url that may contain other parameters after the /watch?v=
            const video_id = bookmark.url.split('/watch?v=')[1].split('&')[0];
            console.log('Extracted video_id:', video_id);
            // get all summaries for the video_id from youtubeProcessed collection
            // Find summaries for the video
            summaries = await ytProcessedCollection.find({vid_id: video_id, type: 'summary'}).toArray();
            console.log('Found summaries for the video:', summaries.length);
        }
        else{
            console.log('Processing QAs for youtube video:', bookmark.title);
            // Find summaries for the note
            summaries = await docCollection.find({noteid: note_id, type: 'summary'}).toArray();
            console.log('Found summaries for the note:', summaries.length);
        }

        // Function to compute embedding
        async function computeEmbedding(content) {
            const response = await fetch(`${process.env.NEXT_PRIVATE_BASE_URL}/get-embedding`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content }) 
            });
            if (!response.ok) {
                throw new Error('Failed to compute embedding');
            }
            const data = await response.json();
            return data.content_embedding;
        }        

        for (const summary of summaries) {
            const data = JSON.parse(summary.data);
            const qas = data.qaPairs;

            for (const qaPairs of qas) {
                const existingQA = await qasCollection.findOne({q: qaPairs.Q, note_id: note_id});
                const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

                const qaString = 'question: '+ qaPairs.Q + '\n\n' + 'answer: '+ qaPairs.A;

                if (!existingQA) {
                    const embedding = await computeEmbedding(qaString);
                    await qasCollection.insertOne({
                        q: qaPairs.Q, a: qaPairs.A, embedding: embedding, type: 'document', note_id: note_id, timestamp: currentTimestampInSeconds
                    });
                    console.log('New QA inserted for question:', qaPairs.Q);
                } else if (force_update && existingQA.a !== qaPairs.A) {
                    const embedding = await computeEmbedding(qaString);
                    await qasCollection.updateOne({_id: existingQA._id}, {
                        $set: {a: qaPairs.A, embedding: embedding, timestamp: currentTimestampInSeconds}
                    });
                    console.log('Existing QA updated for question:', qaPairs.Q);
                } else {
                    console.log('No update needed for question:', qaPairs.Q);
                }
            }
        }
  
        // Return the data back to the frontend
        return res.status(200).json({ message: 'QAs updated successfully' });
    } catch (error) {
      // Handle any errors that occurred during the request
      console.error('Error calling api endpoint:', error);
      return res.status(500).json({ error: error.message });
    }
  }