import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import LeftSideBar from '../components/LeftSidebar';
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
  const [selectedUser, setSelectedUser] = useState(null);
  const udpatedSelectedUser = (user) => {
    console.log('object', user)
    setSelectedUser(user);
  }
  return (
    <div className="flex h-screen bg-gray-200">
      {/* profile section */}
      <LeftSideBar />
      {/* Sidebar */}
      <Sidebar  udpatedSelectedUser={udpatedSelectedUser}/>
      {/* Chat area */}
      <ChatMessage  />
    </div>
  );
}

export default Home;
