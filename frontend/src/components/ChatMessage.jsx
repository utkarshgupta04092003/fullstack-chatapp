import React, { useEffect, useState } from 'react'
import { getMessageRoute } from '../Routes';
import axios from 'axios';
import { IoMdSend } from "react-icons/io";

export default function ChatMessage({ selectedUser }) {
    const [offset, setOffSet] = useState(0);
    const fetchChats = async () => {
        console.log('selected user changed');
        const user = JSON.parse(localStorage.getItem("user")) || null;
        const headers = {
            Authorization: `Bearer ${user.accessToken}`
        };
        const { data } = await axios.post(getMessageRoute, {
            receiver: selectedUser._id,
            offset
        }, { headers });
        console.log('chat data', data);
        console.log("selected", selectedUser)
    }
    useEffect(() => {

        fetchChats();
    }, [selectedUser]);

    if (!selectedUser) {
        return (
            <div className='bg-slate-200 h-screen flex justify-center items-center w-3/4 text-ner'>
                <h3 className='text-center font-medium text-lg text-animate font-sans '>
                    Click on a chat to start messaging
                </h3>
                <IoMdSend className='text-xl ml-2 text-animate' />
            </div>
        )
    }
    return (
        <div className="flex-1 bor der border-red-500">
            <div className="flex justify-between items-center bg-gray-700 p-3 mb-4">
                <div className='flex'>
                    <div className='m-1.5 h-8 w-8'><img src={selectedUser?.userDetails.avatar} alt="" className='rounded-lg' /></div>
                    <div><h2 className="text-white font-semibold m-1.5">{selectedUser?.userDetails.fullname}</h2></div>

                </div>
                <button className="px-3 py-1 bg-blue-500 text-white rounded">New Chat</button>
            </div>
            {/* Chat messages */}
            <div className="overflow-y-auto h-4/5 p-4">
                {/* Individual message */}
                <div
                    className="flex-1 space-y-6 overflow-y-auto rounded-xl bg-slate-200 p-4 text-sm leading-6 text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-300 sm:text-base sm:leading-7"
                >

                    <div className="flex items-start">
                        <img
                            className="mr-2 h-8 w-8 rounded-full"
                            src="https://dummyimage.com/128x128/363536/ffffff&text=J"
                        />
                        <div
                            className="flex rounded-b-xl rounded-tr-xl bg-slate-50 p-4 dark:bg-slate-800 sm:max-w-md md:max-w-2xl"
                        >
                            <p>What are three great applications of quantum computing?</p>
                        </div>
                    </div>
                    <div className="flex flex-row-reverse items-start">
                        <img
                            className="ml-2 h-8 w-8 rounded-full"
                            src="https://dummyimage.com/128x128/354ea1/ffffff&text=G"
                        />
                        <div
                            className="flex min-h-[85px] rounded-b-xl rounded-tl-xl bg-slate-50 p-4 dark:bg-slate-800 sm:min-h-0 sm:max-w-md md:max-w-2xl"
                        >
                            <p>
                                Three great applications of quantum computing are: Optimization of
                                complex problems, Drug Discovery and Cryptography.
                            </p>
                        </div>

                    </div>
                </div>

                {/* Add more messages here */}
            </div>
            {/* Message input */}
            <div className="flex justify-between items-center mt-4 m-4">
                <input type="text" placeholder="Type a message..." className="flex-1 p-2 rounded border border-gray-400 focus:outline-none" />
                <button className="px-4 py-2 bg-blue-500 text-white rounded">Send</button>
            </div>
        </div>
    )
}
