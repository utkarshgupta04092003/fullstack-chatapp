import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { removeFiles } from "./removeFiles.js";
import {ApiError} from './ApiError.js';
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadOnCloudinary = async (localFilePath, folderName) => {
    try {
        if (!localFilePath) return null;
        // upload the files
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: folderName,
        });
        removeFiles(localFilePath);
        return response;
    } catch (err) {
        // remove the file from local saved temp file as the upload fails
        removeFiles(localFilePath);
        throw err;
    }
};


function extractPublicId(url) {
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?=\.[^.]*$)/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
  }


const deleteFromCloudinary = async (cloudinaryURL, resourceType = 'image') => {
    try {
        // get the public id from cloudinary public url
        const publicId = extractPublicId(cloudinaryURL);
        if(resourceType == 'pdf')
            resourceType = 'image';
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        // console.log('cloudinary resposne delete\n', response)
        if(response.result !== 'ok'){
            throw new ApiError(500, "Something went wrong while deleting cloudinary");
        }
    } catch (error) {
        console.log("Error in deleting the file from cloudinary", error)
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
