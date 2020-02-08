const photos = document.querySelectorAll('.album__image')
const album = document.querySelector('.album__item')
const blackout = document.querySelector('.blackout')
const view = document.querySelector('.album__open')
const next = document.querySelector('.album__next')
const prev = document.querySelector('.album__prev')
const slide1 = document.querySelector('.album__slide1')
const slide2 = document.querySelector('.album__slide2')
const inputId = document.querySelector('.input-id')
let isOpen = false
let isCurrentSlide1
let isSlidingBlocked = false
let isOpeningBlocked = false

const modalRem = document.querySelector('.modalRem')
const btnsRem = document.querySelectorAll('.modalRem-btn')
const closeRem = document.querySelector('.modalRem-close')
const remove = document.getElementById('remove')
const move = document.getElementById('move')
const title = document.querySelector('.album__title')
const modalTile = document.querySelector('.modal-title')
let isRemove = true 
let isSome = false

const someRemove = document.getElementById('some-remove')
const someMove = document.getElementById('some-move')
const trash = document.querySelector('.album__trash')
const send = document.querySelector('.album__send')
const cancel = document.querySelector('.album__cancel')

const add = document.querySelector('.album__add-icons')
const addInput = document.getElementById('photo')
const addSpan = document.querySelector('.album__add-text')
const addBtns = document.querySelectorAll('.album__add-btn')

album.addEventListener('click', event => {
    if (event.target.tagName.toLowerCase() === 'img' && !isOpeningBlocked) {
        blackout.style.display = 'block'
        view.style.display = 'flex'
        const img = event.target.cloneNode(true)
        const currentId = +img.dataset.id
        slide2.style.clipPath = 'circle(0 at 50% 55%)'
        slide1.style.clipPath = 'circle(100vw at 50% 55%)'
        slide1.append(img)
        isCurrentSlide1 = true
        setTimeout(() => {
            slide1.querySelector('img').style.maxWidth = '100%'
        }, 300)
        if (currentId === photos.length - 1) next.classList.add('inactive')
        else next.classList.remove('inactive')
        if (currentId === 0) prev.classList.add('inactive')
        else prev.classList.remove('inactive')
        isOpen = true
        inputId.value = view.querySelector('img').dataset.mid
    }
    if (event.target.dataset.mid) {
        if (event.target.classList.contains('album__check-icon') && event.target.classList.contains('album__check--active')){
            event.target.classList.remove('album__check--active')
        } else {
            event.target.classList.add('album__check--active')
        }
    }
})

document.querySelector('.album__close').addEventListener('click', close)

document.addEventListener('keydown', event => {
    if (event.keyCode === 27 && isOpen) close()
    if (event.keyCode === 39 && isOpen) nextImg()
    if (event.keyCode === 37 && isOpen) prevImg()
})

next.addEventListener('click',nextImg)

prev.addEventListener('click', prevImg)

function close() {
    isOpen = false
    blackout.style.display = 'none'
    inputId.value = ''
    if (isCurrentSlide1) {
        slide1.querySelector('img').style.maxWidth = '0'
        setTimeout(() => {
            view.style.display = 'none'
            slide1.querySelector('img').remove()
        }, 600)
    } else {
        slide2.querySelector('img').style.maxWidth = '0'
        setTimeout(() => {
            view.style.display = 'none'
            slide2.querySelector('img').remove()
        }, 600)
    }
}

function nextImg() {
    if (isCurrentSlide1) {
        if (+slide1.querySelector('img').dataset.id < photos.length - 1 && !isSlidingBlocked) {
            changeSlide(slide1, slide2, true)
            isSlidingBlocked = true
            isCurrentSlide1 = false
        }
    } else {
        if (+slide2.querySelector('img').dataset.id < photos.length - 1 && !isSlidingBlocked) {
            changeSlide(slide2, slide1, true)
            isSlidingBlocked = true
            isCurrentSlide1 = true
        }
    }
}

