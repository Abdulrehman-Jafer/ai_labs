import clientPromise from '../../../components/mongodb';

export default async function handler(req, res) {
    //if (req.method === 'POST') {
        try {
            //const { user, secretKey } = req.body;      
            // Pagination parameters
            const page = parseInt(req.query.page, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10) || 10;
            const skip = (page - 1) * pageSize;

            const client = await clientPromise;
            /*const userDb = client.db("Platformr");
            const usersCollection = userDb.collection('users');
            */
            const db = client.db("Notes");
            const bookmarksCollection = db.collection('Bookmarks');
            let query = {featured: true}; // Query object to find featured bookmarks

            const sortOptions = { add_time: -1 }; // Sort by add_time in descending order

            let bookmarks;
            const total = await bookmarksCollection.countDocuments(query);
            const notes = await bookmarksCollection.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(pageSize)
                .toArray();
    
            // If no videos are found, return an empty array
            if (!notes.length) {
                return res.status(404).json({ error: 'No featured notes were found' });
            }
    
            // Map through the documents to format the response
            const formattedNotes = notes.map(note => ({
                _id: note._id,
                title: note.title,
                title_slug: note.title_slug,
                url: note.url,
                thumbnail: note.thumbnail,
                summary: note.summary
                // Add any other fields you need for the frontend display
            }));
            //console.log("formattedNotes: ", formattedNotes)
    
            // Return the paginated YouTube video data
            return res.status(200).json({
                data: formattedNotes,
                page,
                pageSize,
                total
            });                      
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    
    //}

    return res.status(405).json({ message: 'Method not allowed' });

}
