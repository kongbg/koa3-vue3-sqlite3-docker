import { Model, DataTypes } from 'sequelize';
import { getSequelize } from '../sequelize.js';

class Setting extends Model {}

let initialized = false;

export async function initSettingModel() {
    if (initialized) return Setting;

    const sequelize = await getSequelize();

    Setting.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            setting_key: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            setting_value: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: 'Setting',
            tableName: 'settings',
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            indexes: [
                {
                    unique: true,
                    fields: ['setting_key'],
                },
            ],
        }
    );

    initialized = true;
    return Setting;
}

export default Setting;
