import clientPromise from '../../../components/mongodb';

export default async function handler(req, res) {
    if (req.method == "POST") {
        const { noteid, data, type } = req.body;
        console.log(data);

        if(!noteid || !data || !type ) {
            res.status(400).json({ message: "Missing parameters" });
            return;
        }

        const client = await clientPromise;
        const db = client.db("Notes");
        const collection = db.collection("Logs");

        try {
            await collection.insertOne({
                noteid: noteid,
                type: type,
                data: data,
                timestamp: new Date()
            });
            res.status(200).json({ message: "Log added successfully" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: "Error adding log: "+ error });
        }
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}