import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017'; // Replace with your MongoDB connection string
const client = new MongoClient(uri);
const dbName = 'memoryHelper'; // Replace with your database name

async function seed() {
  try {
    await client.connect();
    const db = client.db(dbName);

    // Clear existing collections
    await db.collection('memoryPiece').deleteMany({});
    await db.collection('unit').deleteMany({});
    await db.collection('subject').deleteMany({});

    // Create a subject
    const subject = await db.collection('subject').insertOne({
      title: "Computer Science",
      description: "Fundamentals of Computer Science and Programming",
      labels: ["Programming", "Computer Science", "Technology"],
    });

    // Create units
    const programmingUnit = await db.collection('unit').insertOne({
      title: "Programming Fundamentals",
      type: "chapter",
      description: "Basic concepts of programming",
      subject: subject.insertedId,
      order: 1,
    });

    const webDevUnit = await db.collection('unit').insertOne({
      title: "Web Development",
      type: "chapter",
      description: "Web development concepts and technologies",
      subject: subject.insertedId,
      order: 2,
    });

    const memoryPieces = [
      {
        content: "JavaScript Promises",
        description: "Asynchronous programming with promises in JavaScript",
        imageUrl: "https://picsum.photos/800/600?random=1",
        labels: ["JavaScript", "Async", "Programming"],
        subject: subject.insertedId,
        unit: webDevUnit.insertedId,
      },
      {
        content: "React Hooks",
        description: "Understanding useState and useEffect in React",
        imageUrl: "https://picsum.photos/800/600?random=2",
        labels: ["React", "Hooks", "Frontend"],
        subject: subject.insertedId,
        unit: webDevUnit.insertedId,
      },
      {
        content: "TypeScript Basics",
        description: "Introduction to TypeScript types and interfaces",
        imageUrl: "https://picsum.photos/800/600?random=3",
        labels: ["TypeScript", "Programming"],
        subject: subject.insertedId,
        unit: programmingUnit.insertedId,
      },
    ];

    await db.collection('memoryPiece').insertMany(memoryPieces);
    console.log("Database seeded!");
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();