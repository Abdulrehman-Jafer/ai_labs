import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    console.log('Received request to save QA');
    // Extract query parameters from the request
    let { note_id, type, question, answer,force_update} = req.body;
  
    console.log('question:', question, 'answer: ', answer, 'force_update: ', force_update);
    // Check if the required query parameters are provided
    if (!note_id ) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }
    if (!type ) 
        type = 'youtube';
    console.log('note_id:', note_id, 'type:', type, 'question:', question, 'answer:', answer, 'force_update:', force_update);
  
    try {
        const client = await clientPromise;

        // Get the Bookmarks collection from the database
        const db = client.db("Notes");
        const qasCollection = db.collection('QAs');
        console.log('Connected to database. searching for note_id:', note_id );

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

        // construct a new QA string that combines the question and answer
        const qaString = 'question: '+ question + '\n\n' + 'answer: '+ answer;
        const existingQA = await qasCollection.findOne({q: question, note_id: note_id});

        const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

                
        if (!existingQA) {
            const embedding = await computeEmbedding(qaString);

            // If the QA object does not exist, insert it into the QAs collection along with the current timestamp in Unix format
            const insertResult = await qasCollection.insertOne({q: question, a: answer, embedding: embedding, type: type, note_id: note_id, timestamp: currentTimestampInSeconds});
            console.log('New QA object inserted into the QAs collection:', insertResult.insertedId);
        } else if(force_update){
            const embedding = await computeEmbedding(qaString);

            // If the QA object already exists, update the existing object with the new answer string
            const updateResult = await qasCollection.updateOne({_id: existingQA._id}, {$set: {a: answer, embedding: embedding, type: type, timestamp: currentTimestampInSeconds}});
            console.log('Existing QA object updated in the QAs collection:', updateResult.modifiedCount);
        }
        else{
            console.log('Existing QA object found in the QAs collection. Skipping update.');
        }

        // Return the data back to the frontend
        res.status(200).json({ message: 'QA updated successfully' });
    } catch (error) {
      // Handle any errors that occurred during the request
      console.error('Error calling api endpoint:', error);
      // return caught error to the frontend
      res.status(500).json({ error: error.message });
    }
  }