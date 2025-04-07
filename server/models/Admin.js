import mongoose from 'mongoose'

const AdminSchema = new mongoose.Schema(
    {
        email : {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        dept : {
            type : String,
            required : true
        },
        role : {
            type : String,
            required : true
        },
        zonal:{
            type : String,
            required: true
        },
        division : {
            type : String
        }
    },
    {
        timestamps: true,
    }
)

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;