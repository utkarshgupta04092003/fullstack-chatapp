import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { IoMdMore } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import Swal from 'sweetalert2'
import { deleteMessageRoute, editMessageRoute, updateMessageReaction } from '../Routes';
import { deleteTimeLimit, editTimeLimit } from '../utils/constant';
import { Toaster, toast } from 'react-hot-toast';
import Picker from 'emoji-picker-react';
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { useDispatch, useSelector } from 'react-redux';
import { setParentMessage } from '../redux/parentMessageSlice';

// import components

import TextMessage from './displayMessages/TextMessage';
import ImageMessage from './displayMessages/ImageMessage';
import PDFMessage from './displayMessages/PDFMessage';
import RawMessage from './displayMessages/RawMessage';
import VideoMessage from './displayMessages/VideoMessage';

export default function SenderChat({ senderDetails, message }) {

    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [editedMessage, setEditedMessage] = useState(null);
    const [isDeletabble, setIsDeletable] = useState((new Date() - new Date(message.sendAt)) < deleteTimeLimit);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isOpenReaction, setIsOpenReaction] = useState(false);
    const [reactions, setReactions] = useState(message.reactions);
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

    const handleReaction = async (event, emojiObject) => {
        console.log(event.emoji);
        const user = JSON.parse(localStorage.getItem("user")) || null;
        const headers = {
            Authorization: `Bearer ${user.accessToken}`,
        };
        console.log('user', user);
        const { data } = await axios.post(updateMessageReaction, {
            user: user._id,
            reaction: event.emoji,
            messageId: message._id
        }, { headers })
        console.log('update Response', data);
        if (data.success) {
            setReactions(data.data.reactions);
        }
        setIsOpenReaction(false);
    };
    
    const getReactionListHtml = () => {
        const listItems = reactions.map((r) => (
            `<li key="${r.id || r.reaction}" class="flex border border-gray-500 p-2 justify-between w-2/3 m-auto">
                <p class="text-gray-700">${r.fullname}</p>
                <p class="text-gray-700">${r.reaction}</p>
            </li>`
        ));
        return `
          <h2 class="text-xl font-bold m-2">Reaction List</h2>
          <ul className="border border-red-500">
            ${listItems.join('')}
          </ul>
        `;
    };

    const showAllEmojiList = () => {
        const htmlContent = getReactionListHtml();
        Swal.fire({
            background: "#e2e8f0",
            colo: '#1e293b',
            html: htmlContent
        })
    }

    return !isDeleted && (
        <div className="flex flex-row-reverse items-start" key={message._id}>
            <img
                className="ml-2 h-8 w-8 rounded-full"
                src={senderDetails?.avatar}
            />
            <div className="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-2 dark:bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl group/reaction"  onDoubleClick={()=>dispatch(setParentMessage(message))}>
                {
                    message.messageType == "text" && 
                    <TextMessage message={message} senderDetails={senderDetails} setIsDeleted={setIsDeleted} handleDelete={handleDelete} messageSide="sender"/>
                }
                {
                    (['image', 'jpg', 'jpeg', 'png'].filter((f) => f === message.messageType)).length != 0 &&
                    <ImageMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete}/>
                }
                {
                    message.messageType == "pdf" &&
                    <PDFMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete}/>
                }
                {// for all type of document like excel, word, text etc
                    message.messageType == "raw" &&
                    <RawMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete} />}
                {
                    (['video', 'mp4'].filter((f) => f === message.messageType)).length != 0 &&
                    <VideoMessage message={message} senderDetails={senderDetails} handleDelete={handleDelete}/>
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
