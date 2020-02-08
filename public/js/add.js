const addInput = document.getElementById('photo')
const addSpan = document.querySelector('.add__text')
const addPreview = document.getElementById('preview')

addInput.addEventListener('change', (event) => {
    changeFiles(addInput.files)
})

function changeFiles(files) {
    if (files) {
        addSpan.textContent = 'Выбрано фотографий: ' + files.length
        addPreview.classList.remove('hidden')
        document.querySelector('.add__btn').classList.remove('hidden')
    }
    else addSpan.textContent = 'Выберите фотографии'
}

const addPrev = document.querySelector('.add__preview')
document.getElementById('preview').addEventListener('click', (event) => {
    event.preventDefault()
    addPrev.classList.remove('hidden')
    if (addInput.files.length !== 0) previewFiles(addInput.files)
})

function previewFiles(files) {
    addPrev.innerHTML = ''
    for (let i=0, f; f = files[i]; i++ ) {
        const reader = new FileReader();
        reader.onload = (function (theFile) {
            return function (e) {
                var span = document.createElement('span')
                span.innerHTML = ['<img class="add__photo" title="', escape(theFile.name), '" src="', e.target.result, '" />'].join('')
                addPrev.insertBefore(span, null)
            };
        })(f);
        reader.readAsDataURL(f)
    }
}


const dropArea = document.querySelector('.add__field')

dropArea.addEventListener('dragenter', (event) => {
    preventDefaults(event)
    highlight(event)
}, false)

dropArea.addEventListener('dragover', (event) => {
    preventDefaults(event)
    highlight(event)
}, false)

dropArea.addEventListener('dragleave', (event) => {
    preventDefaults(event)
    unhighlight(event)
}, false)

dropArea.addEventListener('drop', (event) => {
    preventDefaults(event)
    unhighlight(event)
    handleDrop(event)
}, false)

function preventDefaults (e) {
    e.preventDefault()
    e.stopPropagation()
}

function highlight(e) {
    dropArea.classList.add('add__drop')
}
function unhighlight(e) {
    dropArea.classList.remove('add__drop')
}

function handleDrop(e) {
    let dt = e.dataTransfer
    let files = dt.files
    changeFiles(files)
    addInput.files = files
}

document.querySelector('.add__btn').addEventListener('click', () => {
    document.querySelector('.blackout').style.display = 'block'
    document.querySelector('.loader').style.display = 'flex'
})