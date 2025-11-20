import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String, default: "" },
  attachment: { type: String, default: "" },
  time: { type: Date, default: Date.now },
});

export default mongoose.model("Message", messageSchema);
