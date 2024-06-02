import axios from 'axios';
import React, { useState } from 'react'
import { IoMdMore } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import Swal from 'sweetalert2'
import { deleteMessageRoute, editMessageRoute } from '../Routes';
import { deleteTimeLimit, editTimeLimit } from '../utils/constant';
import { Toaster, toast } from 'react-hot-toast';



export default function SenderChat({ senderDetails, message }) {

    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [editedMessage, setEditedMessage] = useState(null);
    const [isEditable, setIsEditable] = useState((new Date() - new Date(message.sendAt)) < editTimeLimit);
    const [isDeletabble, setIsDeletable] = useState((new Date() - new Date(message.sendAt)) < deleteTimeLimit);
    const [isDeleted, setIsDeleted] = useState(false);
    const handleEditMessage = () => {
        // if the send time out for editing time
        if ((new Date() - new Date(message.sendAt)) > editTimeLimit) {
            toast.error('This message can not be edited now', {
                style: {
                    background: '#1e293b',
                    color: '#e2e8f0',
                }
            });
            // setIsOptionOpen(false);
            return;
        }
        Swal.fire({
            text: 'Edit message:',
            color: "#e2e8f0",
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off',
            },
            showCancelButton: true,
            confirmButtonText: 'Save',
            confirmButtonColor: '#3085d6', // Blue color
            cancelButtonText: 'Close',
            background: '#1e293b',
            customClass: {
                title: 'swal2-title text-blue-500 font-bold', // Blue text
                confirmButton: 'swal2-button swal2-button--confirm bg-blue-500 text-white font-bold', // Blue button
            },
            preConfirm: async (inputValue) => {
                try {
                    const user = JSON.parse(localStorage.getItem("user")) || null;
                    if (!user || !user.accessToken) {
                        console.error("access token is invalid");
                        return;
                    }
                    console.log('token', user?.accessToken)
                    const headers = {
                        Authorization: `Bearer ${user?.accessToken}`,
                    };
                    console.log(inputValue, message._id);
                    const { data } = await axios.post(editMessageRoute, {
                        messageId: message._id,
                        message: inputValue
                    }, {
                        headers
                    })
                    setEditedMessage(data.data.message);
                } catch (error) {
                    console.error("Error in updating the message");
                }
                finally {
                    setIsOptionOpen(false);
                }
            }
        })
    }

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
                    console.log('delete token', user?.accessToken)
                    const headers = {
                        Authorization: `Bearer ${user?.accessToken}`,
                    };
                    console.log(headers);
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

    return !isDeleted && (
        <div className="flex flex-row-reverse items-start" key={message._id}>
            <img
                className="ml-2 h-8 w-8 rounded-full"
                src={senderDetails?.avatar}
            />

            <div className="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-2 dark:bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl">

                {
                    message.messageType == "text" &&
                    <p className="flex break-words break-all">

                        <p>{editedMessage || message.message}</p>
                        <p className="ml-2 cursor-pointer">
                            <IoMdMore onClick={() => setIsOptionOpen(!isOptionOpen)} />
                        </p>

                        <div className='relative'>

                            {isOptionOpen && <div className='absolute top-6 -left-6 flex-col rounded-lg bg-gray-800 px-1 w-[65px] text-center'>
                                {
                                    isEditable && <button className='w-full cursor-pointer hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200' onClick={handleEditMessage} disabled={!isEditable}>Edit</button>

                                }
                                {
                                    isDeletabble && <button className="w-full hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200 cursor-pointer" onClick={handleDelete}>Delete</button>
                                }
                            </div>}
                        </div>

                    </p>


                }
                {
                    (['image', 'jpg', 'jpeg', 'png'].filter((f) => f === message.messageType)).length != 0 &&
                    <div className="flex">

                        <img src={message.message} alt={message.messageType} className="h-56 w-56 rounded-lg" />
                        <p className="ml-2 cursor-pointer">
                            <IoMdMore onClick={() => setIsOptionOpen(!isOptionOpen)} />
                        </p>

                        <div className='relative'>

                            {isOptionOpen && <div className='absolute top-6 -left-6 flex-col rounded-lg bg-gray-800 px-1 w-[65px] text-center'>
                                {
                                    isDeletabble && <button className="w-full hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200 cursor-pointer" onClick={handleDelete}>Delete</button>
                                }
                            </div>}
                        </div>
                    </div>
                }
                {
                    message.messageType == "pdf" &&
                    <p className="flex items-center">{message.fileName}.pdf
                        <a href={message.message} download target="_blank">
                            <MdOutlineFileDownload className="text-2xl" />
                        </a>
                        <p className="ml-2 cursor-pointer">
                            <IoMdMore onClick={() => setIsOptionOpen(!isOptionOpen)} />
                        </p>

                        <div className='relative'>

                            {isOptionOpen && <div className='absolute top-6 -left-6 flex-col rounded-lg bg-gray-800 px-1 w-[65px] text-center'>
                                {
                                    isDeletabble && <button className="w-full hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200 cursor-pointer" onClick={handleDelete}>Delete</button>
                                }
                            </div>}
                        </div>

                    </p>

                }
                {// for all type of document like excel, word, text etc
                    message.messageType == "raw" &&
                    <p className="flex items-center">{message.fileName}
                        <a href={message.message} download target="_blank">
                            <MdOutlineFileDownload className="text-2xl" />
                        </a><p className="ml-2 cursor-pointer">
                            <IoMdMore onClick={() => setIsOptionOpen(!isOptionOpen)} />
                        </p>

                        <div className='relative'>

                            {isOptionOpen && <div className='absolute top-6 -left-6 flex-col rounded-lg bg-gray-800 px-1 w-[65px] text-center'>
                                {
                                    isDeletabble && <button className="w-full hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200 cursor-pointer" onClick={handleDelete}>Delete</button>
                                }
                            </div>}
                        </div>
                    </p>

                }
                {
                    (['video', 'mp4'].filter((f) => f === message.messageType)).length != 0 &&
                    <div className='flex'>
                        <video controls width="400" height="">
                        <source src={message.message} type="video/mp4" />
                    </video>
                    <p className="ml-2 cursor-pointer">
                            <IoMdMore onClick={() => setIsOptionOpen(!isOptionOpen)} />
                        </p>

                        <div className='relative'>

                            {isOptionOpen && <div className='absolute top-6 -left-6 flex-col rounded-lg bg-gray-800 px-1 w-[65px] text-center'>
                                {
                                    isDeletabble && <button className="w-full hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200 cursor-pointer" onClick={handleDelete}>Delete</button>
                                }
                            </div>}
                        </div>
                    </div>
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
