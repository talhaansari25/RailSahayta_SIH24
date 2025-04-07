import mongoose from "mongoose";

const StaffSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    password: {
      type: String,
      required: true,
    },
    dept: {
      type: String,
      required: true,
    },
    trainNo: {
      type: String,
    },
    compAssigned: {
      type: Array,
      default: [],
    },
    compSolved: {
      type: Array,
      default: [],
    },
    avgRating: {
      type: Number,
    },
    dutyShift: {
      type: String,
    },
    cookiesId: {
      type: Array,
      default: [],
    },
    isWorking: {
      type: Number,
      default: 1,
    },
    zonal: {
      type: String,
    },
    division: {
      type: String,
    },
    station: {
      type: String,
    }
  },
  {
    timestamps: true,
  }
);

const Staff = mongoose.model("Staff", StaffSchema);

export default Staff;
