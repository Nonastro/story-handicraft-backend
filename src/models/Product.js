import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    description: String,
    image_url: String,
    model: String,
    size: String,
    stok: Number
});

export const Product = mongoose.model("Product", productSchema);
