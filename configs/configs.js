import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const { APPDBNAME, APPDBUSERNAME, APPDBPASSWORD, APPDBPORT, APPDBHOST, APPDBDIALECT } = process.env;

export const Configs = new Sequelize(
    APPDBNAME,
    APPDBUSERNAME,
    APPDBPASSWORD,
    {
        port: APPDBPORT,
        host: APPDBHOST,
        dialect: APPDBDIALECT || "mysql",
        logging: true,
        redisConfigsdialectOptions: {
            lockTimeout: 5000
        },
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);


