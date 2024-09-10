import clientPromise from '../../../../components/mongodb';

export default async function handler(req, res) {
  try {
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
    const userName = userRecord.displayName;
    console.log("userEmail:", userEmail);
    if(!userEmail){
        return res.status(401).json({ error: 'User id not found' });
    }

    // Connect to the MongoDB client
    const client = await clientPromise;
    const db = client.db("Notes");

    // Fetch documents from the 'Notebook' collection
    const notebooks = await db.collection('Notebook').find({'user': userEmail }).toArray();

    // Check if add_time exists for each notebook and if not, set it to null
    notebooks.forEach(notebook => {
      notebook.add_time = notebook.add_time || null;
      //add userName to each notebook
      notebook.userName = userName;
    });

    // Return the notebooks as JSON
    res.status(200).json(notebooks);
  } catch (e) {
    // Return an error response if something goes wrong
    res.status(500).json({ error: e.message });
  }
}