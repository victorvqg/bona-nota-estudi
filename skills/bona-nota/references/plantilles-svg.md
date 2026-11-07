# Plantilles SVG (Climogrames i Vistes Ortogonals)

Quan el tema és de **Geografia (Clima)** o **Tecnologia (Vistes d'un objecte)**, genera l'SVG amb aquestes plantilles netes (sense emojis, font `DejaVu Sans`, màxim `400 × 260 px`, dins `<div class="svg-container">`).

## 1. Climograma amb regla de Gaussen ($P = 2 \cdot T$)
- Eix esquerre (blau `#0284c7`): Temperatures en `°C` (de `0` a `30 °C`, pas `5 °C`).
- Eix dret (blau fosc `#1e3a8a`): Precipitacions en `mm` a escala doble (`0` a `60 mm`, pas `10 mm`, de manera que la línia de `20 °C` queda exactament a la mateixa alçada que `40 mm`).
- Barres blaves (`fill="#38bdf8" fill-opacity="0.75"`) per a la precipitació de cada mes (`G F M A M J J A S O N D`).
- Polilínia vermella (`stroke="#dc2626" stroke-width="2.5" fill="none"`) amb punts circulars per a la temperatura mitjana mensual.
- Quan la corba vermella passa per sobre de la barra blava ($P < 2 \cdot T$), aquell mes és **mes sec (àrid)**.

```python
def svg_climograma(mesos, temp_c, pluja_mm, titol="Climograma"):
    """Retorna un SVG de climograma a escala de Gaussen (P = 2T)."""
    w, h, x0, y0, gw, gh = 390, 230, 42, 26, 300, 168
    ymax_t, ymax_p = 35.0, 70.0  # Gaussen: P = 2 * T
    bw = gw / 12.0
    out = [f'<svg viewBox="0 0 {w} {h}" width="{w}" height="{h}" xmlns="http://www.w3.org/2000/svg" font-family="DejaVu Sans, Arial, sans-serif">']
    out.append(f'<text x="{w/2}" y="16" font-size="11" font-weight="bold" text-anchor="middle" fill="#1e293b">{titol}</text>')
    for t in range(0, 36, 5):
        y = y0 + gh - (t / ymax_t) * gh
        p = t * 2
        out.append(f'<line x1="{x0}" y1="{y:.1f}" x2="{x0+gw}" y2="{y:.1f}" stroke="#e2e8f0" stroke-width="1"/>')
        out.append(f'<text x="{x0-5}" y="{y+3:.1f}" font-size="8.5" text-anchor="end" fill="#dc2626">{t} °C</text>')
        out.append(f'<text x="{x0+gw+5}" y="{y+3:.1f}" font-size="8.5" text-anchor="start" fill="#0284c7">{p} mm</text>')
    pts = []
    for i, (m, t, p) in enumerate(zip(mesos, temp_c, pluja_mm)):
        cx = x0 + i * bw + bw / 2.0
        bh = min(gh, (p / ymax_p) * gh)
        by = y0 + gh - bh
        out.append(f'<rect x="{cx - bw*0.34:.1f}" y="{by:.1f}" width="{bw*0.68:.1f}" height="{bh:.1f}" fill="#38bdf8" fill-opacity="0.75" stroke="#0284c7" stroke-width="0.8"/>')
        ty = y0 + gh - (t / ymax_t) * gh
        pts.append((cx, ty))
        out.append(f'<text x="{cx:.1f}" y="{y0+gh+14}" font-size="8.5" font-weight="bold" text-anchor="middle" fill="#334155">{m}</text>')
    poly = " ".join(f"{cx:.1f},{ty:.1f}" for cx, ty in pts)
    out.append(f'<polyline points="{poly}" fill="none" stroke="#dc2626" stroke-width="2.2"/>')
    for cx, ty in pts:
        out.append(f'<circle cx="{cx:.1f}" cy="{ty:.1f}" r="2.8" fill="#dc2626"/>')
    out.append('</svg>')
    return "".join(out)
```

## 2. Vistes ortogonals (Alçat, Planta i Perfil)
- Dibuixa els tres quadrants del sistema europeu: **Alçat** (dalt esquerra), **Perfil esquerre** (dalt dreta, alineat horitzontalment amb l'alçat) i **Planta** (baix esquerra, alineada verticalment sota l'alçat).
- Línies de projecció auxiliars en gris discontinu (`stroke="#94a3b8" stroke-dasharray="4,3"`), arestes visibles en traç continu gruixut (`stroke="#1e293b" stroke-width="2"`).
