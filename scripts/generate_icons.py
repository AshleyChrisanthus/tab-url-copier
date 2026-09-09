import zlib
import struct
import os

def create_png(width, height, get_pixel_func):
    """Create a raw PNG with RGBA pixels from standard library."""
    # PNG signature
    png = bytearray(b'\x89PNG\r\n\x1a\n')

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    # Raw image scanlines
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_data.extend((r, g, b, a))

    # IDAT chunk
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)

    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)

    return bytes(png)

def icon_pixel(x, y, w, h):
    # Normalized coords [0, 1]
    nx = x / (w - 1) if w > 1 else 0.5
    ny = y / (h - 1) if h > 1 else 0.5

    # Rounded rectangle background
    radius = 0.22
    cx = 0.5
    cy = 0.5

    # Distance from rounded box
    dx = max(abs(nx - cx) - (0.5 - radius), 0)
    dy = max(abs(ny - cy) - (0.5 - radius), 0)
    dist = (dx * dx + dy * dy) ** 0.5

    # Anti-aliasing margin
    pixel_size = 1.0 / w
    if dist > radius:
        return (0, 0, 0, 0)

    # Base gradient: Vibrant Indigo to Cyan (#2563eb to #06b6d4)
    r = int(37 + (6 - 37) * (nx * 0.5 + ny * 0.5))
    g = int(99 + (182 - 99) * (nx * 0.5 + ny * 0.5))
    b = int(235 + (212 - 235) * (nx * 0.5 + ny * 0.5))
    alpha = 255

    if dist > radius - pixel_size:
        factor = (radius - dist) / pixel_size
        alpha = int(255 * max(0, min(1, factor)))

    # Draw two crisp tab lines / link cards in white
    # Back tab: x: [0.22, 0.65], y: [0.20, 0.52]
    # Front tab: x: [0.35, 0.78], y: [0.42, 0.78]
    in_back_tab = (0.22 <= nx <= 0.65) and (0.20 <= ny <= 0.52)
    in_front_tab = (0.35 <= nx <= 0.78) and (0.42 <= ny <= 0.78)

    # Back tab header line
    if in_back_tab and not in_front_tab:
        # Tab outline / fill
        if ny <= 0.28 or nx <= 0.26 or nx >= 0.61 or ny >= 0.48:
            return (255, 255, 255, int(220 * (alpha / 255)))
        else:
            return (200, 225, 255, int(150 * (alpha / 255)))

    # Front tab header line and fill
    if in_front_tab:
        if ny <= 0.50 or nx <= 0.39 or nx >= 0.74 or ny >= 0.74:
            return (255, 255, 255, int(255 * (alpha / 255)))
        else:
            # Subtle inner line inside front tab (simulating URL link line)
            if 0.58 <= ny <= 0.64 and 0.44 <= nx <= 0.69:
                return (37, 99, 235, alpha)
            return (255, 255, 255, int(230 * (alpha / 255)))

    return (r, g, b, alpha)

os.makedirs('icons', exist_ok=True)
for size in [16, 48, 128]:
    data = create_png(size, size, icon_pixel)
    path = os.path.join('icons', f'icon{size}.png')
    with open(path, 'wb') as f:
        f.write(data)
    print(f'Generated {path} ({len(data)} bytes)')
