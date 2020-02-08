const tabs = document.querySelectorAll('.auth__tab')
const login = document.getElementById('login')
const register = document.getElementById('register')
const auth = document.querySelector('.auth')

const hash = document.location.hash

if (hash === '#register') {
    login.style.height = 0
    register.style.height = '100%'
    auth.style.height = '490px'
    tabs[1].querySelector('a').classList.add('auth__active')
    tabs[0].querySelector('a').classList.remove('auth__active')
}

tabs[0].addEventListener('click', () => {
    login.style.height = '100%'
    register.style.height = 0
    auth.style.height = '330px' 
    tabs[0].querySelector('a').classList.add('auth__active')
    tabs[1].querySelector('a').classList.remove('auth__active')
})

tabs[1].addEventListener('click', () => {
    login.style.height = 0
    register.style.height = '100%'
    auth.style.height = '490px'
    tabs[1].querySelector('a').classList.add('auth__active')
    tabs[0].querySelector('a').classList.remove('auth__active')
})

const inputFields = document.querySelectorAll('.auth__input-field')
// console.log(inputFields)
inputFields.forEach(inputField => {
    let input = inputField.querySelector('input')
    input.addEventListener('input', event => {
        if (input.value.length !== 0) inputField.querySelector('label').classList.add('active')
        else inputField.querySelector('label').classList.remove('active')
        // console.log(input.checkValidity())
    })
    // input.addEventListener('focusout', () => {
    //     if (!input.checkValidity()) {
    //         input.classList.add('invalid')
    //     }
    //     else input.classList.remove('invalid')
    // })
})