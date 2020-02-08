const modal = document.querySelector('.modal')
const modalRem = document.querySelector('.modalRem')
const btns = document.querySelectorAll('.modal-btn')
const close = document.querySelector('.modal-close')
const btnsRem = document.querySelectorAll('.modalRem-btn')
const closeRem = document.querySelector('.modalRem-close')
const blackout = document.querySelector('.blackout')
const albums = document.querySelector('.albums')

let isModalOpen = false
let currentAlbum

const toggle = document.querySelector('.modal-toggle')
const check = document.querySelector('.modal-check')

const add = document.querySelector('.albums__add-icon')
const addBtns = document.querySelectorAll('.albums__add-btn')

albums.addEventListener('click', event => {
    if (event.target.dataset.update && !isModalOpen) {
        isModalOpen = true
        currentAlbum = event.target.parentNode.parentNode
        currentAlbum.style.height = 0
        modal.style.width = currentAlbum.offsetWidth + 'px'
        modal.style.top = currentAlbum.offsetTop + 'px'
        modal.style.left = currentAlbum.offsetLeft + 'px'
        modal.querySelectorAll('input')[0].value = event.target.dataset.update
        document.getElementById('lastname').value = event.target.dataset.update
        if ((+currentAlbum.dataset.id + 1) % 4 === 0) albums.style.marginBottom = '300px'
        setTimeout(() => {       
            modal.style.height = '250px'
            modal.style.padding = '25px'
        }, 400)
    } else {
        if (!event.target.dataset.name) return
        blackout.style.display = 'block'
        modalRem.querySelectorAll('input')[0].value = event.target.dataset.name
        modalRem.style.height = '250px'
        modalRem.style.padding = '25px'
    }
})

close.addEventListener('click', closeModal)
btns[1].addEventListener('click', closeModal)

function closeModal(event) {
    event.preventDefault()
    modal.style.height = '0'
    modal.style.padding = '0'
    modal.querySelectorAll('input')[0].value = ''
    document.getElementById('lastname').value = ''
    check.checked = true
    toggle.style.height = '30px'
    toggle.style.marginBottom = '20px'
    if ((+currentAlbum.dataset.id + 1) % 4 === 0) albums.style.marginBottom = '50px'
    setTimeout(() => {
        currentAlbum.style.height = '250px'
        currentAlbum = null
        modal.style.width = 'auto'
        isModalOpen = false
    },500)
}

closeRem.addEventListener('click', closeModalRem)
btnsRem[1].addEventListener('click', closeModalRem)

function closeModalRem(event) {
    event.preventDefault()
    modalRem.style.height = '0'
    modalRem.style.padding = '0'
    modalRem.querySelectorAll('input')[0].value = ''
    blackout.style.display = 'none'
}

toggle.addEventListener('click', event => {
    if (check.checked) {
        check.checked = false
        setTimeout(() => {
            toggle.style.height = 0
            toggle.style.marginBottom = 0
        }, 600)
    } 
})

add.addEventListener('click', event => {
    add.style.transform = 'translateY(-100%)'
})

addBtns[1].addEventListener('click', event => {
    event.preventDefault()
    add.style.transform = 'translateY(0)'
})