import sharp from 'sharp'

type OptimizeOptions = {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export async function optimizeImage(
  buffer: Buffer,
  { maxWidth = 1200, maxHeight = 1200, quality = 80 }: OptimizeOptions = {}
): Promise<{ buffer: Buffer; contentType: string }> {
  const optimized = await sharp(buffer)
    .resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality })
    .toBuffer()

  return { buffer: optimized, contentType: 'image/webp' }
}
