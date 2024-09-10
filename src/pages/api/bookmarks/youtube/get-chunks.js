import clientPromise from '../../../../components/mongodb';

export default async function handler(req, res) {
    const { vid_id } = req.query;
    const client = await clientPromise;
    const db = client.db("Notes");
    const docCollection = db.collection('DocData');
  
    try {
      const chunks = await docCollection.find({ vid_id: vid_id, type: 'transcript' }).toArray();
      res.status(200).json(chunks);
    } catch (error) {
      res.status(500).json({ error: 'Unable to fetch segments' });
    }
  }