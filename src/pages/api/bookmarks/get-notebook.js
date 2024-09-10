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
        const bmCollection = db.collection('Bookmarks');

        // Find the notebook with the given ID
        const notebook = await nbCollection.findOne({ _id: new ObjectId(id) });

        // If the notebook is not found, return a 404 error
        if (!notebook) {
            return res.status(404).json({ error: 'Notebook not found' });
        }

        // If the notebook has a bookmarks field, fetch the corresponding bookmarks
        if (notebook.bookmarks) {
            const bookmarkIds = Object.keys(notebook.bookmarks).map(noteid => new ObjectId(noteid));
            console.log("bookmarkIds: ", bookmarkIds);
            const bookmarkOrder = Object.assign({}, notebook.bookmarks);
            // Fetch the corresponding bookmarks without the 'embedding' field
            const bookmarks = await bmCollection.find(
                { _id: { $in: bookmarkIds } },
                { projection: { embedding: 0 } }
              ).toArray();
            // Sort the bookmarks based on the order
            const sortedBookmarks = Object.keys(bookmarkOrder)
                .sort((a, b) => bookmarkOrder[a] - bookmarkOrder[b])
                .map(id => bookmarks.find(bm => bm._id.toString() === id));
            console.log("bookmark order:", sortedBookmarks);

            notebook.bookmarks = sortedBookmarks;
        }
        //if the notebook has a notebooks field, fetch the corresponding notebooks
        if (notebook.notebooks) {
            const notebookIds = Object.keys(notebook.notebooks).map(notebookid => new ObjectId(notebookid));
            // Fetch the corresponding notebooks
            const notebooks = await nbCollection.find(
                { _id: { $in: notebookIds } },
            ).toArray();
            notebook.notebooks = notebooks;
        }

        // Otherwise, return the notebook data with bookmarks included
        return res.status(200).json(notebook);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e });
    }
}