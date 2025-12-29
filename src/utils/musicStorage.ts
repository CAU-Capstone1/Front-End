/*
음악 저장소 관리 유틸리티
localStorage를 사용하여 생성된 음악들을 영구 저장
사용자별로 데이터를 분리하여 저장

작동 방식:
1. 각 사용자는 고유한 ID를 가짐 (회원가입 시 생성)
2. 음악 저장 시 현재 로그인한 사용자 ID를 자동으로 포함
3. 사용자별로 localStorage 키를 분리: "savedMusic:user:${userId}"
4. 마이페이지에서는 현재 로그인한 사용자의 음악만 표시
5. 다른 사용자가 로그인하면 자신의 음악만 보임

예시:
- 사용자 A (ID: user-123)의 음악 → localStorage["savedMusic:user:user-123"]
- 사용자 B (ID: user-456)의 음악 → localStorage["savedMusic:user:user-456"]

주의사항:
- 서버 없이 브라우저 로컬 스토리지만 사용하므로, 브라우저 데이터 삭제 시 모든 정보가 사라짐
- 실제 프로덕션 환경에서는 백엔드 서버와 데이터베이스를 사용해야 함
*/

import { getCurrentUser } from "./auth";

export type SavedMusic = {
    id: string;
    userId: string; // 음악을 저장한 사용자 ID
    name: string;
    createdAt: string; // ISO date string
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
    composeResponse?: string | null; // JSON string of compose:lastResponse
};

// 사용자별로 localStorage 키를 생성
function getStorageKey(userId: string): string {
    return `savedMusic:user:${userId}`;
}

const storage = typeof window !== "undefined" ? window.localStorage : undefined;

// 현재 로그인한 사용자의 음악 저장
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

// 현재 로그인한 사용자의 음악만 가져오기
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

// 현재 사용자의 음악 중에서 ID로 찾기
export function getSavedMusicById(id: string): SavedMusic | null {
    const all = getAllSavedMusic();
    return all.find((music) => music.id === id) || null;
}

// 현재 사용자의 음악 삭제
export function deleteSavedMusic(id: string): boolean {
    if (!storage) return false;

    const currentUser = getCurrentUser();
    if (!currentUser) return false;

    const all = getAllSavedMusic();
    const filtered = all.filter((music) => music.id !== id);
    storage.setItem(getStorageKey(currentUser.id), JSON.stringify(filtered));
    
    return filtered.length < all.length;
}

// 현재 사용자의 음악 이름 수정
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

