const { verifyAccessToken, isRevokedToken, verifyRefreshToken } = require('../helpers/tokenHelper');
const { fetchUserRolesAndPermissions } = require('../helpers/roleHelper');
const { handleTokenError } = require('../helpers/jwtErrorHelper');
const CustomError = require('../utils/customError');

const authenticate = async (req, res, next) =>
{
    try
    {
        // 1. Validate Authorization Header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) throw new CustomError('Authorization header missing or invalid', 401);

        // 2. Extract and Verify Access Token
        const accessToken = authHeader.split(' ')[1];
        await isRevokedToken(accessToken);

        const accessTokenPayload = await verifyAccessToken(accessToken);

        // 3. Validate Token Payload
        if (!accessTokenPayload?.userId) throw new CustomError('Invalid token payload', 401);

        // 4. Attach User Context to Request
        req.auth = {
            userId: accessTokenPayload.userId,
            tokenPayload: accessTokenPayload
        };

        next();
    } catch (error)
    {
        handleTokenError(error, res);
    }
};


const authorize = (allowedRoles) =>
{
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return async (req, res, next) =>
    {
        try
        {
            if (!req.auth.userId) throw new CustomError('User not authenticated', 401);

            const { userRoles, permissions } = await fetchUserRolesAndPermissions(req.auth.userId);

            const hasRole = roles.some(role => userRoles.includes(role));
            if (!hasRole)
            {
                throw new CustomError(
                    `Access denied. Required roles: ${roles.join(', ')}`,
                    403
                );
            }

            req.user = { id: req.auth.userId, roles: userRoles, permissions };
            next();
        } catch (error)
        {
            if (error instanceof CustomError)
            {
                return ResponseFormatter.error(res, error.message, error.statusCode);
            }
            next(error);
        }
    };
};

module.exports = { authenticate, authorize };
