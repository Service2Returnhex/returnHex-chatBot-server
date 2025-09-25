import mongoose from "mongoose";
import readline from "readline";
import { connectDB } from "./App/config/databas";


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


async function getCollections(): Promise<string[]> {
  if (!mongoose.connection.db) {
    throw new Error("Database is not connected yet.");
  }

  const collections = await mongoose.connection.db.listCollections().toArray();
  return collections.map((c) => c.name);
}


async function deleteDocuments(collectionName: string) {
  try {
    const result = await mongoose.connection
      .collection(collectionName)
      .deleteMany({});
    console.log(`🗑️ Deleted ${result.deletedCount} documents from '${collectionName}'`);
  } catch (error) {
    console.error("❌ Error deleting documents:", error);
  }
}

async function askForInput() {
  const collections = await getCollections();

  console.log("\n📂 Available collections:");
  collections.forEach((c) => console.log(`   - ${c}`));

  rl.question(
    `\n👉 Enter collection name(s) to delete documents from (comma separated)\n(Type 'exit' to quit, '*' for all)\n> `,
    async (answer) => {
      const input = answer.trim();

      if (input.toLowerCase() === "exit") {
        console.log("👋 Exiting...");
        rl.close();
        await mongoose.disconnect();
        process.exit(0);
      }

      let names: string[];

      if (input === "*") {
        names = [...collections];
      } else {
        names = input
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);
      }

      for (const name of names) {
        if (!collections.includes(name)) {
          console.error(`❌ '${name}' is not a valid collection in this DB.`);
          continue;
        }
        await deleteDocuments(name);
      }
      askForInput();
    }
  );
}

async function main() {
  await connectDB();
  await askForInput();
}

main();
