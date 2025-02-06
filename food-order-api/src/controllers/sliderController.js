const asyncHandler = require('express-async-handler');
const SliderService = require('../services/sliderService');
const ResponseFormatter = require('../utils/responseFormatter');
const uploadService = require('../services/uploadService');
const { sliderValidation } = require('../utils/validation');
const validateRequest = require('../middleware/requestValidator');

class SliderController
{
    static upload = uploadService.createUploader('sliders').single('image');
    /**
     * Get all sliders.
     */
    static index = asyncHandler(async (req, res) =>
    {
        const { query } = req;
        const sliders = await SliderService.getAll(query);
        return ResponseFormatter.success(
            res,
            sliders,
            'Sliders retrieved successfully'
        );
    });

    /**
     * Create a new slider.
     */
    static store = asyncHandler(async (req, res) =>
    {
        // First handle the file upload
        await new Promise((resolve, reject) =>
        {
            this.upload(req, res, (err) =>
            {
                if (err)
                {
                    return reject(err);
                }
                resolve();
            });
        });

        // Validate that a file was uploaded
        const fileValidation = validateRequest.checkCondition(
            req.file, // Check if the file exists
            'image',
            'Image file is required.', // Error message
            res
        );

        if (!fileValidation.isValid) return; // If file is missing, response is already sent

        // Validate the rest of the fields using Joi
        const validation = await validateRequest.validate(sliderValidation.create, req, res);
        if (!validation.isValid) return; // Response already sent by validate function

        // After successful upload and validation, create slider
        const result = await SliderService.create({
            ...req.body,
            created_by: req.auth.userId,
            file: req.file, // Pass the uploaded file info to service
        });

        return ResponseFormatter.success(res, result, 'Slider created successfully', 201);
    });


    /**
     * Update an existing slider.
     */
    static update = asyncHandler(async (req, res) =>
    {

        const { id } = req.params; // Slider ID from URL
        let uploadedFile;

        // Handle optional file upload
        await new Promise((resolve, reject) =>
        {
            this.upload(req, res, (err) =>
            {
                if (err) reject(err);
                uploadedFile = req.file; // Capture the uploaded file if it exists
                resolve();
            });
        });

        // Validate the request body
        const validation = await validateRequest.validate(sliderValidation.update, req, res);
        if (!validation.isValid) return; // Validation failure response already sent

        // Prepare slider data for update
        const sliderData = {
            ...req.body, // Updated fields from the request body
            created_by: req.auth.userId, // Add the current user's ID
        };

        // Add file data if a new image is uploaded
        if (uploadedFile)
        {
            sliderData.file = uploadedFile;
        }

        // Call the service to update the slider
        await SliderService.update(id, sliderData);

        return ResponseFormatter.success(
            res,
            null,
            'Slider updated successfully'
        );
    });


    /**
     * Delete a slider.
     */
    static delete = asyncHandler(async (req, res) =>
    {
        const { id } = req.params; // Assuming slider ID is passed as a URL parameter
        await SliderService.delete(id);
        return ResponseFormatter.success(
            res,
            null,
            'Slider deleted successfully'
        );
    });
}

module.exports = SliderController;
