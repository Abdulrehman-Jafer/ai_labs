import clientPromise from '../../../../components/mongodb';

export default async function handler(req, res) {
    const { vid_id } = req.query;
    const client = await clientPromise;
    const db = client.db("Notes");
    const ytProcessedCollection = db.collection('YoutubeProcessedData');
  
    try {
      const segments = await ytProcessedCollection.find({ vid_id: vid_id, type: 'segment' }).toArray();
      res.status(200).json(segments);
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch segments' });
    }
  }