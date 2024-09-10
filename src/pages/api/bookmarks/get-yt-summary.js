import clientPromise from '../../../components/mongodb';
import { ObjectId } from 'mongodb';

export default async function getYouTubeSummary(req, res) {
    try {
        const { id } = req.query; // video_id

        if (!id) {
            return res.status(400).json({ error: 'Missing video ID' });
        }

        const client = await clientPromise;
        
        // 连接到数据库
        const db = client.db("Notes"); // 替换为实际使用的数据库名称
        const ytDataCollection = db.collection('DocData');
        const ytCollection = db.collection('YoutubeProcessedData');

        const metaData = await ytDataCollection.findOne({ vid_id: id, type: 'meta-data' });
        // 从集合中查找视频相关的所有文档
        const videoSummaryData = await ytCollection.find({ vid_id: id, type: 'summary' }).toArray();

        if (!videoSummaryData || videoSummaryData.length === 0) {
            return res.status(404).json({ error: 'Summary data not found for provided video ID' });
        }

        // 处理返回数据格式，确定返回标题、描述和总结数组
        const metaDataText = metaData ? metaData.data : '';
        const titleMatch = metaDataText.match(/title: (.*)\ndescription: /s);
        const descriptionMatch = metaDataText.match(/description: ([\s\S]*)/);
        const title = titleMatch ? titleMatch[1].trim() : 'No Title';
        const description = descriptionMatch ? descriptionMatch[1].trim() : 'No Description';

        console.log('title:', title);
        console.log('description:', description);

        const summaries = videoSummaryData
            .map(doc => ({ start: doc.start, starts: doc.starts?doc.starts:[], title: doc.title, summary: doc.data }));

        // 返回视频标题、描述和总结数据
        res.status(200).json({
            title,
            description, 
            summaries 
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}