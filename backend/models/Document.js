import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  author: { type: String, default: "Admin" },
  date: { type: Date, default: Date.now },
  
  comments: [
    {
      user: { type: String, required: true },
      text: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  ratings: [
    {
      user: { type: String, required: true }, 
      value: { type: Number, required: true }, 
    },
  ],
});

export default mongoose.model("Document", documentSchema);