export const host = "http://localhost:3000";

export const userRegisterRoute = `${host}/api/v1/users/register`;
export const userLoginRoute = `${host}/api/v1/users/login`;
export const userLogoutRoute = `${host}/api/v1/users/logout`;

export const getUserListRoute = `${host}/api/v1/messages/getuserlist`;
export const getMessageRoute = `${host}/api/v1/messages/getmessage`;
export const addMessageRoute = `${host}/api/v1/messages/addmessage`;
export const addDocumentRoute = `${host}/api/v1/messages/adddocument`;
export const editMessageRoute = `${host}/api/v1/messages/editmessage`;
export const deleteMessageRoute = `${host}/api/v1/messages/deletemessage`;

export const updateMessageReaction = `${host}/api/v1/messages/updatemessagereaction`;