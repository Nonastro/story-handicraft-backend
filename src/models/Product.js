import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        design: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        sizes: {
            type: [Number],
            default: [],
        },
        price: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Create index on id field for faster queries
productSchema.index({ id: 1 });

export const Product = mongoose.model("Product", productSchema);
