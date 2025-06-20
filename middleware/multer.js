import multer from 'multer';

import fs from 'fs';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.fieldname === 'image1' ||
        file.fieldname === 'image2' ||
        file.fieldname === 'image3' ||
        file.fieldname === 'image4' ||
        file.fieldname === 'image5' ||
        file.fieldname === 'highlightImage'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB max file size
    }
});

export default upload;