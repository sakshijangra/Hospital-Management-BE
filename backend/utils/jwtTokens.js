export const generateToken = (user,message,statusCode,res) => {
    const token = user.generateJsonWebToken();
     let cookieName = "";
    if (user.role === "Doctor") {
        cookieName = "doctorToken";
    } else if (user.role === "Patient") {
        cookieName = "patientToken";
    } else {
        cookieName = "adminToken";
    }
    res.status(statusCode).cookie(cookieName, token, {
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRES) * 24 * 60 * 60 * 1000),
        httpOnly : true

    }).json({
        success : true,
        message,
        user,
        token,
    })
}