import { DataTypes, Model } from 'sequelize'
import { Configs } from '../configs/configs.js';

export const Charges = Configs.define('__tbl_charges', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    charges: DataTypes.STRING,
    cout: DataTypes.FLOAT

}, { paranoid: true, timestamps: false, freezeTableName: true });

Charges.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Config` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
