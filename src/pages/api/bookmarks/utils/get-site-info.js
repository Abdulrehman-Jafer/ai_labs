export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Extract query parameters from the request post body
        const { url, type } = req.body;
    
        // Check if the required query parameters are provided
        if (!url || !type) {
            return res.status(400).json({ error: 'Missing required query parameters' });
        }
    
        try {
            // Construct the URL for the local endpoint
            let apiUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/get-webinfo`;
            if(type === 'youtube'){
                apiUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/get-youtube-info`;
            }

            console.log('Calling local endpoint:', apiUrl);
        
            const requestBody = JSON.stringify({ url: url});
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
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

    return res.status(405).json({ message: 'Method not allowed' });    
  }