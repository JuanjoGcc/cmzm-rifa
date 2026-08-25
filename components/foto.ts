/** Lado más largo al que reducimos la foto antes de guardarla. */
const LADO_MAX = 1000;

/**
 * La foto va como data URL dentro de la columna (ver "Las fotos" en CLAUDE.md).
 * El reescalado no es cosmético: sin él una foto de celular son 4 MB por fila.
 */
export async function aDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext('2d')!.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  bitmap.close();
  return lienzo.toDataURL('image/webp', 0.82);
}
