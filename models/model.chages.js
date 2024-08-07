import { DataTypes, Model } from 'sequelize'
import { Configs } from '../configs/configs.js';
import dotenv from 'dotenv';

dotenv.config()

const { ESCAPESTRING } = process.env

export const Charges = Configs.define('__tbl_charges', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    manytimes: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: true
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: ESCAPESTRING,
        allowNull: true
    },
    charges: DataTypes.STRING,
    cout: DataTypes.FLOAT,
    currency: {
        type: DataTypes.STRING,
        defaultValue: "USD",
        allowNull: true
    }

}, { paranoid: true, timestamps: false, freezeTableName: true });

Charges.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Charges` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
