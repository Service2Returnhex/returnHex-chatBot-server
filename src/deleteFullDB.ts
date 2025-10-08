import mongoose from "mongoose";
import { connectDB } from "./App/config/databas";

async function main() {
  try {
    await connectDB();
    await mongoose.connection.dropDatabase();
    console.log("🗑️ Entire database deleted successfully.");
  } catch (error) {
    console.error("❌ Error deleting database:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
