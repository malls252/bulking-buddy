import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
    const options = {
        maxSizeMB: 0.5, // Max size 500KB
        maxWidthOrHeight: 1024,
        useWebWorker: true,
    };

    try {
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
    } catch (error) {
        console.error("Compression Error:", error);
        return file; // Fallback to original if compression fails
    }
}

/**
 * Converts a base64 string to a File object.
 * Useful since our current UI handles base64 from input.
 */
export async function base64ToFile(base64String: string, fileName: string): Promise<File> {
    const res = await fetch(base64String);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
}
