import clientPromise from '../../../lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('sample_mflix');
    const collection = db.collection('commentsa');
    const data = await collection.find({}).toArray();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in API route:', error); // Add logging
    return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}