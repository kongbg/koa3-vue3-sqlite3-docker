import { Model, DataTypes } from 'sequelize';
import { getSequelize } from '../sequelize.js';

class User extends Model {
    toJSON() {
        const values = { ...this.get() };
        delete values.password;
        return values;
    }
}

let initialized = false;

export async function initUserModel() {
    if (initialized) return User;

    const sequelize = await getSequelize();

    User.init(
        {
            id: {
                type: DataTypes.STRING(36),
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4,
            },
            username: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            avatar: {
                type: DataTypes.STRING(500),
                allowNull: true,
                defaultValue: null,
            },
            is_first_login: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'users',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                {
                    unique: true,
                    fields: ['username'],
                },
            ],
        }
    );

    initialized = true;
    return User;
}

export default User;
