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
        logging: false,
        retry: {
            match: [/Deadlock/i],
            max: 3,
            backoffBase: 1000,
            backoffExponent: 1.5
        },
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


