import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


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

export { uploadToCloudinary }