function prevImg() {
    if (isCurrentSlide1) {
        if (+slide1.querySelector('img').dataset.id > 0 && !isSlidingBlocked) {
            changeSlide(slide1, slide2, false)
            isSlidingBlocked = true
            isCurrentSlide1 = false
        }
    } else {
        if (+slide2.querySelector('img').dataset.id > 0 && !isSlidingBlocked) {
            changeSlide(slide2, slide1, false)
            isSlidingBlocked = true
            isCurrentSlide1 = true
        }
    }
}

function changeSlide(currentSlide, nextSlide, further) {
    let id
    if (further) {
        currentSlide.style.clipPath = 'circle(0 at 10% 55%)'
        id = +currentSlide.querySelector('img').dataset.id + 1
    }
    else {
        currentSlide.style.clipPath = `circle(0% at 90% 55%)`
        id = +currentSlide.querySelector('img').dataset.id - 1
    }
    setTimeout(() => {
        currentSlide.querySelector('img').remove()
        inputId.value = view.querySelector('img').dataset.mid
        normalizeSlide(nextSlide, currentSlide)
    }, 1500)
    const img = photos[id].querySelector('img').cloneNode(true)
    img.style.maxWidth = '100%'
    nextSlide.append(img)
    setTimeout(() => {
        if (further) nextSlide.style.clipPath = 'circle(100vw at 90% 55%)'
        else nextSlide.style.clipPath = 'circle(100vw at 10% 55%)'
    }, 800)
    if (id === photos.length - 1) next.classList.add('inactive')
    else next.classList.remove('inactive')
    if (id === 0) prev.classList.add('inactive')
    else prev.classList.remove('inactive')
}

function normalizeSlide(currentSlide, nextSlide) {
    nextSlide.style.clipPath = 'circle(0 at 50% 55%)'
    currentSlide.style.clipPath = 'circle(100vw at 50% 55%)'
    isSlidingBlocked = false
}

remove.addEventListener('click', event => {
    modalRem.querySelectorAll('input')[0].value = view.querySelector('img').dataset.mid
    modalRem.style.height = '134px'
    modalRem.style.padding = '20px'
    modalTile.textContent = 'Удалить фото'
    btnsRem[0].textContent = 'Удалить'
    view.style.zIndex = 50
    const page = location.href.split('?')[1]
    modalRem.querySelector('form').action = `/album/remove/${title.textContent}?${page}`
})

move.addEventListener('click', event => {
    isRemove = false
    view.style.zIndex = 50
    modalRem.style.padding = '20px'
    modalRem.style.height = '240px'
    const page = location.href.split('?')[1]
    modalRem.querySelector('form').action = `/album/move/${title.textContent}?${page}`
    modalTile.textContent = 'Переместить фото'
    btnsRem[0].textContent = 'Сохранить'
    const pText = document.createElement('p')
    pText.classList.add('modal-text--mbutton')
    pText.textContent = 'Введите название альбома в который вы хотите переместить фото'
    modalRem.querySelector('.modal-body').prepend(pText)
    const input = document.createElement('input')
    input.classList.add('modal-input')
    input.name = 'name'
    modalRem.querySelector('form').prepend(input)
    modalRem.querySelectorAll('input')[1].value = view.querySelector('img').dataset.mid
})

closeRem.addEventListener('click', closeModalRem)
btnsRem[1].addEventListener('click', closeModalRem)

function closeModalRem(event) {
    event.preventDefault()
    modalRem.style.height = '0'
    modalRem.style.padding = '0'
    modalRem.querySelectorAll('input')[0].value = ''
    setTimeout(() => {
        view.style.zIndex = 200
    }, 500)
    if (!isRemove) {
        modalRem.querySelector('input').remove()
        modalRem.querySelector('p').remove()
        modalRem.querySelectorAll('input')[0].value = ''
        isRemove = true
    }
    if (isSome) {
        blackout.style.display = 'none'
    }
}


