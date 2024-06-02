import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addDocument,
    addMessage,
    deleteMessage,
    editMessage,
    getMessage,
    getUserList,
    updateMessageReaction,
} from "../controllers/message.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/addmessage").post(verifyJWT, addMessage);
router
    .route("/adddocument")
    .post(verifyJWT, upload.single("photos"), addDocument);
router.route("/deletemessage").delete(verifyJWT, deleteMessage);
router.route("/editmessage").post(verifyJWT, editMessage);

router.route("/getmessage").post(verifyJWT, getMessage);
router.route("/getuserlist").post(verifyJWT, getUserList);
router.route("/updatemessagereaction").post(verifyJWT, updateMessageReaction);
export default router;
