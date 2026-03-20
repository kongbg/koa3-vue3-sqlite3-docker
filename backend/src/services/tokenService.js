import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import Token, { initTokenModel } from '../db/models/Token.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRES_IN = '7d';
const TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

class TokenService {
  async ensureModel() {
    await initTokenModel();
  }

  generateToken(payload) {
    const now = Date.now();
    const expiresAt = now + TOKEN_EXPIRES_IN_MS;

    const token = jwt.sign(
      { userId: payload.userId, username: payload.username },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRES_IN }
    );

    return {
      token,
      expiresAt,
    };
  }

  async saveToken(token, expiresAt) {
    await this.ensureModel();
    const tokenRecord = await Token.create({
      token,
      expires_at: expiresAt,
    });

    return tokenRecord.id;
  }

  async createToken(payload) {
    const tokenInfo = this.generateToken(payload);
    const tokenId = await this.saveToken(tokenInfo.token, tokenInfo.expiresAt);

    return {
      ...tokenInfo,
      tokenId,
    };
  }

  async verifyToken(token) {
    try {
      await this.ensureModel();
      const tokenRecord = await Token.findOne({
        where: { token },
      });

      if (!tokenRecord) {
        return null;
      }

      if (Date.now() > tokenRecord.expires_at) {
        await this.deleteToken(token);
        return null;
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      return null;
    }
  }

  async deleteToken(token) {
    await this.ensureModel();
    await Token.destroy({
      where: { token },
    });
  }

  async deleteUserTokens(userId) {
    await this.ensureModel();
    const tokens = await Token.findAll();

    for (const record of tokens) {
      try {
        const decoded = jwt.verify(record.token, JWT_SECRET);
        if (decoded.userId === userId) {
          await this.deleteToken(record.token);
        }
      } catch {
        await this.deleteToken(record.token);
      }
    }
  }

  async cleanExpiredTokens() {
    await this.ensureModel();
    const now = Date.now();
    const result = await Token.destroy({
      where: {
        expires_at: { [Op.lt]: now },
      },
    });
    return result;
  }

  getTokenExpiry() {
    return TOKEN_EXPIRES_IN_MS;
  }
}

export default new TokenService();
