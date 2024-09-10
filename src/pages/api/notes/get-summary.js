import clientPromise from '../../../components/mongodb';

export default async function handler(req, res) {
    const { id } = req.query;
    const client = await clientPromise;
    const db = client.db("Notes");
    const docCollection = db.collection('DocData');
  
    try {
      const summary = await docCollection.find({ noteid: id, type: 'summary' }, { projection: {embedding: 0 } }).toArray();
      return res.status(200).json({summaries: summary});
    } catch (error) {
      return res.status(500).json({ error: 'Unable to fetch segments' });
    }
  }