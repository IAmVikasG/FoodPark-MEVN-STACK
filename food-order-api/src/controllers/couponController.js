const asyncHandler = require('express-async-handler');
const CouponService = require('../services/couponService');
const ResponseFormatter = require('../utils/responseFormatter');
const validateRequest = require('../middleware/requestValidator');
const { couponValidation } = require('../utils/validation');

class CouponController
{
    static index = asyncHandler(async (req, res) =>
    {
        const { query } = req;
        const result = await CouponService.getAll(query);
        return ResponseFormatter.success(res, result, 'Coupons retrieved successfully');
    });

    static store = asyncHandler(async (req, res) =>
    {
        const validation = await validateRequest.validate(couponValidation.create, req, res);
        if (!validation.isValid) return;

        const coupon = await CouponService.create(req.body);
        return ResponseFormatter.success(res, coupon, 'Coupon created successfully', 201);
    });

    static update = asyncHandler(async (req, res) =>
    {
        const { id } = req.params;

        const validation = await validateRequest.validate(couponValidation.update, req, res);
        if (!validation.isValid) return;

        const coupon = await CouponService.update(id, req.body);
        return ResponseFormatter.success(res, coupon, 'Coupon updated successfully');
    });

    static delete = asyncHandler(async (req, res) =>
    {
        const { id } = req.params;

        await CouponService.delete(id);
        return ResponseFormatter.success(res, null, 'Coupon deleted successfully');
    });
}

module.exports = CouponController;
