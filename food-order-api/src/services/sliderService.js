const Slider = require('../models/Slider');
const logger = require('../utils/logger');
const CustomError = require('../utils/customError');
const uploadService = require('../services/uploadService');

class SliderService
{
    static async getAll(options)
    {
        return await Slider.getAll(options);
    }

    static async create(data)
    {
        try
        {
            const {
                offer,
                title,
                subtitle,
                description,
                button_link,
                status,
                created_by,
                file
            } = data;

            // Process the uploaded file
            const fileInfo = file ? uploadService.processUploadedFile(file) : null;

            // Create slider with file info
            return await Slider.create({
                offer,
                title,
                subtitle,
                description,
                button_link,
                status,
                created_by,
                image_url: fileInfo?.path || null
            });

        } catch (error)
        {
            // If there was an uploaded file, delete it since the transaction failed
            if (data.file)
            {
                try
                {
                    await uploadService.deleteFile(data.file.path);
                } catch (deleteError)
                {
                    logger.error('Error deleting file after failed slider creation:', deleteError);
                }
            }

            logger.error('Error creating slider:', error);
            throw new CustomError('Error creating slider', 500);
        }
    }


    static async update(id, data)
    {
        try
        {
            const existingSlider = await Slider.findById(id);

            if (!existingSlider)
            {
                throw CustomError.notFound(`Slider with ID ${id} not found`);
            }

            const {
                offer,
                title,
                subtitle,
                description,
                button_link,
                status,
                created_by,
                file
            } = data;

            // Process the uploaded file
            const fileInfo = file ? uploadService.processUploadedFile(file) : null;

            await Slider.update(id, {
                offer,
                title,
                subtitle,
                description,
                button_link,
                status,
                created_by,
                image_url: fileInfo?.path || null
            });

            return { message: 'Slider updated successfully' };
        } catch (error)
        {
            logger.error('Error updating slider:', error);
            throw CustomError.internal('Error updating slider');
        }
    }


    static async delete(id)
    {
        try
        {
            const existingSlider = await Slider.findById(id);

            if (!existingSlider)
            {
                throw CustomError.notFound(`Slider with ID ${id} not found`);
            }

            await Slider.delete(id);

            return { message: 'Slider deleted successfully' };
        } catch (error)
        {
            logger.error('Error deleting slider:', error);
            throw CustomError.internal('Error deleting slider');
        }
    }
}

module.exports = SliderService;
