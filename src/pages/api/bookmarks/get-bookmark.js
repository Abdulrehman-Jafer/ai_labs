import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const { id } = req.query;

        if (!id) {
            return res.status(400).json({ error: 'Missing bookmark ID' });
        }

        const client = await clientPromise;
        
        // Get the Bookmarks collection from the database
        const db = client.db("Notes");
        const bmCollection = db.collection('Bookmarks');
        const QAsCollection = db.collection('QAs');

        // Find the bookmark with the given ID
        const bookmark = await bmCollection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 0, embedding: 0 } });
        const QAsCount = await QAsCollection.countDocuments({ note_id: id });

        bookmark.QAsCount = QAsCount;

        // If the bookmark is not found, return a 404 error
        if (!bookmark) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        // Otherwise, return the bookmark data
        return res.status(200).json(bookmark);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
}