import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv'
dotenv.config()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadToCloudinary = async (localfilePath) => {
    try {

        if (!localfilePath) return null

        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto'
        })
        // file has been uploaded successfully
        console.log("file is uploaded on cloudinary ", response.url);

        fs.unlinkSync(localfilePath) // remove the locally saved temporary file
        return response

    } catch (error) {
        fs.unlinkSync(localfilePath) //  remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

const deleteFromCloudinary = async(publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId)
        console.log("file is deleted from cloudinary ", publicId, result);
    } catch (error) {
        console.log("Error deleting file from cloudinary", error)
        return null
    }
}

export { uploadToCloudinary, deleteFromCloudinary }