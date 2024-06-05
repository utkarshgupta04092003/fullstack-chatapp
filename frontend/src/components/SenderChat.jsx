import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { deleteMessageRoute } from '../Routes';
import { deleteTimeLimit } from '../utils/constant';
import { Toaster, toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setParentMessage } from '../redux/parentMessageSlice';
// import components
import TextMessage from './displayMessages/TextMessage';
import ImageMessage from './displayMessages/ImageMessage';
import PDFMessage from './displayMessages/PDFMessage';
import RawMessage from './displayMessages/RawMessage';
import VideoMessage from './displayMessages/VideoMessage';
export default function SenderChat({ senderDetails, message, receiverDetails, scrollToMessage }) {
    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const dispatch = useDispatch();
    const messagePopUpRef = useRef(null);
    const handleClickOutside = (event) => {
        if (messagePopUpRef.current && !messagePopUpRef.current.contains(event.target)) {
            setIsOptionOpen(false);
        }
    };
    useEffect(() => {
        if (isOptionOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOptionOpen]);
    const handleDelete = async () => {
        if ((new Date() - new Date(message.sendAt)) > deleteTimeLimit) {
            toast.error('This message can not be deleted now', {
                style: {
                    background: '#1e293b',
                    color: '#e2e8f0',
                }
            });
            return;
        }
        try {
            Swal.fire({
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                color: "#e2e8f0",
                background: '#1e293b',
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const user = JSON.parse(localStorage.getItem("user")) || null;
                    if (!user || !user.accessToken) {
                        console.error("access token is invalid");
                        return;
                    }
                    const headers = {
                        Authorization: `Bearer ${user?.accessToken}`,
                    };
                    const { data } = await axios.delete(deleteMessageRoute,
                        {
                            headers,
                            data: {
                                messageId: message._id,
                            }
                        }
                    )
                    if (data.success) {
                        toast.success(data.message, {
                            style: {
                                background: '#1e293b',
                                color: '#e2e8f0'
                            },
                        });
                        setIsDeleted(true);
                    }
                }
            });
            setIsOptionOpen(false);
        } catch (error) {
            console.error('Error in deleting message');
        }
    }
    const parentMessageDetails = message.parentMessage;
    return !isDeleted && (
        <div className="flex flex-row-reverse items-start" key={message._id} >
            <img
                className="ml-2 h-8 w-8 rounded-full"
                src={senderDetails?.avatar}
            />
            <div className="flex-col min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-2 dark:bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl group/reaction" onDoubleClick={() => dispatch(setParentMessage(message))}>
                <div className='flex-col select-none cursor-pointer' onClick={() => scrollToMessage(message.parentMessage?._id)}>
                    <div className="relative w-full bg-slate-200">
                        <p className=" bottom-1 w-full bg-slate-200">
                            {
                                parentMessageDetails && parentMessageDetails?.length != 0 &&
                                <div className="p-1 flex">
                                    <span className="border border-gray-900 rounded-l-lg w-[5px] bg-gray-900"></span>
                                    <figure className="flex w-[90%] pl-1 p-1 border border-gray-300 rounded-r-xs items-center bg-slate-50">
                                        {
                                            (['image', 'jpg', 'jpeg', 'png'].filter((f) => f === parentMessageDetails?.messageType)).length != 0 ?
                                                <>
                                                    <img src={parentMessageDetails?.message} alt="image" className="w-10 h-10" />
                                                    <figcaption className="ml-2">
                                                        <p className="font-bold capitalize text-gray-500">
                                                            {parentMessageDetails.sender == senderDetails._id ? senderDetails?.fullname : receiverDetails?.fullname}
                                                        </p>
                                                    </figcaption>
                                                </>
                                                :
                                                parentMessageDetails.messageType == "text" ?
                                                    <>
                                                        <figcaption className="ml-2">
                                                            <p className="font-bold capitalize text-gray-500">
                                                                {parentMessageDetails.sender == senderDetails._id ? senderDetails?.fullname : receiverDetails?.fullname}
                                                            </p>
                                                            <p className="text-sm p-0 text-slate-500">{parentMessageDetails?.message || "Message"}</p>
                                                        </figcaption>
                                                    </> :
                                                    <>
                                                        <figcaption className="ml-2">
                                                            <p className="font-bold capitalize text-gray-500">
                                                                {parentMessageDetails.sender == senderDetails._id ? senderDetails?.fullname : receiverDetails?.fullname}
                                                            </p>
                                                            <p className="text-sm p-0 text-slate-500">{parentMessageDetails?.fileName || "file"}</p>
                                                        </figcaption>
                                                    </>
                                        }
                                    </figure>
                                </div>
                            }
                        </p>
                    </div>
                </div>
                {
                    message.messageType == "text" &&
                    <TextMessage message={message} senderDetails={senderDetails} setIsDeleted={setIsDeleted} handleDelete={handleDelete} receiverDetails={receiverDetails} messageSide="sender" />
                }
                {
                    (['image', 'jpg', 'jpeg', 'png'].filter((f) => f === message.messageType)).length != 0 &&
                    <ImageMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete} receiverDetails={receiverDetails} s />
                }
                {
                    message.messageType == "pdf" &&
                    <PDFMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete} receiverDetails={receiverDetails} />
                }
                {// for all type of document like excel, word, text etc
                    message.messageType == "raw" &&
                    <RawMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete} />}
                {
                    (['video', 'mp4'].filter((f) => f === message.messageType)).length != 0 &&
                    <VideoMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete} />
                }
                {
                    (['text', 'jpg', 'jpeg', 'png', 'image', 'video', 'mp4', 'pdf', 'raw'].filter((f) => f === message.messageType)).length == 0 &&
                    <p>This message format is not valid</p>
                }
            </div>
            <Toaster />
        </div>
    )
}
