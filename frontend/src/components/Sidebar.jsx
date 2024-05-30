import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { getUserListRoute } from '../Routes';
import getAccessTokenFromCookie from '../utils/getAccessToken';

export default function Sidebar({ udpatedSelectedUser }) {
    const [userList, setUserList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const fetchUserList = async () => {
            setIsLoading(true);
            const accessToken = getAccessTokenFromCookie();
            console.log('access toekn', accessToken);
            const headers = {
                Authorization: `Bearer ${accessToken}`
            };
            try {
                const response = await axios.post(getUserListRoute, {}, { headers });
                console.log(response.data);
                setUserList(response.data.data);
            } catch (error) {
                console.error(error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchUserList();
    }, []);
    function calculateDifference(providedDate) {
        const now = new Date();
        const date = new Date(providedDate);
        const differenceInMilliseconds = now.getTime() - date.getTime();

        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes };
    }
    return (
        <div className="w-1/5 bg-gray-800 text-white">
            <div className="p-4 border-b border-gray-700">
                <h1 className="text-xl font-semibold">Chats</h1>
            </div>
            <div className="p-4">
                {/* List of chats */}
                {
                    isLoading && <div className='flex justify-center items-center h-[50vh] '>
                        <img src={'/loader.svg'} alt="loader" className='w-24 h-24' />
                    </div>
                }
                {!isLoading && userList &&  userList.length == 0 && <h1 className="text-lg font-semibold text-center">No chats found</h1>}
                {
                    userList?.map((user) => (
                        <div className="flex items-center justify-between space-x-4 mb-2 border border-gray-500 cursor-pointer p-2 hover:bg-gray-900 rounded-lg " key={user._id} onClick={() => udpatedSelectedUser(user)}>
                            <div className='flex space-x-4'>
                                <div className="w-10 h-10 rounded-full bg-gray-700">
                                    <img src={user.userDetails.avatar} alt={user.userDetails.fullname} className='rounded-full' /></div>
                                <div>
                                    <h2 className="text-lg font-semibold">{user.userDetails.fullname}</h2>
                                    <p className="text-sm text-gray-400">
                                        {user.lastMessage.slice(0, 5) + "..."} <br />
                                    </p>
                                </div>
                            </div>
                            <div>
                                {
                                    calculateDifference(user.lastMessageDate).days > 0 ? `${calculateDifference(user.lastMessageDate).days}  days ago` : calculateDifference(user.lastMessageDate).hours > 0 ? `${calculateDifference(user.lastMessageDate).hours} hours ago` : `${calculateDifference(user.lastMessageDate).minutes} minutes ago`
                                }
                            </div>
                        </div>
                    ))
                }

            </div>
        </div>
    )
}
