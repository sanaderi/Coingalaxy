// // lib/mongodb.ts
// import { MongoClient } from 'mongodb';


// const uri: string = process.env.MONGODB_URI as string;

// if (!uri) {
//   throw new Error('Please add your MongoDB URI');
// }

// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;


// // In production mode, create a new client for each connection
// client = new MongoClient(uri);
// clientPromise = client.connect();

// export default clientPromise;
