import React, { useState } from 'react';
import { userRegisterRoute } from '../Routes';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Register = ({isAuthenticated}) => {

  const navigate = useNavigate();
  if(isAuthenticated){
    navigate('/');
  }

  const [form, setForm] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    avatar: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({
      ...form,
      [name]: files ? files[0] : value
    });
  };

  const validate = () => {
    const errors = {};
    if (!form.fullname) errors.fullname = 'Full name is required';
    if (!form.username) errors.username = 'Username is required';
    if (!form.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Email address is invalid';
    }
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    if (!form.avatar) {
      errors.avatar = 'Avatar image is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const formData = new FormData();
      formData.append('fullname', form.fullname);
      formData.append('username', form.username);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('avatar', form.avatar);

      try {
        setLoading(true);
        console.log("registering");
        const response = await axios.post(userRegisterRoute, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Registered successfully:', response.data);
        toast.success('Registered successfully');
        // Clear form and errors
        setForm({
          fullname: '',
          username: '',
          email: '',
          password: '',
          avatar: null
        });
        setErrors({});
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        toast.error('Registration failed', error.response?.data);
      }
      finally {
        setLoading(false);
      }
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-gradient-to-b from-gray-800 to-black p-8 rounded-lg shadow-lg max-w-md w-full border border-gray-600">
        <h2 className="text-3xl font-bold text-white text-center mb-8">VI Messenger</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="fullname">
              Full Name
            </label>
            <input
              className="w-full px-3 py-2 text-gray-200 bg-gray-900 border rounded focus:outline-none focus:border-gray-500"
              id="fullname"
              type="text"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              placeholder="John Doe"
            />
            {errors.fullname && <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="w-full px-3 py-2 text-gray-200 bg-gray-900 border rounded focus:outline-none focus:border-gray-500"
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full px-3 py-2 text-gray-200 bg-gray-900 border rounded focus:outline-none focus:border-gray-500"
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="johndoe@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="w-full px-3 py-2 text-gray-200 bg-gray-900 border rounded focus:outline-none focus:border-gray-500"
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="**********"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="avatar">
              Avatar Image
            </label>
            <input
              className="w-full px-3 py-2 text-gray-200 bg-gray-900 border rounded focus:outline-none focus:border-gray-500"
              id="avatar"
              type="file"
              name="avatar"
              onChange={handleChange}
            />
            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit" disabled={loading}
            >
              Register
            </button>
          </div>
        </form>
      </div>
      <Toaster />
    </div>
  );
};

export default Register;
