from PIL import Image, ImageDraw, ImageFont
import math

# Create 1024x1024 image
size = 1024
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Draw rounded rectangle background
def rounded_rectangle(draw, xy, radius, fill):
    x1, y1, x2, y2 = xy
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    draw.ellipse([x1, y1, x1 + radius * 2, y1 + radius * 2], fill=fill)
    draw.ellipse([x2 - radius * 2, y1, x2, y1 + radius * 2], fill=fill)
    draw.ellipse([x1, y2 - radius * 2, x1 + radius * 2, y2], fill=fill)
    draw.ellipse([x2 - radius * 2, y2 - radius * 2, x2, y2], fill=fill)

# Background - dark gradient effect (solid for simplicity)
bg_color = (22, 22, 40)
rounded_rectangle(draw, [0, 0, size, size], 200, bg_color)

# Create gradient colors
cyan = (0, 217, 255)
purple = (168, 85, 247)
pink = (236, 72, 153)

def blend_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))

# Draw the "F" shape
f_color = purple  # Main color

# Vertical bar of F
draw.rectangle([280, 220, 360, 800], fill=cyan)

# Top horizontal bar of F
draw.rectangle([280, 220, 650, 300], fill=cyan)

# Middle horizontal bar of F
draw.rectangle([280, 440, 580, 520], fill=purple)

# Play triangle (representing V and video)
triangle_points = [
    (520, 580),   # Top left
    (520, 780),   # Bottom left
    (750, 680),   # Right point
]
draw.polygon(triangle_points, fill=pink)

# Add subtle glow effect with circles
for i in range(3):
    alpha = 30 - i * 10
    glow_color = (*purple, alpha)

# Save the image
img.save('/Users/bertomill/constant-video-editor/public/flowv-icon.png', 'PNG')
print("Icon saved to public/flowv-icon.png")
print(f"Size: {img.size[0]}x{img.size[1]}")
