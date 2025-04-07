import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    trainNo: {
      type: String,
      required: true,
    },
    category2: {
      type: String,
    },
    crossDeptAccept: {
      type: Number,
    },
    severity: {
      type: Number,
      required: true,
    },
    subcategory: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    ticketDetails: {
      type: String,
    },
    pnrNo: {
      type: String,
      required: true,
    },
    staffId: {
      type: String,
    },
    staffId2: {
      type: String,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
    },
    status: {
      // Pending, In Process, Completed
      type: String,
      required: true,
    },
    feedback: {
      type: String,
    },
    rating: {
      type: Number,
    },
    sentiment: {
      type: String,
    },
    media: {
      type: String,
    },
    metadata: {
      time: { type: String },
      location: { type: String },
      software: { type: String },
    },
    dept: {
      type: String,
      required: true,
    },
    dept2: {
      type: String,
    },
    userId: {
      type: String,
      required: true,
    },
    zonal: {
      type: String,
      required: true,
    },
    division: {
      type: String,
      required: true,
    },
    seatNo : {
      type : String
    },
    nextStation : {
      type : String
    }
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model("Complaint", ComplaintSchema);

export default Complaint;
