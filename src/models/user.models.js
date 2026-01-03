import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique:true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trime: true,
            index: true
        },
        avatar: {
            type: String, // URL to the user's avatar image
            default: null,
            required: true
        },
        coverImage:{
            type: String, // URL to the user's cover image
            default: null,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Video'
            }
        ],
        refreshToken: {
            type: String
        }

    },
    { timestamps: true }
);

// Hash the password before saving the user
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next;

    this.password = await bcrypt.hash(this.password, 10);
    next

})

// Method to compare entered password with hashed password
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password);
}

// Method to generate jwt access tokens
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
// Method to generate jwt refresh tokens
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema);