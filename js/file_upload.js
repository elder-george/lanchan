"use strict";

window.addEventListener('storage', function ({ storageArea }) {
    populateHistory(this.document.querySelector('#history'), storageArea);
});

/** @type {HTMLTemplateElement} */
const historyItemTemplate = document.querySelector('#history-item-template');

async function uploadFile({ file }) {
    const fd = new FormData();
    fd.append('file', file);
    const result = await fetch('/upload', {
        method: 'POST',
        body: fd,
    });
    if (!result.ok) {
        alert("Upload failed: " + result.statusText);
        return;
    }
    const json = await result.json();
    const permalink = document.querySelector("#permalink");
    const url = window.location.protocol + "//" + window.location.host + '/' + json.path;
    permalink.href = url;
    permalink.textContent = url;
    localStorage.setItem(new Date(), JSON.stringify({ url }));
    // storage event is not fired on the same window that made the change
    dispatchEvent(new StorageEvent('storage', { storageArea: localStorage }));
}

async function deleteFile(filename) {
    return (await fetch('/upload/' + filename, {
        method: 'DELETE',
    })).ok;
}

function populateHistory(/** @type {HTMLUListElement} */history, /** @type {Storage} */ items) {
    history.replaceChildren();
    for (let i = 0; i < items.length; i++) {
        const key = items.key(i);
        const value = items.getItem(key);
        const { url } = JSON.parse(value);
        if (!url) continue;
        const /**@type {HTMLUListElement} */ historyItem = historyItemTemplate.content.cloneNode(true).querySelector('li');
        Object.assign(historyItem.querySelector('.history-link'), {
            textContent: moment(key).format("MM DD, hh:mm:ss"),
            href: url
        });
        Object.assign(historyItem.querySelector('.delete-link'),
            {
                title: 'delete this file?',
                textContent: '[X]',
            }).addEventListener('click', async function (e) {
                if (await deleteFile(url.split('/').pop())) {
                    history.removeChild(historyItem);
                    localStorage.removeItem(key);
                }
            });
        history.prepend(historyItem);
    }
}

/** @returns {Promise<string>} */
function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

async function setPreviewAndUpload(file) {
    const dataUrl = await readAsDataURL(file);
    const preview = document.querySelector('.active');
    preview.style.backgroundImage = `url(${dataUrl})`;
    preview.width = file.width;
    preview.height = file.height;
    await uploadFile({ file, dataUrl });
}

const body = document.querySelector('body');
body.addEventListener('paste', async function (e) {
    e.preventDefault();
    const { clipboardData } = e;

    for (let i = 0; i < clipboardData.items.length; i++) {
        const type = clipboardData.items[i].type;
        if (type.startsWith('image/')) {
            const file = clipboardData.items[i].getAsFile();
            await setPreviewAndUpload(file);
            break;
        }
    };
});

body.addEventListener('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
});

body.addEventListener('drop', async function (e) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    for (const file of files) {
        await setPreviewAndUpload(file);
        break;
    }
});
populateHistory(document.querySelector('#history'), window.localStorage)