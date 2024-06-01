- setting up env variables in cloudinary file
    - The code was executing before the server start, i figured out by config env variables in the cloudinary file before configuring cloudinary.

- when user details is not present in the db, in that case images are uploaded to server and after uploading to cloudinary it will unlink but when user is already exist, it is not unlink from the server
    - create a removeFiles for unlinking the file from the server and import this file in the cloudinary file as well as user controller file and call this function before when user is already in the db.

- writing aggregation function for getting the last 10 message between two user sorted by sendAt and also add sender and receiver details

- Downloading the cloudinary uploaded pdf

- Patch request is not working for editing the message

 