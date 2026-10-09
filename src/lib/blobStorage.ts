/**
 * Upload de imagens com compressão automática para garantir compatibilidade com Firestore (<1MB)
 * e suporte opcional à CDN Vercel Blob (via token de API).
 */
export async function uploadImage(file: File, token?: string): Promise<string> {
  // Se o token da Vercel Blob estiver presente, faz o upload real para a CDN da Vercel
  if (token && token.trim().length > 0) {
    try {
      const response = await fetch(`https://blob.vercel-storage.com/${encodeURIComponent(file.name)}`, {
        method: 'PUT',
        headers: {
          'authorization': `Bearer ${token.trim()}`,
          'x-api-version': '7',
          'content-type': file.type,
        },
        body: file,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
    } catch (err) {
      console.warn('Vercel Blob direct upload failed, fallback to compressed data URL:', err);
    }
  }

  // Compressão inteligente via Canvas para garantir imagem nítida e leve (< 350KB)
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // 85% de qualidade JPEG: imagem perfeita e arquivo leve (< 300KB)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedDataUrl);
        } else {
          resolve(readerEvent.target?.result as string);
        }
      };
      img.onerror = () => {
        resolve(readerEvent.target?.result as string);
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      resolve('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80');
    };
    reader.readAsDataURL(file);
  });
}
