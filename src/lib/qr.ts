/**
 * A decorative QR-like grid: three finder squares plus seeded noise.
 * It is not a scannable code; the kiosk mock only needs the look.
 */
export function qrCells(size = 21, seed = 7): boolean[] {
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const cells: boolean[] = []
  const inFinder = (x: number, y: number) => {
    const corners = [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ]
    for (const [cx, cy] of corners) {
      const dx = x - cx
      const dy = y - cy
      if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) {
        if (dx < 0 || dy < 0 || dx > 6 || dy > 6) return { hit: true, on: false }
        const ring = Math.min(dx, dy, 6 - dx, 6 - dy)
        return { hit: true, on: ring !== 1 }
      }
    }
    return { hit: false, on: false }
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const f = inFinder(x, y)
      cells.push(f.hit ? f.on : rand() > 0.52)
    }
  }
  return cells
}
