import React from 'react'

export default function ChatMessage() {
    return (
        <div className="flex-1 p- 4 border border-red-500">
            <div className="flex justify-between items-center bg-gray-700 p-3 mb-4">
                <div className='flex'>
                    <div className='m-1.5'><img src="asdf" alt="" />kk</div>
                    <div><h2 className="text-white font-semibold m-1.5">John Doe</h2></div>
                </div>
                <button className="px-3 py-1 bg-blue-500 text-white rounded">New Chat</button>
            </div>
            {/* Chat messages */}
            <div className="overflow-y-auto h-4/5 p-4">
                {/* Individual message */}
                <div className="flex mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                    <div className="bg-gray-300 rounded p-2 ml-2">
                        <p>Hello!</p>
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
