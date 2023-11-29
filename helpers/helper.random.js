import randomstring from "randomstring";
import dotenv from 'dotenv';

dotenv.config();

export const generateIdentifier = ({ prefix }) => {
    const pfx = Math.floor(Math.random() * 1000);
    const sfx = Math.floor(Math.random() * 100);
    
    return `${prefix ? prefix : "BLBL"}-${pfx}-${sfx}`;
};

export const generateFilename = ({ prefix, tempname }) => {
    const extension = tempname.substring(tempname.lastIndexOf("."));
    return `${prefix ? prefix + "-" : ""}${randomstring.generate()}${extension}`;
};

export const randomLongNumber = ({ length }) => {
    const len = length && !isNaN(parseInt(length)) ? length : 6;
    const ret = [];

    for(let k = 0; k < len; k++) ret.push(
       Math.floor( Math.random() * 10 )
    );
    
    let m = ret.join().toString();
    m = m.replace(/,/g, "");
    return m.trim();
};

export const randomLongNumberWithPrefix = ({ length }) => {
    const prefix = "BALABALA";
    const len = length && !isNaN(parseInt(length)) ? length : 6;
    const ret = [];

    for(let k = 0; k < len; k++) ret.push(
       Math.floor( Math.random() * 10 )
    );
    
    let m = ret.join().toString();
    m = m.replace(/,/g, "");
    return `${prefix}${m.trim()}`;
};

export const randomString = () => randomstring.generate({ length: 32 })
