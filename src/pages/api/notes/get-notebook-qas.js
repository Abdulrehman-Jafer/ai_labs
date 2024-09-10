import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Missing notebook ID' });
        }

        const client = await clientPromise;
        
        // Connect to the Notes database
        const db = client.db("Notes");
        const nbCollection = db.collection('Notebook');
        const qasCollection = db.collection('QAs');
        
        // Find the notebook with the given ID
        const notebook = await nbCollection.findOne({ _id: new ObjectId(id) });

        // If the notebook is not found, return a 404 error
        if (!notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        // If the notebook has a bookmarks field, fetch the corresponding QAs relating to these notes
        if (notebook.bookmarks) {
            const noteIds = Object.keys(notebook.bookmarks);
            console.log("noteIds: ", noteIds);

            const qasData = await qasCollection.find({ note_id: { $in: noteIds } }).project({ embedding: 0 }).toArray();
    
            if (!qasData || qasData.length === 0) {
                return res.status(404).json({ error: 'Questions and answers data not found for provided video ID' });
            }

            console.log("qasData: ", qasData);
    
            // 返回视频标题、描述和总结数据
            return res.status(200).json(qasData);
        }

        // Otherwise, return the notebook data with bookmarks included
        return res.status(500).json( {error: 'No notes found for this notebook'} );
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e });
    }
}