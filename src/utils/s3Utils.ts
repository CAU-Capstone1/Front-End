/**
 * S3 URL 생성 유틸리티
 * 백엔드에서 받은 filePath(S3 키)를 S3 URL로 변환합니다.
 */

const BUCKET_NAME = "hmm25";
const REGION = "ap-northeast-2";

/**
 * S3 키(filePath)를 S3 URL로 변환합니다.
 * @param filePath S3 키 (예: "humming/1234567890_audio.mp3")
 * @returns S3 URL (예: "https://hmm25.s3.ap-northeast-2.amazonaws.com/humming/1234567890_audio.mp3")
 */
export function getS3AudioUrl(filePath: string | null | undefined): string | null {
    if (!filePath) return null;
    
    // URL 인코딩: 공백은 %20으로 변환 (S3 URL 형식에 맞춤)
    const encodedKey = encodeURIComponent(filePath).replace(/\+/g, "%20");
    
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${encodedKey}`;
}

/**
 * 여러 S3 키를 S3 URL 배열로 변환합니다.
 * @param filePaths S3 키 배열
 * @returns S3 URL 배열 (null 값은 제외)
 */
export function getS3AudioUrls(filePaths: (string | null | undefined)[]): string[] {
    return filePaths
        .map(getS3AudioUrl)
        .filter((url): url is string => url !== null);
}

