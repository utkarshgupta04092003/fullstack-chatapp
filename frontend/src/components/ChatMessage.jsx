import React, { useEffect, useState } from "react";
import { getMessageRoute } from "../Routes";
import axios from "axios";
import { IoMdSend } from "react-icons/io";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addMessage, setMessages, uploadFile } from "../redux/messageSlice";

export default function ChatMessage() {
    const { receiverId } = useParams();
    const selectedUser = receiverId;
    const [offset, setOffSet] = useState(0);
    const [input, setInput] = useState("");
    const [senderDetails, setSenderDetails] = useState({});
    const [receiverDetails, setReceiverDetails] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [photos, setPhotos] = useState(null);

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
                    <div className="flex-1 space-y-6 overflow-y-auto rounded-xl bg-slate-200 p-4 text-sm leading-6 text-slate-200 shadow-sm   sm:text-base sm:leading-7">
                        {messages?.map((message) =>
                            message?.sender == senderDetails._id ? (
                                <div className="flex flex-row-reverse items-start" key={message._id}>
                                    <img
                                        className="ml-2 h-8 w-8 rounded-full"
                                        src={senderDetails?.avatar}
                                    />
                                    <div className="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-2 dark:bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl">
                                        {
                                            message.messageType == "text" &&
                                            <p className="flex break-words break-all">
                                                {message.message}
                                            </p>
                                        }
                                        {
                                            message.messageType == "image" &&
                                            <img src={message.message} alt="image" className="h-48 w-48 rounded-lg" />
                                        }
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start" key={message._id}>
                                    <img
                                        className="mr-2 h-8 w-8 rounded-full"
                                        src={receiverDetails.avatar}
                                    />
                                    <div className="flex rounded-b-xl rounded-tr-xl bg-slate-50 p-2 dark:bg-slate-800 sm:max-w-md md:max-w-2xl">
                                    {
                                            message.messageType == "text" &&
                                            <p className="flex break-words break-all">
                                                {message.message}
                                            </p>
                                        }
                                        {
                                            message.messageType == "image" &&
                                            <img src={message.message} alt="image" className="h-48 w-48 rounded-lg" />
                                        }
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
            {/* Message input */}
            <div>
                <div className="flex justify-between items-center bg-gray-700 p-3">
                    <input type="file" name="photos" id="photos" onChange={(e)=>setPhotos(e.target.files[0])}/>
                    <button className="border border-red-500" onClick={()=>dispatch(uploadFile({photos, receiverId: receiverDetails._id}))}>Upload</button>
                </div>

                <form className="flex justify-between items-center mt-4 m-4" onSubmit={(e) => { e.preventDefault(); dispatch(addMessage({ input, receiverId: receiverDetails._id })) }}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 p-2 rounded border border-gray-400 focus:outline-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />

                    <button className="px-4 py-2 bg-blue-500 text-white rounded">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
