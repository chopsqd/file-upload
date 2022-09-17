function bytesToSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if(!bytes) {
        return '0 Byte'
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return `${Math.round(bytes / Math.pow(1024, i))} ${sizes[i]}`
}

function newElement(tag, classes = [], content) {
    const node = document.createElement(tag)

    if(classes.length) {
        node.classList.add(...classes)
    }

    if(content) {
        node.textContent = content
    }

    return node
}

function noop() {}

export function upload(selector, options = {}) {
    let files = []
    const onUpload = options.onUpload ?? noop
    const input = document.querySelector(selector)
    const preview = newElement('div', ['preview'])
    const open = newElement('button', ['btn'], 'Открыть')
    const upload = newElement('button', ['btn', 'primary'], 'Загрузить')
    upload.style.display = 'none'

    if(options.multi) {
        input.setAttribute('multiple', true)
    }

    if(options.accept && Array.isArray(options.accept)) {
        input.setAttribute('accept', options.accept.join(','))
    }

    input.insertAdjacentElement('afterend', preview)
    input.insertAdjacentElement('afterend', upload)
    input.insertAdjacentElement('afterend', open)

    const triggerInput = () => input.click()

    const changeHandler = event => {
        if(!event.target.files.length) {
            return
        }

        files = Array.from(event.target.files)
        preview.innerHTML = ''
        upload.style.display = 'inline'

        files.forEach(file => {
            if(!file.type.match('image')) {
                return
            }

            const reader = new FileReader()

            reader.onload = ev => {
                const src = ev.target.result
                preview.insertAdjacentHTML('afterbegin', `
                    <div class="preview__img">
                        <div class="preview__remove" data-name="${file.name}">&times;</div>
                        <img src="${src}" alt="${file.name}"/>
                        <div class="preview__info">
                            <span>${file.name}</span>
                            <span>${bytesToSize(file.size)}</span>
                        </div>
                    </div>
                `)
            }
            reader.readAsDataURL(file)
        })
    }

    const removeHandler = event => {
        if(!event.target.dataset.name) {
            return
        }

        const {name} = event.target.dataset
        files = files.filter(file => file.name !== name)

        if(!files.length) {
            upload.style.display = 'none'
        }

        const block = preview
            .querySelector(`[data-name="${name}"]`)
            .closest('.preview__img')
        
        block.classList.add('removing')
        setTimeout(() => block.remove(), 300)
    }

    const clearPreview = el => {
        el.style.bottom = '0px'
        el.innerHTML = `<div class="preview__progress"></div>`
    }

    const uploadHandler = () => {
        preview.querySelectorAll('.preview__remove').forEach(e => e.remove())
        const previewInfo = preview.querySelectorAll('.preview__info')
        previewInfo.forEach(clearPreview)
        onUpload(files, previewInfo)
    }

    open.addEventListener('click', triggerInput)
    input.addEventListener('change', changeHandler)
    preview.addEventListener('click', removeHandler)
    upload.addEventListener('click', uploadHandler)
}