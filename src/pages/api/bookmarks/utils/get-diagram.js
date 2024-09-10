import clientPromise from '../../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Extract query parameters from the request post body
        const { id, forceupdate, type } = req.body;
    
        console.log('id:', id);
        // Check if the required query parameters are provided
        if (!id) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }

        // get url from Notes.Bookmarks collection
        const client = await clientPromise;
        /*const userDb = client.db("Platformr");
        const usersCollection = userDb.collection('users');
        */
        const db = client.db("Notes");
        const bmCollection = db.collection('Bookmarks');        
        const bookmark = await bmCollection.findOne({_id: new ObjectId(id)}, {summary: 1, diagram: 1});

        if(bookmark){
            console.log('bookmark:', bookmark);
        }
        //extract summary from bookmark.summary by check if it begins with 'title:', if so,  splitting it with \n\n

        let summary = bookmark.summary;
        if(summary.startsWith('title:')){
            summary = summary.split('\n\n')[1];
        }

        if (!forceupdate && bookmark.diagram && bookmark.diagram.length > 0) {
            console.log('Returning cached diagram');
            return res.status(200).json({diagram: bookmark.diagram});
        }
        else if(summary){
            try {
                // Construct the URL for the local endpoint
                let apiUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/gen-diagram`;
    
                console.log('Calling local endpoint:', apiUrl);

                let dtype = type;
                if(!dtype){
                    dtype = 'flowchart';
                }
            
                const requestBody = JSON.stringify({ instructions: summary, type: dtype});
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
            
                // Parse the response from the Python endpoint into json object with an object called diagram
                const data = await response.json();
                const { diagram } = data;
                // extract diagramCode betweeen ``` and ```, and remove the beginning mermaid\n
                const diagramCode = diagram.split('```')[1].split('```')[0].replace('mermaid\n', '');
                console.log('diagramCode:', diagramCode);
                // Update the Bookmarks collection with the new diagram code
                //await bmCollection.updateOne({_id: new ObjectId(id)}, { $set: { diagram: diagramCode } });
                // Return the data back to the frontend
                return res.status(200).json({diagram: diagramCode});
            } catch (error) {
                // Handle any errors that occurred during the request
                console.error('Error calling api endpoint:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        }
    

    }

    return res.status(405).json({ message: 'Method not allowed' });    
}