var bodyParser = require('body-parser')
const routes = require('express').Router()

const multer = require('multer')
const multerConfig = require('../config/multer')

const UserController = require('../controllers/UserController')
//User Image
const UserImageController = require('../controllers/UserImageController')
//session
const SessionController = require('../controllers/SessionController')

//Cliente
const ClientController = require('../controllers/ClientController')
const ImageProductController = require('../controllers/ImageProductController')

//API
/* Forgot e Recuperação de senha */
routes.post('/api/forgot', UserController.forgot)
routes.post('/api/reset_password', UserController.reset)

//somente superuser
routes.get('/api/user', UserController.index)
routes.post('/api/user', UserController.store)
routes.put('/api/user', UserController.update)
routes.delete('/api/user/:user_id', UserController.destroy)
routes.get('/api/user/:user_id', UserController.single)
routes.post('/api/user/image/:user_id', multer(multerConfig).single('file'), UserImageController.store)
routes.put('/api/user/image', multer(multerConfig).single('file'), UserImageController.edit)
routes.post('/api/forgot', UserController.forgot)
routes.post('/api/reset', UserController.reset)

//Client
routes.post('/api/client', ClientController.insert)
routes.post('/api/client-password', ClientController.insert)

//session
routes.post(`/api/login`, SessionController.store)

module.exports = routes
