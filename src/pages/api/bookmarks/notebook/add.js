import clientPromise from '../../../../components/mongodb';

export default async function handler(req, res) {
    try {
        let { title } = req.query;

        const {auth} = await import('../../../../firebase/server');
        const sessionCookie = req.cookies.session;
    
        if (!sessionCookie) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    
        const decodedCookie = await auth.verifySessionCookie(sessionCookie);
        const userRecord = await auth.getUser(decodedCookie.uid);
    
        if (!userRecord) {
            return res.status(401).json({ error: 'User record not found' });
        }
    
        // Use the user's email to retrieve data
        const userEmail = userRecord.email;
    
        // Check if the required parameters are present
        if (!title) {
            title = 'New Notebook';
        }

        const client = await clientPromise;

        // Get the Bookmarks collection from the database
        const db = client.db("Notes");
        const bmCollection = db.collection('Notebook');
        const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

        let notebook= {};
        notebook.title = title;
        notebook.bookmarks = {};
        notebook.notebooks = {};
        notebook.add_time = currentTimestampInSeconds;
        notebook.modified_time = currentTimestampInSeconds;
        notebook.user = userEmail;
        await bmCollection.insertOne(notebook);

        // Otherwise, return the notebook data
        res.status(200).json(notebook);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}