import mongoose from "mongoose";

export default mongoose.model('Verifies', new mongoose.Schema({
    _id: { require: true, type: String },
    name: { require: true, type: String },
    ts: { require: false, type: Date, default: new Date().toISOString() },
}));