# Fullstack-Chatapp Backend (working)

create .env file and give these values
- PORT = 3000
- MONGO_URI=YOUR_MONGO_URL
- CORS_ORIGIN=*
- ACCESS_TOKEN_SECRET=""
- ACCESS_TOKEN_EXPIRY=1d
- REFRESH_TOKEN_SECRET=""
- REFRESH_TOKEN_EXPIRY=10d

- CLOUDINARY_CLOUD_NAME=''
- cLOUDINARY_API_KEY=''
- CLOUDINARY_API_SECRET=''



## Routes
- GET test server: '/api/v1/test'
- POST user register: '/api/v1/users/register'
- POST user login: '/api/v1/users/login'
- POST user logout: '/api/v1/users/logout'
- POST refreshAccessToken: '/api/v1/users/refreshaccesstoken'
- POST changepassword: '/api/v1/users/changepassword'
- PATCH updateAccountDetails: '/api/v1/users/updateaccountdetails'
- GET getCurrentUser: '/api/v1/users/getcurrentuser'
- PATCH updateAvatarImage: '/api/v1/users/updateprofileimage'
- PATCH udpateCoverImage: '/api/v1/users/updatecoverimage'