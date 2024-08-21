import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body as JSON
    const body = await request.json();

    console.log(body)


    // Validate the data (optional)
    if (!body || !body.publicKey || !body.value) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('coingalaxy');
    const collection = db.collection('payments');

    // Insert the data into MongoDB
    const result = await collection.insertOne(body);

    // Return a success response
    const paymentLink=`${process.env.WEBSITE_URL}/payment/${result.insertedId}`
    return NextResponse.json({ message: 'Data saved successfully', payment_link:paymentLink });
  } catch (error) {
    console.error('Error in POST API:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}
