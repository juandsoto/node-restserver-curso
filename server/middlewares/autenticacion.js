const jwt = require('jsonwebtoken');
//========================
//Verificar Token
//========================
let verificaToken = (req, res, next) => {
    //req.get(nombreDelHeader)
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
}

//========================
//Verificar AdminRole
//========================
let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role === 'USER_ROLE') {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es admin'
            }
        });
    }
    next();
}

module.exports = {
    verificaToken,
    verificaAdmin_Role
};