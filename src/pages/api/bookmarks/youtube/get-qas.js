import clientPromise from '../../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    try {
        const { id } = req.query; // video_id

        if (!id) {
            return res.status(400).json({ error: 'Missing video ID' });
        }

        const client = await clientPromise;
        
        // 连接到数据库
        const db = client.db("Notes"); // 替换为实际使用的数据库名称
        const qasCollection = db.collection('QAs');

        const qasData = await qasCollection.find({ src: id }).project({ embedding: 0 }).toArray();

        if (!qasData || qasData.length === 0) {
            return res.status(404).json({ error: 'Questions and answers data not found for provided video ID' });
        }

        // 返回视频标题、描述和总结数据
        res.status(200).json(qasData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}