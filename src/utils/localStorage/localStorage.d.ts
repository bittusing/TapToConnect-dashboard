// localStorage.d.ts
export interface LocalStorage_IdentifiersType {
    UserToken: string;
}

export interface LocalStorageType {
    getStringData: (key: string, callback?: (value: string | null) => void) => string | undefined;
    setStringData: (key: string, value: string, callback?: (success: boolean) => void) => void;
    getObjectData: <T>(key: string, callback?: (value: T | null) => void) => T | null;
    setObjectData: <T>(key: string, value: T, callback?: (success: boolean) => void) => void;
    ClearStorage: () => void;
}

export const LocalStorage_Identifiers: LocalStorage_IdentifiersType;
export const LocalStorage: LocalStorageType;

export function loadState(): any | undefined;
export function saveState(state: { user: any }): void;

export function getStringData(key: string, callback?: (value: string | null) => void): string | undefined;
export function setStringData(key: string, value: string, callback?: (success: boolean) => void): void;
export function getObjectData<T>(key: string, callback?: (value: T | null) => void): T | null;
export function setObjectData<T>(key: string, value: T, callback?: (success: boolean) => void): void;
export function ClearStorage(): void;