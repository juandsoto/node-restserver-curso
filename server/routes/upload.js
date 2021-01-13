const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// Este middleware hace que cualquier archivo que se este subiendo, se obtenga por medio de req.files
app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún archivo'
            }
        });
    }

    // Validar tipo
    let tiposValidos = ['productos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son '.concat(tiposValidos.join(', ')),
                param: tipo
            }
        });
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    // Se especifica el valor en body -> form-data
    let archivo = req.files.archivo;
    //Se obtiene la extension del archivo
    let extension = archivo.name.split('.').reverse().shift();
    //Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son '.concat(extensionesValidas.join(', ')),
                ext: extension
            }
        });
    }

    // Cambiar nombre al archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (tipo === 'usuarios') {
            return imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            eliminarImagen('usuarios', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            eliminarImagen('usuarios', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        // Si el usuario ya tiene una imagen, la borramos
        eliminarImagen('usuarios', usuarioDB.img);

        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioDB) => {
            res.json({
                ok: true,
                message: 'Imagen subida correctamente',
                usuario: usuarioDB,
                img: nombreArchivo
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            eliminarImagen('productos', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            eliminarImagen('productos', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }

        // Si el producto ya tiene una imagen, la borramos
        eliminarImagen('productos', productoDB.img);

        productoDB.img = nombreArchivo;
        productoDB.save((err, productoDB) => {
            res.json({
                ok: true,
                message: 'Imagen subida correctamente',
                producto: productoDB,
                img: nombreArchivo
            });
        });
    });
}


function eliminarImagen(tipo, nombreImagen) {
    // Si el usuario ya tiene una imagen, la borramos
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;