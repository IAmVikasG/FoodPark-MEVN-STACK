const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const crypto = require('crypto');
const CustomError = require('../utils/customError');

const verifyAccessToken = async (token) =>
{
    if (!token) throw CustomError.unauthorized('Authentication required');
    await isRevokedToken(token);
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = async (token) =>
{
    if (!token) throw CustomError.unauthorized('Authentication required');
    await isRevokedToken(token);
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const generateTokens = (user) =>
{
    const accessToken = jwt.sign(
        { userId: user.id, jti: crypto.randomUUID() },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
    );

    const refreshToken = jwt.sign(
        { userId: user.id, jti: crypto.randomUUID() },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );

    return { accessToken, refreshToken };
};

const isRevokedToken = async (token) =>
{
    const decoded = decodeToken(token);
    if (!decoded?.jti) throw CustomError.unauthorized('Malformed token');

    const [blacklisted] = await pool.query(
        'SELECT * FROM revoked_tokens WHERE jti = ?',
        [decoded.jti]
    );

    if (blacklisted.length > 0) throw CustomError.unauthorized('Token revoked');
};

const decodeToken = (token) => jwt.decode(token);

const getExpireDate = (token) => new Date(decodeToken(token).exp * 1000);

const storeRefreshToken = async (userId, refreshToken) =>
{
    const expiresAt = getExpireDate(refreshToken);
    const decoded = decodeToken(refreshToken);

    await pool.query(
        'INSERT INTO refresh_tokens (user_id, jti, token, expires_at) VALUES (?, ?, ?, ?)',
        [userId, decoded.jti, refreshToken, expiresAt]
    );
};

const revokeToken = async (token, reason = 'logout') =>
{
    if (!token || typeof token !== 'string') throw new CustomError('Invalid token provided');

    const decoded = decodeToken(token) || {};
    if (!decoded.jti || !decoded.exp) throw new CustomError('Malformed token');

    const expiresAt = getExpireDate(token);

    const connection = await pool.getConnection();
    try
    {
        await connection.beginTransaction();

        // Check if already revoked
        const [existing] = await connection.execute(
            'SELECT 1 FROM revoked_tokens WHERE jti = ?',
            [decoded.jti]
        );

        if (!existing.length)
        {
            await connection.execute(
                `INSERT INTO revoked_tokens (jti, token, reason, expires_at)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE reason = VALUES(reason), expires_at = VALUES(expires_at)`,
                [decoded.jti, token, reason, expiresAt]
            );

            await connection.execute(
                'DELETE FROM refresh_tokens WHERE jti = ?',
                [decoded.jti]
            );
        }

        await connection.commit();
    } catch (error)
    {
        await connection.rollback();
        throw new CustomError('Failed to revoke token', 500);
    } finally
    {
        connection.release();
    }
};

const revokeAllTokens = async (userId) =>
{
    if (!Number.isInteger(userId) || userId <= 0) throw new CustomError('Invalid user ID');

    const connection = await pool.getConnection();
    try
    {
        await connection.beginTransaction();

        // Move active tokens to revoked
        await connection.execute(
            `INSERT INTO revoked_tokens (jti, token, reason, expires_at)
             SELECT r.jti, r.token, 'security', r.expires_at
             FROM refresh_tokens r
             WHERE r.user_id = ?
             ON DUPLICATE KEY UPDATE reason = VALUES(reason), expires_at = VALUES(expires_at)`,
            [userId]
        );

        // Delete from active tokens
        await connection.execute(
            'DELETE FROM refresh_tokens WHERE user_id = ?',
            [userId]
        );

        await connection.commit();
    } catch (error)
    {
        await connection.rollback();
        throw new CustomError('Failed to revoke all tokens', 500);
    } finally
    {
        connection.release();
    }
};


module.exports = {
    verifyAccessToken,
    verifyRefreshToken,
    generateTokens,
    isRevokedToken,
    storeRefreshToken,
    revokeToken,
    revokeAllTokens,
    decodeToken
};
