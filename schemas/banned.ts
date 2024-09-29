import mongoose from "mongoose";

export default mongoose.model('Bans', new mongoose.Schema({
    _id: { require: true, type: String },
    name: { require: true, type: String },
    messages: { require: true, type: [] },
    ts: { require: true, type: Number },
}));