const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    District: {
      type: String,
    },
    PoliceStation: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    mobileNo: {
      type: Number,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    PINCODE: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    feedbackrelatedto: {
      type: String,
      required: true,
    },
    feedback: {
      type: String,
      required: true,
    },
  },
  { collection: process.env.FEEDBACK_COLLECTION || "FEEDBACK_COLLECTION" }
);

const feedbackModel =
  mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

module.exports = {
  feedbackSchema,
  feedbackModel,
};
