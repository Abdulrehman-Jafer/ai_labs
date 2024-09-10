// File: pages/api/analyze-video.js

import { NextApiRequest, NextApiResponse } from 'next';
import EventSource from "eventsource";

export default async function handler(req, res) {
  // Set headers to establish SSE connection
  /*
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  */
  res.writeHead(200, {
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'X-Accel-Buffering': 'no'
  });


  // Extract query parameters from the request
  const { vid } = req.query;

  // Validate the URL parameter
  if (!vid) {
    res.status(400).send('Missing video id parameter');
    res.end();
    return;
  }

  try {
    // Create a connection to the Python SSE endpoint
    const pythonSseUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/analyze-video?vid=${vid}`;
    //const pythonSseUrl = `${process.env.NEXT_PRIVATE_BASE_URL}/stream-data?param=${encodeURIComponent(url)}`;
    const pythonEventSource = new EventSource(pythonSseUrl);

    // Forward the 'progress' event to the client
    pythonEventSource.addEventListener('progress', (event) => {
        res.write(`event: progress\ndata: ${event.data}\n\n`);
    });

    // Forward the 'serror' event to the client
    pythonEventSource.addEventListener('serror', (event) => {
        res.write(`event: serror\ndata: ${event.data}\n\n`);
    });
  
    // Forward the 'error' event to the client
    pythonEventSource.addEventListener('error', (event) => {
        res.write(`event: error\ndata: ${event.data}\n\n`);
        res.end();
        pythonEventSource.close();
    });

    // Forward the 'end' event to the client and close the connection
    pythonEventSource.addEventListener('end', (event) => {
        res.write(`event: end\ndata: ${event.data}\n\n`);
        res.end();
        pythonEventSource.close();
    });

    // Handle any errors with the Python SSE connection
    pythonEventSource.onerror = (error) => {
      console.error('Error in Python EventSource:', error);
      res.write('event: error\ndata: Connection to SSE failed. ${event.data}\n\n');
      res.end();
      pythonEventSource.close();
    };

    // Close the SSE connection when the client disconnects
    req.on('close', () => {
      pythonEventSource.close();
    });
  } catch (error) {
    console.error('Error setting up SSE proxy:', error);
    res.status(500).send('Internal server error');
    res.end();
  }
}