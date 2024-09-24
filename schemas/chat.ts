import mongoose from "mongoose";

export default mongoose.model('Chats', new mongoose.Schema({
    _id: { require: true, type: String },
    name: { require: true, type: String },
    userID: { require: true, type: String },
    email: { require: true, type: String },
    ts: { require: true, type: Number },
    original: { require: false, type: String },
    content: {
        text: { require: true, type: String }
    }
}));