export const optionsCookies = {
    maxAge: 1000 * 60 * parseInt(process.env.APPRATELIMITTIMING), // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true // Indicates if the cookie should be signed
};

export const excludedRoutes = [
    '/auth/signin'
];