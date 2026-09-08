/**
 * Tiện ích tối ưu và nén ảnh phía client (Browser-side)
 * Tự động giảm dung lượng ảnh lớn (từ 10MB - 50MB xuống ~1MB - 2MB) trong tích tắc trước khi tải lên máy chủ.
 * Giúp ảnh upload siêu nhanh, không bị giới hạn Cloudinary/Render, và hiển thị sắc nét trên mọi thiết bị.
 */

export async function compressImage(file, options = {}) {
  if (!file || !file.type.startsWith('image/')) {
    return file;
  }

  // Không can thiệp SVG hoặc GIF động để giữ animation
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  const maxWidth = options.maxWidth || 2560;
  const maxHeight = options.maxHeight || 2560;
  const quality = options.quality !== undefined ? options.quality : 0.88;

  // Nếu ảnh đã rất nhỏ (dưới 800KB) thì không cần nén
  if (file.size <= 800 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;

          // Giữ tỷ lệ khung hình và thu nhỏ nếu vượt quá giới hạn 2560px
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            return resolve(file);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                // Nếu sau khi nén không giảm được kích thước thì giữ nguyên
                return resolve(file);
              }

              let newName = file.name;
              if (!newName.toLowerCase().endsWith('.jpg') && !newName.toLowerCase().endsWith('.jpeg')) {
                newName = newName.replace(/\.[^/.]+$/, '') + '.jpg';
              }

              const compressedFile = new File([blob], newName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              console.log(
                `⚡ [Auto-Compress] Đã nén ảnh từ ${(file.size / (1024 * 1024)).toFixed(2)}MB xuống ${(compressedFile.size / (1024 * 1024)).toFixed(2)}MB`
              );
              resolve(compressedFile);
            },
            'image/jpeg',
            quality
          );
        } catch (err) {
          console.warn('Lỗi xử lý canvas nén ảnh:', err);
          resolve(file);
        }
      };

      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
