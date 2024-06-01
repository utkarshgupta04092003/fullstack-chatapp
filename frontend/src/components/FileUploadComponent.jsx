// FileUploadComponent.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../redux/messageSlice';

const FileUploadComponent = ({ receiverDetails }) => {
    const dispatch = useDispatch();
    const showWidget = () => {
        window.cloudinary.openUploadWidget(
            {
                cloudName: 'dnnltdvkw', // Replace with your Cloudinary cloud name
                uploadPreset: 'mrzsr4hg', // Replace with your upload preset
                sources: ['local', 'url', 'camera'], // Configure sources
                multiple: true, // Allow single file upload
                cropping: false, // Disable cropping
                folder: 'fullstack_chatapp/documents'
            },
            (error, result) => {
                if (!error && result && result.event === 'success') {
                    console.log('Upload Result:', result.info);
                    // Handle the uploaded file's URL here (e.g., send it to your backend or update state)
                    const uploadedFileUrl = result.info.secure_url;
                    const messageType = result.info.format == "pdf" ? "pdf" : result.info.resource_type;
                    console.log('Uploaded File URL:', uploadedFileUrl);
                    uploadedFileUrl;
                    dispatch(addMessage({ input: uploadedFileUrl, receiverId: receiverDetails._id, messageType, fileName: result.info.original_filename}))
                    // You can now dispatch an action or make an API call with the uploaded file URL
                }
            }
        );
    };
    console.log('from upload', receiverDetails);

    return (
        <div className="flex justify-between text-xs  text-white  border  rounded items-center bg-gray-700 p-2 transition-all ">
            <button onClick={showWidget} >Upload Files</button>
        </div>
    );
};

export default FileUploadComponent;
