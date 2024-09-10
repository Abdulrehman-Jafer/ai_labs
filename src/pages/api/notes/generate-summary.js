import fetch from 'node-fetch';

// This is the endpoint for generating and updating the summary of a note
export default async function handler(req, res) {
  // Extract query parameters from the request
  const { noteid, content, language } = req.body;

  // Check if the required query parameters are provided
  if (!noteid) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  let apiEndpoint = 'update-note-summary';
  if (!content) {
    apiEndpoint = 'update-note-detail-summary';
  }

  try {
    // Construct the URL for the local endpoint
    const endpoint = `${process.env.NEXT_PRIVATE_BASE_URL}/${apiEndpoint}`;
    console.log('Posting to local endpoint:', endpoint);

    // Construct the request body
    const body = { noteid, content, language };

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
    res.status(200).json(data);
  } catch (error) {
    // Handle any errors that occurred during the request
    console.error('Error calling api endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