someRemove.addEventListener('click', event => {
    isOpeningBlocked = true
    trash.classList.add('album__check-visible')
    cancel.classList.add('album__check-visible')
    photos.forEach(photo => photo.classList.add('album__image-no-zoom'))
    document.querySelectorAll('.album__check').forEach(check => check.classList.add('album__check-visible'))
})

someMove.addEventListener('click', event => {
    isOpeningBlocked = true
    send.classList.add('album__check-visible')
    cancel.classList.add('album__check-visible')
    photos.forEach(photo => photo.classList.add('album__image-no-zoom'))
    document.querySelectorAll('.album__check').forEach(check => check.classList.add('album__check-visible'))
})

cancel.addEventListener('click', event => {
    isOpeningBlocked = false
    send.classList.remove('album__check-visible')
    trash.classList.remove('album__check-visible')
    cancel.classList.remove('album__check-visible')
    photos.forEach(photo => photo.classList.remove('album__image-no-zoom'))
    document.querySelectorAll('.album__check').forEach(check => {
        check.classList.remove('album__check-visible')
    })
    document.querySelectorAll('.album__check--active').forEach(icon => icon.classList.remove('album__check--active'))
})

trash.addEventListener('click', event => {
    isSome = true
    blackout.style.display = 'block'
    const checks = document.querySelectorAll('.album__check--active')
    checks.forEach((check, index) => {
        modalRem.querySelectorAll('input')[0].value += check.dataset.mid
        if (index < checks.length - 1) modalRem.querySelectorAll('input')[0].value += ','
    })
    modalRem.style.height = '134px'
    modalRem.style.padding = '20px'
    modalTile.textContent = 'Удалить фотографии'
    btnsRem[0].textContent = 'Удалить'
    view.style.zIndex = 50
    const page = location.href.split('?')[1]
    modalRem.querySelector('form').action = `/album/someremove/${title.textContent}?${page}`
})

send.addEventListener('click', event => {
    isSome = true
    isRemove = false
    blackout.style.display = 'block'
    const checks = document.querySelectorAll('.album__check--active')
    checks.forEach((check, index) => {
        modalRem.querySelectorAll('input')[0].value += check.dataset.mid
        if (index < checks.length - 1) modalRem.querySelectorAll('input')[0].value += ','
    })
    modalRem.style.padding = '20px'
    modalRem.style.height = '240px'
    modalTile.textContent = 'Переместить фотографии'
    btnsRem[0].textContent = 'Сохранить'
    const pText = document.createElement('p')
    pText.classList.add('modal-text--mbutton')
    pText.textContent = 'Введите название альбома в который вы хотите переместить фотографии'
    modalRem.querySelector('.modal-body').prepend(pText)
    const input = document.createElement('input')
    input.classList.add('modal-input')
    input.name = 'name'
    modalRem.querySelector('form').prepend(input)
    view.style.zIndex = 50
    const page = location.href.split('?')[1]
    modalRem.querySelector('form').action = `/album/somemove/${title.textContent}?${page}`
})

const error = document.querySelector('.error')

if (error) {
    setTimeout(() => {
        error.style.opacity = 0
        setTimeout(() => {
            error.style.display = 'none'
        }, 600)
    }, 1500)
}


add.addEventListener('click', event => {
    add.style.transform = 'translateY(-100%)'
})

addBtns[1].addEventListener('click', event => {
    event.preventDefault()
    add.style.transform = 'translateY(0)'
    addInput.files = null
    addSpan.textContent = 'Выберите фотографии'
})

addInput.addEventListener('change', (event) => {
    if (addInput.files) {
        addSpan.textContent = 'Выбрано фотографий: ' + addInput.files.length
        addBtns[0].classList.remove('hidden')
        addBtns[1].classList.remove('hidden')
    }
    else addSpan.textContent = 'Выберите фотографии'
})