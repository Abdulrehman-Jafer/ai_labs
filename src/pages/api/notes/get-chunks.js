import clientPromise from '../../../components/mongodb';

export default async function handler(req, res) {
    const { id } = req.query;
    const client = await clientPromise;
    const db = client.db("Notes");
    const docCollection = db.collection('DocData');
    const QAsCollection = db.collection('QAs');

    console.log('id:', id);
    try {
      const chunks = await docCollection.find({ noteid: id, type: 'document' }, { projection: {embedding: 0 } }).toArray();
      const QAsCount = await QAsCollection.countDocuments({ note_id: id });

      if(chunks.length==0){
        return res.status(400).json({ error: 'No chunks found' });
      }
      chunks[0].QAsCount = QAsCount;
      return res.status(200).json(chunks);
    } catch (error) {
      return res.status(500).json({ error: 'Unable to fetch segments' });
    }
  }