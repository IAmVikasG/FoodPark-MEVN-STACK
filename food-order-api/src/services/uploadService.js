const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const CustomError = require('../utils/customError');

class UploadService
{
    constructor()
    {
        this.allowedMimeTypes = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/gif': 'gif'
        };

        this.maxFileSize = 5 * 1024 * 1024; // 5MB
    }

    // Generate unique filename with original extension
    generateFileName(originalName)
    {
        const timestamp = Date.now();
        const randomString = crypto.randomBytes(8).toString('hex');
        const fileExtension = path.extname(originalName);
        return `${timestamp}-${randomString}${fileExtension}`;
    }

    // Ensure upload directory exists
    ensureDirectory(directory)
    {
        const fullPath = path.join(process.cwd(), 'public/uploads', directory);
        if (!fs.existsSync(fullPath))
        {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        return fullPath;
    }

    // Configure multer storage
    configureStorage(directory)
    {
        return multer.diskStorage({
            destination: (req, file, cb) =>
            {
                const uploadPath = this.ensureDirectory(directory);
                cb(null, uploadPath);
            },
            filename: (req, file, cb) =>
            {
                const uniqueFileName = this.generateFileName(file.originalname);
                cb(null, uniqueFileName);
            }
        });
    }

    // File filter for allowed file types
    fileFilter(req, file, cb)
    {
        if (this.allowedMimeTypes[file.mimetype])
        {
            cb(null, true);
        } else
        {
            cb(new CustomError(`Invalid file type. Allowed types: ${Object.keys(this.allowedMimeTypes).join(', ')}`, 400), false);
        }
    }

    // Create multer upload instance with options
    createUploader(directory, options = {})
    {
        const config = {
            storage: this.configureStorage(directory),
            fileFilter: this.fileFilter.bind(this),
            limits: {
                fileSize: options.maxFileSize || this.maxFileSize
            }
        };

        return {
            single: (fieldName) => multer(config).single(fieldName),
            array: (fieldName, maxCount) => multer(config).array(fieldName, maxCount),
            fields: (fields) => multer(config).fields(fields)
        };
    }

    // Delete file helper
    async deleteFile(filePath)
    {
        try
        {
            const fullPath = path.join(process.cwd(), 'public/uploads', filePath);
            if (fs.existsSync(fullPath))
            {
                await fs.promises.unlink(fullPath);
                return true;
            }
            return false;
        } catch (error)
        {
            throw new CustomError(`Error deleting file: ${error.message}`, 500);
        }
    }

    // Process uploaded file
    processUploadedFile(file)
    {
        if (!file) return null;

        const relativePath = path.relative(
            path.join(process.cwd(), 'public/uploads'),
            file.path
        );

        return {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: relativePath,
            url: `/uploads/${relativePath.replace(/\\/g, '/')}` // Convert Windows paths to URL format
        };
    }
}

module.exports = new UploadService();
