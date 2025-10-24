import mongoose from "mongoose";
import { config } from "./App/config/config";
import { Post } from "./App/Modules/Page/post.model";

async function updateImageDescriptions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.db_url as string);

    // Update all images in all posts that don't have imageDescription
    const result = await Post.updateMany(
      { "images.imageDescription": { $exists: false } },
      { $set: { "images.$[].imageDescription": "" } }
    );

    console.log("Update result:", result);
    console.log("All existing images are now updated with imageDescription!");

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error updating images:", err);
  }
}

updateImageDescriptions();
