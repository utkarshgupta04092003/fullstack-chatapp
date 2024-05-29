import axios from 'axios';
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import { userLogoutRoute } from '../Routes';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const user = useSelector(state => state.user.user);
    const [isOpen, setIsOpen] = useState(true);
    const navigate = useNavigate();
    const logoutUser = async () => {
        console.log("logout called")
        localStorage.removeItem('user');
        // call the logout api
        const headers = {
            Authorization: `Bearer ${user.accessToken}`
        };
        const response = await axios.post(userLogoutRoute, {}, { headers });
        console.log("logout response", response.data);
        
        navigate('/login');
    }
    return (
        <div className='flex flex-col justify-between text-center p-4  bg-gray-900 w-[80px]'>
            <h2 className='text-white font-extrabold text-2xl'>UT</h2>
            <div >
                {
                    isOpen && <div className='text-white relative text-left rounded-lg border border-gray-600 transition-all duration-1000 ease-in-out w-[100px]'>
                        <div className='rounded-t-lg hover:rounded-lg p-2 bg-gray-800 z-10 cursor-pointer hover:text-black hover:bg-white '>Profile </div>
                        <div className='rounded-b-lg hover:rounded-lg p-2 bg-gray-800 z-10 cursor-pointer hover:text-black hover:bg-white' onClick={logoutUser}>Logout</div>
                    </div>
                }
                <div className="w-8 h-6 rounded-full bg-gray-700 m-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <img src={user?.avatar} alt="" className='rounded-full' />
                </div>
            </div>
        </div>
    )
}
