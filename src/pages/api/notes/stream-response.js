import EventSource from "eventsource";

// this is the handler for testing stream responses from the Python backend /stream-response endpoint, called by the test page
export default async function handler(req, res) {
  // Set headers to establish SSE connection
  res.writeHead(200, { 
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no'
  });


    // Extract query parameters from the request
    const { q } = req.query;

    // Check if the required query parameters are provided
    if (!q) {
        return res.status(400).json({ error: 'Missing required query parameters' });
    }

  try {
    // Create a connection to the Python SSE endpoint
    const pythonSseUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/stream-response?content=${q}`;
    // Initialize EventSource to the Python backend
    const eventSource = new EventSource(pythonSseUrl);

    // Handle a message event
    eventSource.onmessage = function(event) {
        // Write the data received to the response stream
        res.write(`data: ${event.data}\n\n`);
    };

    // Handle any errors that occur
    eventSource.onerror = function(error) {
        console.error('EventSource failed:', error);
        eventSource.close();
        
        if (!res.headersSent) {
            // If not, send an error response
            res.status(500).json({ error: 'Internal Server Error' });
          } else {
            // If headers have been sent, just end the response
            res.end();
          }        
    };

    eventSource.addEventListener('stream-end', function(event) {
        // Handle stream end
        eventSource.close();
    });
    
    // When the client closes the connection, we close the EventSource
    req.on('close', () => {
        eventSource.close();
        res.end();
    });

  } catch (error) {
    console.error('Error setting up SSE proxy:', error);
    res.end();
    return res.status(500).send('Internal server error');
  }
}