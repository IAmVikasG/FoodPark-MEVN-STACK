const asyncHandler = require('express-async-handler');
const CouponService = require('../services/couponService');
const ResponseFormatter = require('../utils/responseFormatter');
const validateRequest = require('../middleware/requestValidator');
const { couponValidation } = require('../utils/validation');

class CouponController
{
    static index = asyncHandler(async (req, res) =>
    {
        const options = {
            page: req.query.page,
            perPage: req.query.perPage,
            searchQuery: req.query.search,
            sortKey: req.query.sortKey,
            sortDirection: req.query.sortDirection,
            filters: req.query.filters ? JSON.parse(req.query.filters) : {},
        };

        const coupons = await CouponService.getAll(options);
        return ResponseFormatter.success(res, coupons, 'Coupons retrieved successfully');
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
