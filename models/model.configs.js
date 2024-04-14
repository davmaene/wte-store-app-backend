import { DataTypes, Model } from 'sequelize'
import { Configs } from '../configs/configs.js';

export const Config = Configs.define('__tbl_configs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true,
    },
    taux_change: DataTypes.FLOAT,
    commission_price: DataTypes.FLOAT

}, { paranoid: true, timestamps: false, freezeTableName: true });

Config.sync({ alter: true })
    .then(() => {
        console.log('=======> Cerated done `table Config` ');
    })
    .catch((error) => {
        console.error('Une erreur s\'est produite lors de la création de la table :', error);
    });
