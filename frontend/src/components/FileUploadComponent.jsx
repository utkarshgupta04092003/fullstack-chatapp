// FileUploadComponent.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage } from '../redux/messageSlice';
import { setParentMessage } from '../redux/parentMessageSlice';
const FileUploadComponent = ({ receiverDetails }) => {
    const dispatch = useDispatch();
    const parentMessage = useSelector((state) => state.parentMessage.parentMessage);
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
                    // Handle the uploaded file's URL here (e.g., send it to your backend or update state)
                    const uploadedFileUrl = result.info.secure_url;
                    const messageType = result.info.format == "pdf" ? "pdf" : result.info.resource_type;
                    uploadedFileUrl;
                    dispatch(addMessage({ input: uploadedFileUrl, receiverId: receiverDetails._id, messageType, fileName: result.info.original_filename, parentMessage}))
                    dispatch(setParentMessage(''));
                    // You can now dispatch an action or make an API call with the uploaded file URL
                }
            }
        );
    };
    return (
        <div className="flex justify-between text-xs  text-white  border  rounded items-center bg-gray-700 p-2 transition-all ">
            <button onClick={showWidget} >Upload Files</button>
        </div>
    );
};
export default FileUploadComponent;
