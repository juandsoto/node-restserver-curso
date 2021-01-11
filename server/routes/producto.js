const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();
let Producto = require('../models/producto');

/**
 * Obtener productos
 */
app.get('/producto', verificaToken, (req, res) => {

    const desde = Number(req.query.desde) || 0;
    const limite = Number(req.query.limite) || 5;

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

/**
 * Obtener un producto por ID
 */
app.get('/producto/:id', verificaToken, (req, res) => {
    Producto.findById(req.params.id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {
            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El producto no existe'
                    }
                });
            }
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                producto
            });
        });
});

app.post('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex, disponible: true })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

/**
 * Crear un nuevo producto
 */
app.post('/producto', verificaToken, (req, res) => {
    let producto = new Producto({
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        disponible: req.body.disponible,
        categoria: req.body.categoria,
        usuario: req.usuario._id
    });
    producto.save((err, productoDB) => {
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.status(201).json({
            ok: true,
            message: 'Producto creado',
            producto: productoDB
        })
    })
});

/**
 *  Actualizar un producto
 */
app.put('/producto/:id', verificaToken, (req, res) => {

    const nuevoProducto = {
        nombre: req.body.nombre,
        precioUni: req.body.precioUni,
        descripcion: req.body.descripcion,
        categoria: req.body.categoria,
        usuario: req.usuario._id,
    }
    Producto.findByIdAndUpdate(req.params.id, nuevoProducto, { new: true, runValidators: true, useFindAndModify: false }, (err, productoDB) => {
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            message: 'Producto Actualizado',
            producto: productoDB
        });
    });
});

/**
 *  Eliminar un producto
 */
app.delete('/producto/:id', verificaToken, (req, res) => {
    Producto.findByIdAndUpdate(req.params.id, { disponible: false }, { new: true, runValidators: true, useFindAndModify: false }, (err, productoDB) => {
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            });
        }
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            message: 'El producto ya no esta disponible',
            producto: productoDB
        });
    });
});



module.exports = app;