// db.js
const mongoose = require('mongoose');
//mongoose.set('debug', false);
import Transcript from '../models/Transcript';

const connectDB = async () => {

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB Connected...");
 /*   
    const data = {
        transcriptData: [
            {
                id: '0-0',
                speaker: 'speaker1',
                transcriptStart: '0.00',
                transcriptText: " Today we're having an official debate on what the best music genre is."
            },
            {
                id: '1-0',
                speaker: 'SPEAKER_00',
                transcriptStart: '3.12',
                transcriptText: " It's gotta be classical."
            }            
        ]
    };
    
    const t = await Transcript.create(data);
    console.log("returned trainscript object: ", t);
*/
  } catch (err) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
