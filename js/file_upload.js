"use strict";

(function () {

    const body = document.querySelector('body');
    const preview = document.querySelector('#preview');
    const /** @type {HTMLUListElement} */history = document.querySelector('#history');
    /** @type {HTMLTemplateElement} */
    const historyItemTemplate = history.querySelector('#history-item-template');

    window.addEventListener('storage', function ({ storageArea }) {
        populateHistory(storageArea);
    });

    async function uploadFile(file) {
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

    function createHistoryItem(url, timestamp) {
        const /**@type {HTMLUListElement} */ historyItem = historyItemTemplate.content.cloneNode(true).firstElementChild;
        Object.assign(historyItem.querySelector('.history-link'), {
            textContent: moment(timestamp).format("hh:mm:ss YYYY MM DD"),
            href: url
        });
        historyItem.querySelector('.delete-button').addEventListener('click', async function (e) {
            if (await deleteFile(url.split('/').pop())) {
                history.removeChild(historyItem);
                localStorage.removeItem(key);
            }
        });
        return historyItem;
    }

    function populateHistory(/** @type {Storage} */ items) {
        history.replaceChildren(/** clear existing items */);
        for (let i = 0; i < items.length; i++) {
            const key = items.key(i);
            const { url } = JSON.parse(items.getItem(key));
            if (!url) continue;

            history.prepend(createHistoryItem(url, Date.parse(key)));
        }
    }

    async function setPreviewAndUpload(file) {
        preview.style.backgroundImage = `url(${URL.createObjectURL(file)}`;
        preview.width = file.width;
        preview.height = file.height;

        await uploadFile(file);
    }

    body.addEventListener('paste', async function (e) {
        e.preventDefault();
        e.stopPropagation();
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
    populateHistory(localStorage)
})();