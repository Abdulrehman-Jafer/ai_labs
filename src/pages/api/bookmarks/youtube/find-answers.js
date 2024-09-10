export default async function handler(req, res) {
    // Extract query parameters from the request
    const { vid_id, q, search_type } = req.query;
  
    // Check if the required query parameters are provided
    if (!vid_id) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

    try {
      // Construct the URL for the local endpoint      
        let endpoint = "";
        if(search_type === "indoc") // search for answers in the document, using similarity search
            endpoint = `${process.env.NEXT_PRIVATE_BASE_URL}/get-answers?vid_id=${vid_id}&q=${q}`;
        else  // search for cached answers from mongodb
            endpoint = `${process.env.NEXT_PRIVATE_BASE_URL}/find-answers?vid_id=${vid_id}&q=${q}`;
        
        console.log('Calling local endpoint:', endpoint);

        // Forward the request to the local endpoint
        const response = await fetch(endpoint);

        // Check if the local endpoint responded with an error
        if (!response.ok) {
            // Forward the error response from the Python endpoint
            return res.status(response.status).json({ error: await response.text() });
        }

        // Get the JSON data from the Python response
        const data = await response.json();
        console.log('Data received from local endpoint:', data);

        // Return the data back to the frontend
        res.status(200).json(data);
    } catch (error) {
      // Handle any errors that occurred during the request
      console.error('Error calling api endpoint:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }