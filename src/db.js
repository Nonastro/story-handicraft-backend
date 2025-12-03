import mongoose from "mongoose";

export async function connectDB() {
    const uri = process.env.MONGO_URL;

    if (!uri) {
        console.error("✗ MONGO_URL environment variable is not set");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, {
            dbName: "story-handicraft",
        });
        console.log("✓ MongoDB connected successfully");
    } catch (err) {
        console.error("✗ MongoDB connection error:", err);
        process.exit(1);
    }
}
