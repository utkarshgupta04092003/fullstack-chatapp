import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname+"-"+req.body?.username?.toLowerCase()+'.png');
    },
});

export const upload = multer({ storage: storage });
