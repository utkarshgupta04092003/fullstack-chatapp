import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios';
import Swal from 'sweetalert2';
import Picker from 'emoji-picker-react';
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { IoMdMore } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { deleteMessageRoute, updateMessageReaction } from '../../Routes';
import { deleteTimeLimit, editTimeLimit } from '../../utils/constant';
import { setParentMessage } from '../../redux/parentMessageSlice';
import { Toaster, toast } from 'react-hot-toast';

export default function ImageMessage({message, senderDetails, handleDelete}) {
    const [isOptionOpen, setIsOptionOpen] = useState(false);
    const [isOpenReaction, setIsOpenReaction] = useState(false);
    const [isDeletabble, setIsDeletable] = useState((new Date() - new Date(message.sendAt)) < deleteTimeLimit);
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
        <div className="flex">
            <div className={`relative hidden h-full group-hover/reaction:flex items-center`}>
                <div className="absolute flex -left-10 text-black text-2xl">
                    <HiOutlineEmojiHappy className="text-gray-900 mx-1 bg-gray cursor-pointer" onClick={() => setIsOpenReaction(!isOpenReaction)} />
                    <div className='absolute -top-2 right-7'>
                        {isOpenReaction && <Picker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction} />}
                    </div>
                </div>
            </div>
            <div className="flex-1">
                <div className="flex">
                    <img src={message.message} alt={message.messageType} className="h-56 w-56 rounded-lg" />
                    <p className="ml-2 cursor-pointer">
                        <IoMdMore onClick={() => setIsOptionOpen(!isOptionOpen)} />
                    </p>
                    <div className='relative' ref={messagePopUpRef}>

                        {isOptionOpen && <div className='absolute top-6 -left-6 flex-col rounded-lg bg-gray-800 px-1 w-[65px] text-center'>
                            {
                                isDeletabble && <button className="w-full hover:text-gray-600 hover:rounded my-1 hover:bg-slate-200 cursor-pointer" onClick={handleDelete}>Delete</button>
                            }
                        </div>}
                    </div>
                </div>
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
