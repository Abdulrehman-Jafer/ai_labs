import clientPromise from '../../../components/mongodb';

export default async function handler(req, res) {
    //if (req.method === 'POST') {
        try {
            //const { user, secretKey } = req.body;      
            const { start, limit, cat, title, source } = req.query;
            const startIdx = parseInt(start) || 0; // Parse start index from query parameter or default to 0
            const limitCount = parseInt(limit) || 20; // Parse limit count from query parameter or default to 10

            const {auth} = await import('../../../firebase/server');
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
            console.log("userEmail:", userEmail);
            if(!userEmail){
                return res.status(401).json({ error: 'User id not found' });
            }
            let query = {$or: [{user: userEmail}, {referencedBy: userEmail}]}; // Query object to find bookmarks

            const client = await clientPromise;
            /*const userDb = client.db("Platformr");
            const usersCollection = userDb.collection('users');
            */
            const db = client.db("Notes");
            const bmCollection = db.collection('Bookmarks');
            if(cat){ // If category is provided in query parameter, add it to the query object
                query = {...query, category: cat};
            }
            //if title is defined, add it to the query object
            if(title != "undefined" && title){
                // add title to query object if provided in query parameter
                const pattern = new RegExp("\\b" + title.split(/\s+/).join("\\b.*\\b") + "\\b");

                query = {...query, title: {$regex: pattern, $options: 'i'}};
            }
            if(source != "undefined" && source){
                // add source to query object if provided in query parameter
                query = {...query, url: {$regex: source, $options: 'i'}};
            }
            //console.log("query:", query);

            const sortOptions = { add_time: -1 }; // Sort by add_time in descending order

            let bookmarks;
            if(startIdx == -1){ // If start index is -1, return all bookmarks with just _ids for counting the total number of bookmarks
                bookmarks = await bmCollection.find(query).project({_id: 1}).toArray();
            }
            else{
                console.log("query:", query);
                if(limitCount == -1){ // If limit count is -1, return all bookmarks starting from the start index
                    bookmarks = await bmCollection.find(query).sort(sortOptions).project({embedding: 0}).skip(startIdx).toArray();
                }
                else{
                    bookmarks = await bmCollection.find(query).sort(sortOptions).project({embedding: 0}).skip(startIdx).limit(limitCount).toArray();
                }
            }
            return res.status(200).json(bookmarks);
                      
            // Find the user with the provided email and secret key
            /*const query = {"email": user, "secretKey": secretKey};
            //const found_user = await usersCollection.findOne(query);
        
            if (found_user) {
                // If authentication passes, fetch filenames associated with the email
                const query = {"email": user, "filename": name};
                let bookmarks;
                if(startIdx == -1){ // If start index is -1, return all bookmarks with just _ids for counting the total number of bookmarks
                    bookmarks = await bmCollection.find({}).project({_id: 1,}).toArray();
                }
                else{
                    if(limitCount == -1){ // If limit count is -1, return all bookmarks starting from the start index
                        bookmarks = await bmCollection.find({}).project({embedding: 0}).skip(startIdx).toArray();
                    }
                    bookmarks = await bmCollection.find({}).project({embedding: 0}).skip(startIdx).limit(limitCount).toArray();
                }

                res.status(200).json(bookmarks);
                */
            /*}
            else{
                return res.status(401).json({ message: 'Authentication failed' });            
            } 
            */           
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    
    //}

    return res.status(405).json({ message: 'Method not allowed' });

}
