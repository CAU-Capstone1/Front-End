import { getCurrentUser } from "./auth";
export type SavedMusic = {
    id: string;
    userId: string; 
    name: string;
    createdAt: string; 
    compositionData: {
        style?: string | null;
        mood?: string | null;
        instrument?: string | null;
        key?: string | null;
        duration?: string | null;
        tempo?: string | null;
        hummingStart?: string | null;
        hummingMain?: string | null;
        hummingEnd?: string | null;
        referenceVisual?: string | null;
    };
    composeResponse?: string | null; 
};
function getStorageKey(userId: string): string {
    return `savedMusic:user:${userId}`;
}
const storage = typeof window !== "undefined" ? window.localStorage : undefined;
export function saveMusic(music: Omit<SavedMusic, "id" | "userId" | "createdAt">): SavedMusic {
    if (!storage) {
        throw new Error("localStorage is not available");
    }
    const currentUser = getCurrentUser();
    if (!currentUser) {
        throw new Error("로그인이 필요합니다.");
    }
    const savedMusic: SavedMusic = {
        ...music,
        id: `music-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
    };
    const existing = getAllSavedMusic();
    existing.push(savedMusic);
    storage.setItem(getStorageKey(currentUser.id), JSON.stringify(existing));
    return savedMusic;
}
export function getAllSavedMusic(): SavedMusic[] {
    if (!storage) return [];
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    try {
        const data = storage.getItem(getStorageKey(currentUser.id));
        if (!data) return [];
        return JSON.parse(data) as SavedMusic[];
    } catch (error) {
        console.error("Failed to load saved music:", error);
        return [];
    }
}
export function getSavedMusicById(id: string): SavedMusic | null {
    const all = getAllSavedMusic();
    return all.find((music) => music.id === id) || null;
}
export function deleteSavedMusic(id: string): boolean {
    if (!storage) return false;
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    const all = getAllSavedMusic();
    const filtered = all.filter((music) => music.id !== id);
    storage.setItem(getStorageKey(currentUser.id), JSON.stringify(filtered));
    return filtered.length < all.length;
}
export function updateMusicName(id: string, newName: string): boolean {
    if (!storage) return false;
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    const all = getAllSavedMusic();
    const index = all.findIndex((music) => music.id === id);
    if (index === -1) return false;
    all[index].name = newName;
    storage.setItem(getStorageKey(currentUser.id), JSON.stringify(all));
    return true;
}
