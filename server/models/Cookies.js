import mongoose from 'mongoose'

const CookiesSchema = new mongoose.Schema(
    {
        level : {
            type: String,
            required: true,
        },
        desc: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
)
    
const Cookies = mongoose.model("Cookies", CookiesSchema);

export default Cookies;