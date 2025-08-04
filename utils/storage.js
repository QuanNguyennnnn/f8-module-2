export function setItemStorage(key, value) {
    const dataJSON = JSON.stringify(value);
    localStorage.setItem(key, dataJSON);
}

export function getItemStorage(key) {
    const dataJSON = localStorage.getItem(key);
    return JSON.parse(dataJSON);
}

export function removeItemStorage(key) {
    localStorage.removeItem(key);
}   

export function clearStorage() {
    localStorage.clear();
}   