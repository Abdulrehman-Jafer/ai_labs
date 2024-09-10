import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    // Extract query parameters from the request
    const { note_id} = req.query;
  
    // Check if the required query parameters are provided
    if (!note_id ) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }
  
    try {
        const client = await clientPromise;

        // Get the Bookmarks collection from the database
        const db = client.db("Notes");
        const bmCollection = db.collection('Bookmarks');        
        const ytProcessedCollection = db.collection('YoutubeProcessedData');
        const qasCollection = db.collection('QAs');
        const docCollection = db.collection('DocData');

        console.log('Connected to database. searching for note_id:', note_id );

        // load data from bookmarks collection
        const bookmark = await bmCollection.findOne({_id: new ObjectId(note_id)});

        if(!bookmark)
            return res.status(404).json({ error: 'Note not found' });

        //console.log('Found note:', bookmark.title);
        // check if source is youtube.com
        if (bookmark.source === 'youtube.com') {
            // extract video_id from the url that may contain other parameters after the /watch?v=
            const video_id = bookmark.url.split('/watch?v=')[1].split('&')[0];
            //console.log('Extracted video_id:', video_id);

            const metaData = await docCollection.findOne({ vid_id: video_id, type: 'meta-data' });
            if(!metaData)
                return res.status(404).json({ error: 'Meta data not found' });
            const metaDataText = metaData ? metaData.data : '';
            const titleMatch = metaDataText.match(/title: (.*)\ndescription: /s);
            const descriptionMatch = metaDataText.match(/description: ([\s\S]*)/);
            const title = titleMatch ? titleMatch[1].trim() : 'No Title';
            const description = descriptionMatch ? descriptionMatch[1].trim() : 'No Description';        
            
            // get all summaries for the video_id from youtubeProcessed collection
            const sums = await ytProcessedCollection.find({vid_id: video_id, type: 'summary'}).toArray();
            console.log('Found summaries for the video:', sums.length);
            if(sums.length === 0)
                return res.status(404).json({ error: 'No summaries found' });

            const summaries = sums
                .map(doc => ({ start: doc.start, starts: doc.starts?doc.starts:[], title: doc.title, summary: doc.data }));
    
            // 返回视频标题、描述和总结数据
            return res.status(200).json({
                vid_id: video_id,
                title,
                description, 
                summaries 
            });            
        }
        else{
            //this is a text note
            let description = ''; 
            if(bookmark.summary){
                // split the summary into two parts using \n\n and assign the second part to summary
                const summaryParts = bookmark.summary.split('\n\n');
                if(summaryParts.length > 1){
                    // the description is the second part of the summary, including all content after the first \n\n
                    description = summaryParts.slice(1).join('\n\n').trim();
                }
            }
            const sums = await docCollection.find({ noteid: note_id, type: 'summary' }).toArray();
            console.log('Found summaries for the note:', sums.length);
            if(sums.length === 0)
                return res.status(404).json({ error: 'No summaries found' });

            const chunks = await docCollection.find({ noteid: note_id, type: 'document' }, { projection: {embedding: 0 } }).toArray();
            if(chunks.length === 0)
                return res.status(404).json({ error: 'No chunks found' });
            
            console.log('Found chunks for the note:', chunks.length);

            const content = chunks.map(chunk => chunk.data).join('\n\n');

            const summaries = sums
                .map(doc => ({ noteid: note_id, summary: doc.data }));
    

            // 返回视频标题、描述和总结数据
            return res.status(200).json({
                noteid: note_id,
                title: bookmark.title,
                url: bookmark.url,
                content, 
                description, 
                summaries
            });              

        }
  
        // Return the data back to the frontend
        return res.status(200).json({ message: 'data loaded successfully' });
    } catch (error) {
        // Handle any errors that occurred during the request
        console.error('Error calling api endpoint:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
  }