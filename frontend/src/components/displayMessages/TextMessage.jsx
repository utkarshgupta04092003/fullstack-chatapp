import React, { useState, useRef, useEffect } from 'react';
import { IoMdMore } from "react-icons/io";
import { HiOutlineEmojiHappy } from "react-icons/hi";
import Picker from 'emoji-picker-react';
import Swal from 'sweetalert2';
import { useDispatch, useSelector } from 'react-redux';
import { setParentMessage } from '../../redux/parentMessageSlice';
import axios from 'axios';
import { deleteMessageRoute, editMessageRoute, updateMessageReaction } from '../../Routes';
import { deleteTimeLimit, editTimeLimit } from '../../utils/constant';
import { Toaster, toast } from 'react-hot-toast';

export default function TextMessage({ message, senderDetails, handleDelete, messageSide}) {
    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [editedMessage, setEditedMessage] = useState(null);
    const [isEditable, setIsEditable] = useState((new Date() - new Date(message.sendAt)) < editTimeLimit);
    const [isDeletabble, setIsDeletabble] = useState((new Date() - new Date(message.sendAt)) < deleteTimeLimit);
    const [isOpenReaction, setIsOpenReaction] = useState(false);
    const [reactions, setReactions] = useState(message.reactions);
    const dispatch = useDispatch();
    const parentMessage = useSelector((state) => state.parentMessage.parentMessage);
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

    const handleEditMessage = () => {
        if ((new Date() - new Date(message.sendAt)) > editTimeLimit) {
            toast.error('This message can not be edited now', {
                style: {
                    background: '#1e293b',
                    color: '#e2e8f0',
                }
            });
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
            confirmButtonColor: '#3085d6',
            cancelButtonText: 'Close',
            background: '#1e293b',
            customClass: {
                title: 'swal2-title text-blue-500 font-bold',
                confirmButton: 'swal2-button swal2-button--confirm bg-blue-500 text-white font-bold',
            },
            preConfirm: async (inputValue) => {
                try {
                    const user = JSON.parse(localStorage.getItem("user")) || null;
                    if (!user || !user.accessToken) {
                        console.error("access token is invalid");
                        return;
                    }
                    const headers = {
                        Authorization: `Bearer ${user?.accessToken}`,
                    };
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

    const handleReaction = async (event, emojiObject) => {
        const user = JSON.parse(localStorage.getItem("user")) || null;
        const headers = {
            Authorization: `Bearer ${user.accessToken}`,
        };
        const { data } = await axios.post(updateMessageReaction, {
            user: user._id,
            reaction: event.emoji,
            messageId: message._id
        }, { headers })
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
    
    return (
        <div className='flex '>
            <div className={`relative hidden h-full group-hover/reaction:flex items-center`}>
                <div className="absolute flex -left-10 text-black text-2xl">
                    <HiOutlineEmojiHappy className="text-gray-900 mx-1 bg-gray cursor-pointer" onClick={() => setIsOpenReaction(!isOpenReaction)} />
                    <div className='absolute -top-2 right-7'>
                        {isOpenReaction && 
                        <Picker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction} />}
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <p className="flex break-words break-all justify-end">

                    <p>{editedMessage || message.message}</p>
                    {
                        messageSide === 'sender' &&
                        <p className="ml-2 cursor-pointer">
                        <IoMdMore onClick={() => setIsOptionOpen(!isOptionOpen)} />
                    </p>
                    }
                    <div className='relative' ref={messagePopUpRef}>

                        {isOptionOpen &&  <div className='absolute top-6 -left-6 flex-col rounded-lg bg-gray-800 px-1 w-[65px] text-center z-10'>
                            {
                                isEditable && <button className=' text-white w-full cursor-pointer hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200' onClick={handleEditMessage} disabled={!isEditable}>Edit</button>
                            }
                            {
                                isDeletabble && <button className="w-full hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200 cursor-pointer" onClick={handleDelete}>Delete</button>
                            }
                        </div>}
                    </div>
                </p>
                <div className='text-xs text-right bottom-1 flex justify-between'>
                    <div className='relative cursor-pointer' onClick={showAllEmojiList}>
                        {
                            reactions && reactions.length != 0 && reactions[0].user &&
                            <div className="absolute top-3 left-3 rounded-2xl px-2 text-black text-base flex items-center border border-gray-500 bg-slate-200">
                                <p className='text-lg'>{reactions[reactions.length - 1].reaction}</p>
                                <span className='ml-1'>{reactions.length}</span>
                            </div>
                        }
                    </div>
                    <div>
                        {(new Date(message.sendAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    )
} 