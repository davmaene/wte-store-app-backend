import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config()

export const hashPWD = async ({ plaintext }, cb) => {
    return bcrypt.hash(plaintext, 10);
}

export const comparePWD = async ({ plaintext, hashedtext }, cb) => {
    try {
        const valide = await bcrypt.compare(plaintext, hashedtext)
        if(valide) cb(undefined, valide)
        else cb('error pwds not matching', undefined)
    } catch (error) {
        return cb(error, undefined)
    }
}
