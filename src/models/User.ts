import mongoose from "mongoose";

export interface Users extends mongoose.Document {
  display_name: string;
  email: string;
  password: string;
}

const User_Schema = new mongoose.Schema<Users>({
  display_name: {
    type: String,
    required: [true, "Please provide a name for this pet."],
    maxlength: [60, "Name cannot be more than 60 characters"],
  },
  email: {
    type: String,
    required: [true, "Please provide a valid email"],
    unique: true,
  },
  password: {
    type: String,
    // required: [true, "Please provide a valid password"],
  },
});

export default mongoose.models.User ||
  mongoose.model<Users>("User", User_Schema);
