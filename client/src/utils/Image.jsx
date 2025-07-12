export function ToSquare(file, size = 800, maxSizeMB = 1, type = 'image/jpeg') {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext("2d");

                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, size, size);

                const ratio = Math.min(size / img.width, size / img.height);
                const newWidth = img.width * ratio;
                const newHeight = img.height * ratio;
                const dx = (size - newWidth) / 2;
                const dy = (size - newHeight) / 2;

                ctx.drawImage(img, dx, dy, newWidth, newHeight);

                let quality = 0.9;
                let blob;
                while (quality > 0.1) {
                    blob = await new Promise(res => canvas.toBlob(res, type, quality));
                    if (blob.size <= maxSizeMB * 1024 * 1024) break;
                    quality -= 0.1;
                }

                if (!blob) 
                    return reject(new Error("Failed to compress image."));

                const resizedFile = new File([blob], file.name, {
                    type: blob.type,
                    lastModified: Date.now(),
                });

                resolve(resizedFile);
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
