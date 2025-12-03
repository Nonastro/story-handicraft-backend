import mongoose from "mongoose";
import { Product } from "../src/models/Product.js";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// مسیر فایل JSON
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../src/data/products.json");

const uri = process.env.MONGO_URL;

async function run() {
    try {
        console.log("⏳ Connecting to MongoDB...");
        await mongoose.connect(uri, { dbName: "story-handicraft" });

        console.log("📥 Reading products.json...");
        const raw = await readFile(dataPath, "utf8");
        const data = JSON.parse(raw);

        console.log("🗑 پاک‌سازی محصولات قبلی...");
        await Product.deleteMany({});

        console.log("⬆ وارد کردن محصولات جدید...");
        await Product.insertMany(data);

        console.log("🎉 همه محصولات با موفقیت وارد دیتابیس شدند!");
        process.exit(0);
    } catch (err) {
        console.error("❌ خطا:", err);
        process.exit(1);
    }
}

run();
