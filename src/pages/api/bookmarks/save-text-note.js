import { is } from 'immutable';
import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';
import { parse } from 'url';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { id, bookmark, updateSummary } = req.body;

            const client = await clientPromise;
            const db = client.db("Notes");
            const bmCollection = db.collection('Bookmarks');

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


            const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
            // check if the bookmark has a url
            if(bookmark.title){
                // check if the url already exists in the database
                // return only the _id field and user field to check if it exists
                const existingBookmark = await bmCollection.findOne({ _id: new ObjectId(id) }, { projection: { _id: 1, user: 1, referencedBy: 1 } });
                let isOwner = true;
                if(existingBookmark && existingBookmark.user!== userEmail ){
                    isOwner = false;
                }
                bookmark.source = "text_note";
                console.log("bookmark category", bookmark.category);
                if(updateSummary && isOwner){
                    // summary has been updated, recompute embedding and update it in the database
                    // TODO: implement this logic
                    console.log("Summary has been updated, recomputing embedding and updating it in the database");
    
                    // Call the Flask API endpoint to compute embedding
                    const response = await fetch(`${process.env.NEXT_PRIVATE_BASE_URL}/get-embedding`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ content: bookmark.summary })
                    });
                    if (response.ok) {
                        const embeddingData = await response.json();
                        bookmark.embedding = embeddingData.content_embedding;
                        console.log("embedding computed successfully");
                    }
                    else{
                        console.log("Error while computing embedding");
                    }
                    
                }          

                if(existingBookmark ){ //the bookmark already exists 
                    if(isOwner){
                        console.log("existing bookmark found, is owner, updating the bookmark. category", bookmark.category);
                        //update the existing bookmark with the new data
                        const result = await bmCollection.findOneAndUpdate(
                            { _id: existingBookmark._id },
                            { 
                                $set: {
                                    note_text: bookmark.note_text,
                                    title: bookmark.title,
                                    category: bookmark.category,
                                    summary: bookmark.summary,
                                    source: bookmark.source,
                                    featured: bookmark.featured,
                                    ...(updateSummary && { embedding: bookmark.embedding }),  // if summary has been updated, update embedding, otherwise keep the same
                                    keywords: bookmark.keywords,
                                    modified_time: currentTimestampInSeconds
                                }
                            },
                            { returnOriginal: false }
                        );
                        if (result.value) {
                            return res.status(200).json(result.value);
                        } else {
                            return res.status(404).json({ error: 'Bookmark not found' });
                        }
                    }
                    else{
                        // if the referencedBy field does not exist, then create one and add the userEmail to it
                        if(!existingBookmark.referencedBy){
                            const result = await bmCollection.updateOne(
                                { _id: new ObjectId(existingBookmark._id) },
                                { $set: { referencedBy: [userEmail] } }
                            );
                            return res.status(200).json(result.value);
                        }
                        // if the referencedBy field exists, add the userEmail to the referencedBy field array if it is not already there
                        else if(!existingBookmark.referencedBy.includes(userEmail)){
                            const resp =await bmCollection.updateOne(
                                { _id: existingBookmark._id },
                                { $addToSet: { referencedBy: userEmail } }
                            );
                            return res.status(200).json(resp.value);
                        }
                        else{
                            return res.status(403).json({ error: 'This bookmark is created by someone else, you cannot modify this bookmark' });
                        }
                    }
                } else {
                    // no existing bookmark found
                    // Save bookmark as new document, assign the current user as the owner
                    const result = await bmCollection.insertOne({
                        note_text: bookmark.note_text,
                        title: bookmark.title,                    
                        category: bookmark.category,
                        summary: bookmark.summary,
                        featured: bookmark.featured,
                        ...(updateSummary && { embedding: bookmark.embedding }),  // if summary has been updated, update embedding, otherwise keep the same
                        keywords: bookmark.keywords,
                        source: bookmark.source,
                        user: userEmail,
                        add_time: currentTimestampInSeconds,
                        modified_time: currentTimestampInSeconds
                    });
                    return res.status(201).json(result.value);
                }
            }
            else{
                return res.status(400).json({ error: 'Bookmark URL is required' });
            }

        } catch (e) {
            console.error('Error:', e);
            return res.status(500).json({ error: e.message });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });        
    }
}

function extractRootDomain(url) {
    const parsedUrl = parse(url);
    if (parsedUrl.hostname) {
      const parts = parsedUrl.hostname.split('.');
      if (parts.length > 1) {
        return parts[parts.length - 2] + '.' + parts[parts.length - 1];
      } else {
        return parts[0];
      }
    } else {
      return null;
    }
  }