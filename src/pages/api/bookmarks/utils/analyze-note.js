import clientPromise from '../../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Extract query parameters from the request post body
        const { id } = req.body;
    
        console.log('id:', id);
        // Check if the required query parameters are provided
        if (!id ) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }

        // get url from Notes.Bookmarks collection
        const client = await clientPromise;
        /*const userDb = client.db("Platformr");
        const usersCollection = userDb.collection('users');
        */
        const db = client.db("Notes");
        const bmCollection = db.collection('Bookmarks');
        const docCollection = db.collection('DocData');
        
        const bookmark = await bmCollection.findOne({_id: new ObjectId(id)}, {url: 1});

        const url = bookmark.url;
        console.log('url:', url);

        if(url){
            // this is a website note
            // call local endpoint to analyze website
            try {
                // Construct the URL for the local endpoint
                let apiUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/analyze-website`;
                /*if(type === 'youtube'){
                    apiUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/get-youtube-info`;
                }*/
    
                console.log('Calling local endpoint:', apiUrl);
            
                const requestBody = JSON.stringify({ id: id, url: url});
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: requestBody,
                });
    
                // Check if the local endpoint responded with an error
                if (!response.ok) {
                    // Forward the error response from the Python endpoint
                    return res.status(response.status).json({ error: await response.text() });
                }
            
                const chunks = await docCollection.find({ noteid: id, type: 'document' }, { projection: {embedding: 0 } }).toArray();
                // Return the data back to the frontend
                return res.status(200).json(chunks);
            } catch (error) {
                // Handle any errors that occurred during the request
                console.error('Error calling api endpoint:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }
    

    }

    return res.status(405).json({ message: 'Method not allowed' });    
}