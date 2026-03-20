import { Model, DataTypes } from 'sequelize';
import { getSequelize } from '../sequelize.js';

class Token extends Model {}

let initialized = false;

export async function initTokenModel() {
  if (initialized) return Token;
  
  const sequelize = await getSequelize();
  
  Token.init(
    {
      id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expires_at: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Token',
      tableName: 'tokens',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['token'],
        },
        {
          fields: ['expires_at'],
        },
      ],
    }
  );

  initialized = true;
  return Token;
}

export default Token;
