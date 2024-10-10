import http from 'http'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.ip_address) {
    return NextResponse.json(
      { error: 'Missing ip_address' },
      { status: 400 }
    )
  }


    
  const url = `http://${body.ip_address}:9090/check_status`; // Replace with your target URL


    // Wrap the http.get in a Promise so we can use it with async/await
  const fetchServerStatus = () => {
    return new Promise((resolve, reject) => {
      http.get(url, (proxyRes) => {
        let data = '';

        // Collect data chunks from the response
        proxyRes.on('data', (chunk) => {
          data += chunk;
        });

        // When the response is finished, resolve the Promise
        proxyRes.on('end', () => {
          try {
            const parsedData = JSON.parse(data); // Try to parse the JSON
            resolve(parsedData);
          } catch (error) {
            reject(new Error('Failed to parse JSON'));
          }
        });
      }).on('error', (e) => {
        reject(new Error(`Request failed: ${e.message}`)); // Handle request errors
      });
    });
  };

  try {
    // Await the server response
    const data = await fetchServerStatus();
    // Respond with NextResponse in case of success
    return NextResponse.json({ message: 'success'}, { status: 200 });
  } catch (error) {
    // Respond with NextResponse in case of error
    return NextResponse.json({ status: 'error', message: error }, { status: 500 });
  }
}
