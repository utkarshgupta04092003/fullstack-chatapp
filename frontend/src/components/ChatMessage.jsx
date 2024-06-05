import React, { useEffect, useRef, useState } from "react";
import { getMessageRoute } from "../Routes";
import axios from "axios";
import { IoMdSend } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setMessages } from "../redux/messageSlice";
import FileUploadComponent from "./FileUploadComponent";
import { FaPlus } from "react-icons/fa";
import SenderChat from "./SenderChat";
import ReceiverChat from "./ReceiverChat";
import Picker from 'emoji-picker-react';
import { HiOutlineEmojiHappy } from "react-icons/hi";
import { setParentMessage } from "../redux/parentMessageSlice";
import { IoCloseCircleOutline } from "react-icons/io5";
export default function ChatMessage() {
    const { receiverId } = useParams();
    const selectedUser = receiverId;
    const [offset, setOffSet] = useState(0);
    const [input, setInput] = useState("");
    const [senderDetails, setSenderDetails] = useState({});
    const [receiverDetails, setReceiverDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { messages } = useSelector((state) => state.messages);
    const { parentMessage } = useSelector((state) => state.parentMessage);
    const fetchChats = async () => {
        try {
            setIsLoading(true);
            const user = JSON.parse(localStorage.getItem("user")) || null;
            const headers = {
                Authorization: `Bearer ${user.accessToken}`,
            };
            const { data } = await axios.post(
                getMessageRoute,
                {
                    receiver: selectedUser,
                    offset,
                },
                { headers }
            );
            dispatch(setMessages(data.data.messages));
            setSenderDetails(data.data.senderDetails);
            setReceiverDetails(data.data.receiverDetails);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchChats();
        return () => dispatch(setParentMessage(null));
    }, [selectedUser]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const onEmojiClick = (event, emojiObject) => {
        setInput((prev) => prev + event.emoji)
    };
    const handleClickOutside = (event) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
            setShowEmojiPicker(false);
        }
    };
    useEffect(() => {
        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);
    const handleSendMessage = (e) => {
        e.preventDefault();
        dispatch(addMessage({ input, receiverId: receiverDetails._id, parentMessage }));
        setInput("");
        dispatch(setParentMessage(null));
    }
    const messageRefs = useRef({});
    const scrollToMessage = (messageId) => {
        const messageElement = messageRefs.current[messageId];
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth' });
            messageElement.className = 'animate-pulse';
            setTimeout(() => {
                messageElement.className = 'animate-none';
            }, 2000);
        }
    };
    if (!selectedUser) {
        return (
            <div className="bg-slate-200 h-screen flex justify-center items-center w-3/4">
                <h3 className="text-center font-medium text-lg text-animate font-sans ">
                    Click on a chat to start messaging
                </h3>
                <IoMdSend className="text-xl ml-2 text-animate" />
            </div>
        );
    }
    return (
        <div className="flex-1">
            <div className="flex justify-between items-center bg-gray-700 p-3 mb-4">
                {isLoading ? (
                    <div className="text-center w-full text-white font-semibold h-9">
                        Loading Chat Details...
                    </div>
                ) : (
                    <div className="flex">
                        <div className="m-1.5 h-5 w-8">
                            <img
                                src={receiverDetails?.avatar}
                                alt=""
                                className="rounded-lg"
                            />
                        </div>
                        <div>
                            <h2 className="text-white font-semibold m-1.5">
                                {receiverDetails?.fullname}
                            </h2>
                        </div>
                    </div>
                )}
                {/* <button className="px-3 py-1 bg-blue-500 text-white rounded">New Chat</button> */}
            </div>
            {/* Chat messages */}
            <div className="overflow-y-auto h-4/5 p-4 bg-slate-200">
                {/* Individual message */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-[50vh] ">
                        <img src={"/loader.svg"} alt="loader" className="w-24 h-24" />
                    </div>
                ) : (
                    <div className="flex-1 space-y-6 overflow-y-auto rounded-xl bg-slate-200 p-4 pb-10 text-sm leading-6 text-slate-200 shadow-sm sm:text-base sm:leading-7">
                        {messages?.map((message) =>
                            <div ref={(el) => (messageRefs.current[message._id] = el)}>
                                {message?.sender == senderDetails._id ? (
                                    // sender (right side message)
                                    <SenderChat senderDetails={senderDetails} receiverDetails={receiverDetails} message={message} key={message._id} scrollToMessage={scrollToMessage} />
                                ) : (
                                    // receiver (left side)
                                    <ReceiverChat senderDetails={senderDetails} receiverDetails={receiverDetails} message={message} key={message._id} scrollToMessage={scrollToMessage} />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Message input */}
            <div className="relative">
                {/* manually upload document without widget */}
                {/* <div className="flex justify-between items-center bg-gray-700 p-3">
                    <input type="file" name="photos" id="photos" onChange={(e)=>setPhotos(e.target.files[0])}/>
                    <button className="border border-red-500" onClick={()=>dispatch(uploadFile({photos, receiverId: receiverDetails._id}))}>Upload</button>
                </div> */}
                {
                    isOpen && <div className="absolute -top-10 z-10" onClick={() => setIsOpen(!isOpen)}>
                        <FileUploadComponent receiverDetails={receiverDetails} />
                    </div>
                }
                {/* parent message design */}
                <div className="relative w-full bg-slate-200">
                    <p className="absolute bottom-1 w-full bg-slate-200">
                        {
                            parentMessage && parentMessage.length != 0 &&
                            <div className="pl-5 p-1 flex">
                                <span className="border border-gray-900 rounded-l-lg w-[5px] bg-gray-900"></span>
                                <figure className="flex w-[90%] pl-1 p-1 border border-gray-300 rounded-r-xs items-center bg-slate-50">
                                    {
                                        (['image', 'jpg', 'jpeg', 'png'].filter((f) => f === parentMessage?.messageType)).length != 0 ?
                                            <>
                                                <img src={parentMessage?.message} alt="image" className="w-10 h-10" />
                                                <figcaption className="ml-2">
                                                    <p className="font-bold capitalize text-gray-500">
                                                        {parentMessage.sender == senderDetails._id ? senderDetails?.fullname : receiverDetails?.fullname}
                                                    </p>
                                                    <p className="text-sm p-0 text-slate-500">{parentMessage?.fileName || "Image"}</p>
                                                </figcaption>
                                            </>
                                            :
                                            parentMessage.messageType == "text" ?
                                                <>
                                                    <figcaption className="ml-2">
                                                        <p className="font-bold capitalize text-gray-500">
                                                            {parentMessage.sender == senderDetails._id ? senderDetails?.fullname : receiverDetails?.fullname}
                                                        </p>
                                                        <p className="text-sm p-0 text-slate-500">{parentMessage?.message || "Message"}</p>
                                                    </figcaption>
                                                </> :
                                                <>
                                                    <figcaption className="ml-2">
                                                        <p className="font-bold capitalize text-gray-500">
                                                            {parentMessage.sender == senderDetails._id ? senderDetails?.fullname : receiverDetails?.fullname}
                                                        </p>
                                                        <p className="text-sm p-0 text-slate-500">{parentMessage?.fileName || "file"}</p>
                                                    </figcaption>
                                                </>
                                    }
                                </figure>
                                <p className="relative" onClick={() => dispatch(setParentMessage(null))}>
                                    <IoCloseCircleOutline className="text-2xl absolute -left-8 top-1 cursor-pointer" /></p>
                            </div>
                        }
                    </p>
                </div>
                {/* input field */}
                <form className="flex justify-between items-center mt-1 m-4" onSubmit={handleSendMessage}>
                    <div className="w-full flex">
                        <div className="border border-gray-400 border-r-0 w-10 bg-white cursor-pointer p-3 font-extrabold">
                            <FaPlus onClick={() => setIsOpen(!isOpen)} />
                        </div>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="flex-1 p-2 border border-x-0 border-gray-400 focus:outline-none w-full"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        {/* emoji input */}
                        <div className="relative bg-white border border-gray-400 border-l-0 mr-4 flex items-center">
                            <div
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="text-2xl mr-3 text-white cursor-pointer"
                            >
                                <HiOutlineEmojiHappy className="text-gray-900" />
                            </div>
                            {showEmojiPicker && (
                                <div className="absolute bottom-full mb-2 right-0" ref={emojiPickerRef}>
                                    <Picker onEmojiClick={onEmojiClick} />
                                </div>
                            )}
                        </div>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded">
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
}
