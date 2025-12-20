import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';


const videoSchema = new mongoose.Schema(
    {
        videFile: {
            type: String, // URL or path to the video file
            required: true
        },
        thumbnail: {
            type: String, // URL or path to the thumbnail image
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        description: {
            type: String,
            default: '',
            trim: true
        },
        duration: {
            type: Number, // Duration in seconds, from URL
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },

    }, 
    { timestamps: true}
);

videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model('Video', videoSchema);