import { ObjectId } from 'mongodb';
import clientPromise from '../../../components/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db("Notes");
        const bookmarksCollection = db.collection('Bookmarks');

        // Pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const pageSize = parseInt(req.query.pageSize, 10) || 10;
        const skip = (page - 1) * pageSize;

        // Fetch bookmarks that contain "youtube.com" in their URL with pagination
        const query = {
            $and: [
              {
                url: {
                  $regex: "youtube\\.com/watch", // This targets only video watch URLs
                  $options: "i"
                }
              },
              {
                url: {
                  $not: {
                    $regex: "youtube\\.com/(channel|user)/", // This excludes channel and user URLs
                    $options: "i"
                  }
                }
              }
            ]
          };

        const total = await bookmarksCollection.countDocuments(query);
        const youtubeVideos = await bookmarksCollection.find(query)
            .sort({ add_time: -1 })
            .skip(skip)
            .limit(pageSize)
            .toArray();

        // If no videos are found, return an empty array
        if (!youtubeVideos.length) {
            return res.status(404).json({ error: 'No YouTube videos found' });
        }

        // Map through the documents to format the response
        const formattedVideos = youtubeVideos.map(video => ({
            _id: video._id,
            title: video.title,
            url: video.url,
            summary: video.summary
            // Add any other fields you need for the frontend display
        }));
        console.log("formattedVideos: ", formattedVideos)

        // Return the paginated YouTube video data
        res.status(200).json({
            data: formattedVideos,
            page,
            pageSize,
            total
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}