import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userLoginRoute } from '../Routes';
import toast, { Toaster } from 'react-hot-toast';

const Login = ({ authenticate, isAuthenticated }) => {

  const navigate = useNavigate();
  if(isAuthenticated){
    navigate('/');
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email address is invalid';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      // Handle successful login (e.g., call API)
      console.log("callin api");
      try {
        const response = await axios.post(userLoginRoute, { email, password });
        console.log('res data', response.data);
        document.cookie = `accessToken=${response.data.data.accessToken}`;
        document.cookie = `refreshToken=${response.data.data.refreshToken}`;
        toast.success(response.data.message);
        authenticate(true);
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || error.message);
      }
      console.log('Logged in with:', { email, password });

      // Clear form and errors
      setEmail('');
      setPassword('');
      setErrors({});
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-600 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-3xl font-bold text-white text-center mb-8">UT Messenger</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 text-gray-200 bg-gray-900 border rounded focus:outline-none focus:border-gray-500"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Johndoe@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 text-gray-200 bg-gray-900 border rounded focus:outline-none focus:border-gray-500"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="**********"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
        <Link to="/register">
          <div className="text-center mt-4">
            <button
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Register
            </button>
          </div>
        </Link>
      </div>
      <Toaster/>
    </div>
  );
};

export default Login;
