// index.ts
export const LocalStorage_Identifiers = {
    UserToken: 'UserToken',
} as const;

export const getStringData = (
    key: string,
    callback?: (value: string | null) => void
): string | undefined => {
    try {
        const value = localStorage.getItem(key);
        if (callback) callback(value);
        if (value !== null) {
            return value;
        }
    } catch (e) {
        // error reading value
        console.error('Error reading from localStorage:', e);
    }
    return undefined;
};

export const setStringData = (
    key: string,
    value: string,
    callback?: (success: boolean) => void
): void => {
    try {
        localStorage.setItem(key, value);
        if (callback) callback(true);
    } catch (error) {
        console.error('Error writing to localStorage:', error);
        if (callback) callback(false);
    }
};

export const getObjectData = <T>(
    key: string,
    callback?: (value: T | null) => void
): T | null => {
    try {
        const value = localStorage.getItem(key);
        if (value !== null) {
            const parsedData = JSON.parse(value) as T;
            if (callback) callback(parsedData);
            return parsedData;
        } else {
            if (callback) callback(null);
            return null;
        }
    } catch (e) {
        console.error('Error reading object from localStorage:', e);
        if (callback) callback(null);
        return null;
    }
};

export const setObjectData = <T>(
    key: string,
    value: T,
    callback?: (success: boolean) => void
): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        if (callback) callback(true);
    } catch (error) {
        console.error('Error writing object to localStorage:', error);
        if (callback) callback(false);
    }
};

export const ClearStorage = (): void => {
    localStorage.clear();
};

export const loadState = (): any | undefined => {
    try {
        const serializedState = localStorage.getItem('state');
        if (serializedState === null) {
            return undefined;
        }
        return JSON.parse(serializedState);
    } catch (err) {
        console.error('Could not load state from local storage:', err);
        return undefined;
    }
};

export const saveState = (state: { user: any }): void => {
    try {
        const serializedState = JSON.stringify({ user: state.user });
        localStorage.setItem('state', serializedState);
    } catch (err) {
        console.error('Could not save state to local storage:', err);
    }
};

export const LocalStorage = {
    getStringData,
    setStringData,
    getObjectData,
    setObjectData,
    ClearStorage
};