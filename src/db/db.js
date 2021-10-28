function saveConfig(sessions) {
    console.log(sessions)
    localStorage.setItem('sessions', JSON.stringify({sessions: sessions}));
}

function loadConfig() {
    let item = localStorage.getItem('sessions');
    if (item)
        return JSON.parse(item).sessions;
    return [];
}

export default {
    persist: saveConfig,
    load: loadConfig
}