import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const { id, type, noteid } = req.query;

        // Check if the required parameters are present
        
        if (!type) {
            return res.status(400).json({ error: 'Missing note type' });
        }
        if (!noteid) {
            return res.status(400).json({ error: 'Missing note ID' });
        }

        const client = await clientPromise;

        // Get the Bookmarks collection from the database
        const db = client.db("Notes");
        const bmCollection = db.collection('Notebook');
        const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

        let notebook= {}, bookmarks = {}, notebooks = {};
        if (id) {
            // Find the notebook with the given ID
            notebook = await bmCollection.findOne({ _id: new ObjectId(id) });
            // If the notebook is not found, return a 404 error
            if (!notebook || notebook==null) {
                return res.status(404).json({ error: 'Notebook not found' });
            }
        }
                
        if (type == 'bookmark') {
            // Initialize bookmarks as an empty object if it doesn't exist
            bookmarks = notebook.bookmarks || {};
        
            // Add the noteid to the bookmarks associative array
            // This will automatically prevent duplicates since keys are unique
            bookmarks[noteid] = true;
            // Update the notebook with the new bookmarks associative array
            notebook.bookmarks = bookmarks;
            console.log("inserted bookmark, now notebook:", notebook);
        }
        else if (type == 'notebook') {
            // initialize notebooks as an empty array if it doesn't exist
            notebooks = notebook.notebooks || [];

            //addthe noteid to the notebooks assoociative array
            notebooks[noteid] = true;
            //update the notebook with the new notebooks associative array
            notebook.notebooks = notebooks;
            console.log("inserted notebook, now notebook:", notebook);
        }
        if(id){
            notebook.modified_time = currentTimestampInSeconds;
            //update the notebook with the new notebooks associative array
            await bmCollection.updateOne({ _id: new ObjectId(id) }, { $set: notebook });
        }
        else{
            notebook.add_time = currentTimestampInSeconds;            
            await bmCollection.insertOne(notebook);
        }

        // Otherwise, return the notebook data
        res.status(200).json(notebook);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}