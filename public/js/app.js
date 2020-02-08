const menu = document.querySelector('.header__menu')
const bars = document.querySelector('.header__bars')

bars.addEventListener('click', event => {
    if (bars.classList.contains('active')) {
        bars.classList.remove('active')
        menu.style.transform = 'translateX(100%)'
    } else {
        bars.classList.add('active')
        menu.style.transform = 'translateX(0)'
    }
})