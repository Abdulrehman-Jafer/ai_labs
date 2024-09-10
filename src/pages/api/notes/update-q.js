import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    console.log('update-q');
    const { noteid, type, oldq, newq } = req.body;

    const oldQuestion = oldq;
    const newQuestion = newq;

    console.log(noteid, type, oldQuestion, newQuestion);
    // Validate required parameters
    if (!noteid || !oldQuestion || !newQuestion) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const client = await clientPromise;
    const db = client.db("Notes");
    const qasCollection = db.collection('QAs');

    // Search for an existing question based on noteid and oldQuestion
    const existingQuestion = await qasCollection.findOne({ note_id: noteid, q: oldQuestion });

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Old question not found' });
    }

    // Update the existing question with the new question
    const updateResult = await qasCollection.updateOne(
      { _id: existingQuestion._id },
      { $set: { q: newQuestion } } 
    );

    if (updateResult.modifiedCount === 1) {
      return res.status(200).json({ message: 'Question updated successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to update question' });
    }
  } catch (error) {
    console.error('Error saving question:', error);
    return res.status(500).json({ error: error.message });
  }
}