import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
    {
        email : {
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
        currPnr : {
            type : String,
        },
        mobile : {
            type : Number,
        },
        compId : {
            type : Array,
            default : []
        }
    },

    {
        timestamps: true,
    }
)

const User = mongoose.model("User", UserSchema);

export default User;