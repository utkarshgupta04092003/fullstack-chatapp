import React, { useEffect, useRef, useState } from "react";
import { getMessageRoute } from "../Routes";
import axios from "axios";
import { IoMdSend } from "react-icons/io";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setMessages, uploadFile } from "../redux/messageSlice";
import FileUploadComponent from "./FileUploadComponent";
import { FaPlus } from "react-icons/fa";
import { MdOutlineFileDownload } from "react-icons/md";
import SenderChat from "./SenderChat";
import ReceiverChat from "./ReceiverChat";
import Picker from 'emoji-picker-react';
import { HiOutlineEmojiHappy } from "react-icons/hi";


export default function ChatMessage() {
    const { receiverId } = useParams();
    const selectedUser = receiverId;
    const [offset, setOffSet] = useState(0);
    const [input, setInput] = useState("");
    const [senderDetails, setSenderDetails] = useState({});
    const [receiverDetails, setReceiverDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    // const [photos, setPhotos] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    const dispatch = useDispatch();
    const { messages } = useSelector((state) => state.messages);
    const fetchChats = async () => {
        console.log("selected user changed");
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
            console.log("chat data", data.data.messages);
            console.log("selected", selectedUser);
            // setMessages(data.data.messages);
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
        <div className="flex-1 bor der border-red-500">
            <div className="flex justify-between items-center bg-gray-700 p-3 mb-4">
                {isLoading ? (
                    <div className="text-center w-full text-white font-semibold h-9 ">
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
                    <div className="flex-1 space-y-6 overflow-y-auto rounded-xl bg-slate-200 p-4 pb-10 text-sm leading-6 text-slate-200 shadow-sm   sm:text-base sm:leading-7">
                        {messages?.map((message) =>
                            message?.sender == senderDetails._id ? (
                                // sender (right side message)
                                <SenderChat senderDetails={senderDetails} message={message} key={message._id} />
                            ) : (
                                // receiver (left side)
                                <ReceiverChat receiverDetails={receiverDetails} message={message} key={message._id} />
                            )
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
                    isOpen && <div className="absolute -top-10" onClick={() => setIsOpen(!isOpen)}>
                        <FileUploadComponent receiverDetails={receiverDetails} />
                    </div>

                }
                <form className="flex justify-between items-center mt-4 m-4" onSubmit={(e) => { e.preventDefault(); dispatch(addMessage({ input, receiverId: receiverDetails._id })); setInput("") }}>
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
