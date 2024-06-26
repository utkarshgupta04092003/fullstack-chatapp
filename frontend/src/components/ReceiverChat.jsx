// optimize code before commit, remove unused imports, console logs, comments etc
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { MdOutlineFileDownload } from "react-icons/md";
import Swal from 'sweetalert2'
import { updateMessageReaction } from '../Routes';
import Picker from 'emoji-picker-react';
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { useDispatch } from 'react-redux';
import { setParentMessage } from '../redux/parentMessageSlice';
export default function ReceiverChat({ senderDetails,  receiverDetails, message, scrollToMessage }) {
    const [isOpenReaction, setIsOpenReaction] = useState(false);
    const [reactions, setReactions] = useState(message.reactions);
    const [isOptionOpen, setIsOptionOpen] = useState(false);
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
    const parentMessageDetails = message.parentMessage;
    return (
        <div className="flex items-start" key={message._id}>
            <img
                className="mr-2 h-8 w-8 rounded-full"
                src={receiverDetails.avatar}
            />
            <div className="flex-col rounded-b-xl group/reaction rounded-tr-xl bg-slate-50 p-2 dark:bg-slate-800 sm:max-w-md md:max-w-2xl"
                onDoubleClick={() => dispatch(setParentMessage(message))}>
                <div className='flex-col select-none cursor-pointer' onClick={()=>scrollToMessage(message.parentMessage?._id)}>
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
                                                        <p className="text-sm p-0 text-slate-500">Image</p>
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
                {// for text message    
                    message.messageType == "text" &&
                    <div className='flex cursor-pointer' onDoubleClick={() => dispatch(setParentMessage(message))}>
                        <div className="flex-1">
                            <p className="flex break-words break-all">
                                <p>{message.message}</p>
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
                        <div className={`relative left-2 hidden h-full group-hover/reaction:flex items-center`}>
                            <div className="absolute flex text-black text-2xl">
                                <HiOutlineEmojiHappy className="text-gray-900 mx-1 bg-gray cursor-pointer" onClick={() => setIsOpenReaction(!isOpenReaction)} />
                                <div className='absolute -top-2 left-8'>
                                    {isOpenReaction && <Picker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction} />}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {// for image message
                    (['image', 'jpg', 'jpeg', 'png'].filter((f) => f === message.messageType)).length != 0 &&
                    <div className="flex" >
                        <div className="flex-1">
                            <div className="flex">
                                <img src={message.message} alt={message.messageType} className="h-56 w-56 rounded-lg" />
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
                        <div className={`relative left-2 hidden h-full group-hover/reaction:flex items-center`}>
                            <div className="absolute flex text-black text-2xl">
                                <HiOutlineEmojiHappy className="text-gray-900 mx-1 bg-gray cursor-pointer" onClick={() => setIsOpenReaction(!isOpenReaction)} />
                                <div className='absolute -top-2 left-8'>
                                    {isOpenReaction && <Picker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction} />}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {// for pdf message
                    message.messageType == "pdf" &&
                    <div className="flex">
                        <div>
                            <p className="flex items-center">{message.fileName}.pdf
                                <a href={message.message} download target="_blank">
                                    <MdOutlineFileDownload className="text-2xl" />
                                </a>
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
                        <div className={`relative left-2 hidden h-full group-hover/reaction:flex items-center`}>
                            <div className="absolute flex text-black text-2xl">
                                <HiOutlineEmojiHappy className="text-gray-900 mx-1 bg-gray cursor-pointer" onClick={() => setIsOpenReaction(!isOpenReaction)} />
                                <div className='absolute -top-2 left-8'>
                                    {isOpenReaction && <Picker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction} />}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {// for all type of document like excel, word, text etc
                    message.messageType == "raw" &&
                    <div className="flex">
                        <div>
                            <p className="flex items-center">{message.fileName}
                                <a href={message.message} download target="_blank">
                                    <MdOutlineFileDownload className="text-2xl" />
                                </a>
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
                        <div className={`relative left-2 hidden h-full group-hover/reaction:flex items-center`}>
                            <div className="absolute flex text-black text-2xl">
                                <HiOutlineEmojiHappy className="text-gray-900 mx-1 bg-gray cursor-pointer" onClick={() => setIsOpenReaction(!isOpenReaction)} />
                                <div className='absolute -top-2 left-8'>
                                    {isOpenReaction && <Picker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction} />}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {// for video
                    (['video', 'mp4'].filter((f) => f === message.messageType)).length != 0 &&
                    <div className="flex">
                        <div>
                            <div className='flex'>
                                <video controls width="400" height="">
                                    <source src={message.message} type="video/mp4" />
                                </video>
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
                        <div className={`relative left-2 hidden h-full group-hover/reaction:flex items-center`}>
                            <div className="absolute flex text-black text-2xl">
                                <HiOutlineEmojiHappy className="text-gray-900 mx-1 bg-gray cursor-pointer" onClick={() => setIsOpenReaction(!isOpenReaction)} />
                                <div className='absolute -top-2 left-8'>
                                    {isOpenReaction && <Picker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction} />}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                {
                    (['text', 'jpg', 'jpeg', 'png', 'image', 'video', 'mp4', 'pdf', 'raw'].filter((f) => f === message.messageType)).length == 0 &&
                    <p>This message format is not valid</p>
                }
            </div>
        </div>
    )
}
