import mongoose from "mongoose";
import { Product } from "../src/models/Product.js";
import data from "../src/data/products.json" with { type: "json" };

const uri = process.env.MONGO_URL;

async function run() {
    if (!uri) {
        console.error("✗ Error: MONGO_URL environment variable is not set");
        console.log("Usage: MONGO_URL=\"mongodb://...\" node scripts/import-products.js");
        process.exit(1);
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(uri, { dbName: "story-handicraft" });
        console.log("✓ Connected to MongoDB");

        // پاک‌سازی محصولات قبلی
        const deleteResult = await Product.deleteMany({});
        console.log(`✓ Cleared ${deleteResult.deletedCount} old products`);

        // درج محصولات جدید
        const insertResult = await Product.insertMany(data);
        console.log(`✓ Imported ${insertResult.length} products successfully`);

        // نمایش خلاصه
        console.log("\n📊 Summary:");
        console.log(`   - Total products in database: ${insertResult.length}`);
        console.log(`   - Product IDs: ${insertResult.map(p => p.id).join(", ")}`);

        await mongoose.connection.close();
        console.log("\n✓ Import completed. Database connection closed.");
        process.exit(0);
    } catch (err) {
        console.error("\n✗ Error during import:", err);
        process.exit(1);
    }
}

run();
