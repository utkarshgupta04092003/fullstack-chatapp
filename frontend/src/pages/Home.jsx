import React, { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import Profile from '../components/LeftSidebar';
import { useDispatch } from 'react-redux';
import { loginUser } from '../redux/userSlice';

function Home() {
  const dispatch = useDispatch();
  useEffect(() => {
    if (localStorage.getItem('user')) {
      const user = JSON.parse(localStorage.getItem('user'));
      dispatch(loginUser(user));
    }
  }, []);
  return (
    <div className="flex h-screen bg-gray-200">
      {/* profile section */}
      <Profile />
      {/* Sidebar */}
      <Sidebar />
      {/* Chat area */}
      <ChatMessage />
    </div>
  );
}

export default Home;
