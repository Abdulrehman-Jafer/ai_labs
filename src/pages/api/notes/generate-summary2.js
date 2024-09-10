import fetch from 'node-fetch';

// This is the endpoint for generating key insights and Q&As from given content
// returns a JSON object the key insights array object 
//        and a Q&A array object which contains question (Q) and answer (A) pairs 
// Example:
// {
//  "keyInsights": [
//    "This is insight 1",
//    "This is insight 2",
//   ],
//  "qaPairs": [
//    {
//      "Q": "question 1?",
//      "A": "answer 1"
//    },
//    {
//      "Q": "question 2？",
//      "A": "answer 2"
//    },
//  ]
// }
export default async function handler(req, res) {
  // Extract query parameters from the post request
  const { content, language } = req.body;

  // Check if the required query parameters are provided
  if (!content) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  try {
    // Construct the URL for the local endpoint
    const endpoint = `${process.env.NEXT_PRIVATE_BASE_URL}/get-summary`;
    console.log('Posting to local endpoint:', endpoint);

    // Construct the request body
    const body = { content, language };

    // Make the request to the local endpoint
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check if the local endpoint responded with an error
    if (!response.ok) {
      // Forward the error response from the Python endpoint
      return res.status(response.status).json({ error: await response.text() });
    }

    // Get the JSON data from the Python response
    const data = await response.json();

    // Return the data back to the frontend
    return res.status(200).json(data);
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error('Error calling api endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
