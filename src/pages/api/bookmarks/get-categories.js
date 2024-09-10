import clientPromise from '../../../components/mongodb';

export default async function handler(req, res) {
    //if (req.method === 'POST') {
        try {
            //const { user, secretKey } = req.body;      
            const client = await clientPromise;
            /*const userDb = client.db("Platformr");
            const usersCollection = userDb.collection('users');
            */
            const db = client.db("Notes");
            const statsCollection = db.collection('Stats');
                      
            // Find the user with the provided email and secret key
            /*const query = {"email": user, "secretKey": secretKey};
            //const found_user = await usersCollection.findOne(query);
        
            if (found_user) {
                // If authentication passes, fetch filenames associated with the email
                const query = {"email": user, "filename": name};
                */

                const stats = await db.collection("Stats").findOne({ type: "categories" });

                if (!stats) {
                  return res.status(404).json({ message: "Category stats not found" });
                }
              
                return res.status(200).json(stats.counts);
              
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
