"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStorage = exports.getFileUrl = exports.cleanupOldFiles = exports.uploadSingle = exports.uploadConfig = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./env");
const logger_util_1 = require("../utils/logger.util");
const ensureUploadDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
        logger_util_1.logger.info(`Created upload directory: ${dir}`);
    }
};
const localStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadType = req.query.type || 'misc';
        const validTypes = ['tasks', 'contributions', 'documents', 'ground_reality', 'scam_warnings', 'misc'];
        if (!validTypes.includes(uploadType)) {
            uploadType = 'misc';
        }
        if (!req.query.type) {
            if (req.path.includes('/tasks')) {
                uploadType = 'tasks';
            }
            else if (req.path.includes('/contribute')) {
                uploadType = 'contributions';
            }
            else if (req.path.includes('/documents')) {
                uploadType = 'documents';
            }
        }
        const uploadPath = path_1.default.join(env_1.env.UPLOAD_DIR, uploadType);
        ensureUploadDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `${uniqueSuffix}${ext}`);
    }
});
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
};
exports.uploadConfig = (0, multer_1.default)({
    storage: localStorage,
    limits: {
        fileSize: env_1.env.MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter: imageFileFilter,
});
const uploadSingle = (fieldName = 'image') => {
    return exports.uploadConfig.single(fieldName);
};
exports.uploadSingle = uploadSingle;
const cleanupOldFiles = (directory, maxAgeInDays = 30) => {
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000;
    const uploadPath = path_1.default.join(env_1.env.UPLOAD_DIR, directory);
    if (!fs_1.default.existsSync(uploadPath)) {
        return;
    }
    fs_1.default.readdir(uploadPath, (err, files) => {
        if (err) {
            logger_util_1.logger.error(`Error reading upload directory ${uploadPath}:`, err);
            return;
        }
        files.forEach(file => {
            const filePath = path_1.default.join(uploadPath, file);
            fs_1.default.stat(filePath, (err, stats) => {
                if (err) {
                    logger_util_1.logger.error(`Error getting stats for file ${filePath}:`, err);
                    return;
                }
                if (Date.now() - stats.mtime.getTime() > maxAge) {
                    fs_1.default.unlink(filePath, (err) => {
                        if (err) {
                            logger_util_1.logger.error(`Error deleting old file ${filePath}:`, err);
                        }
                        else {
                            logger_util_1.logger.info(`Deleted old file: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
};
exports.cleanupOldFiles = cleanupOldFiles;
const getFileUrl = (filename, type = 'misc') => {
    if (!filename)
        return '';
    if (filename.startsWith('http://') || filename.startsWith('https://'))
        return filename;
    if (filename.startsWith('/uploads/')) {
        return filename.replace('/uploads/', '/');
    }
    if (env_1.env.AWS_S3_BUCKET) {
        return `https://${env_1.env.AWS_S3_BUCKET}.s3.${env_1.env.AWS_REGION}.amazonaws.com/${type}/${filename}`;
    }
    return `/${type}/${filename}`;
};
exports.getFileUrl = getFileUrl;
const initStorage = () => {
    const uploadDirs = ['tasks', 'contributions', 'documents', 'ground_reality', 'scam_warnings', 'misc'];
    uploadDirs.forEach(dir => {
        ensureUploadDir(path_1.default.join(env_1.env.UPLOAD_DIR, dir));
    });
    logger_util_1.logger.info('Storage configuration initialized');
};
exports.initStorage = initStorage;
//# sourceMappingURL=storage.js.map