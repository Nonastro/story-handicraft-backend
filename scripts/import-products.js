import mongoose from "mongoose";
import { Product } from "../src/models/Product.js";
import data from "../src/data/products.json" assert { type: "json" };

const uri = process.env.MONGO_URL;

async function run() {
    await mongoose.connect(uri, { dbName: "story-handicraft" });

    console.log("Connected. Importing data...");

    await Product.deleteMany({});
    await Product.insertMany(data);

    console.log("Import completed.");
    process.exit(0);
}

run();
