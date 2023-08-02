const localStorageKeyPrefix = "maiden-repl-history-";
const maxLocalStorageHistoryItems = 100;

export const loadHistoryFromLocalStorage = (component) => {
    try {
        const history = JSON.parse(window.localStorage.getItem(`${localStorageKeyPrefix}${component}`));
        return Array.isArray(history) ? history : [];
    } catch (e) {
        return [];
    }
};

export const saveHistoryToLocalStorage = (component, history) => {
    try {
        window.localStorage.setItem(
            `${localStorageKeyPrefix}${component}`, 
            JSON.stringify(history.slice(0, maxLocalStorageHistoryItems))
        );
    } catch(e) {
    }
};

