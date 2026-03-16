# Pro Construction Calc – Trade Logic Master

Source of truth for calculator math. All calculators in `src/app/calculators` SHOULD match or be a documented, conservative specialization of these formulas.

## 1. Concrete

### 1.1 Slab – Volume (cubic yards)

- **Inputs**: length \(L\) ft, width \(W\) ft, depth \(D\) in, waste % \(W_f\)
- **Core volume (ft³)**:  
  \[
  V_{ft^3} = L \times W \times \frac{D}{12}
  \]
- **Adjusted volume (ft³)**:  
  \[
  V_{adj} = V_{ft^3} \times \left(1 + \frac{W_f}{100}\right)
  \]
- **Cubic yards**:  
  \[
  V_{yd^3} = \frac{V_{adj}}{27}
  \]
- **NaN-safe clamp**: All intermediate numeric values are clamped to sane ranges and final \(V_{yd^3}\) is passed through `Math.max(0, value) || 0`.

### 1.2 Continuous Footing – LF and CY

- **Inputs**: run length \(L\) ft, footing width \(B\) in, footing depth \(D\) in, waste % \(W_f\)
- **Linear feet**:  
  \[
  LF = L
  \]
- **Volume (ft³)**:  
  \[
  V_{ft^3} = L \times \frac{B}{12} \times \frac{D}{12}
  \]
- **Adjusted volume (yd³)**:  
  \[
  V_{yd^3} = \frac{V_{ft^3}}{27} \times \left(1 + \frac{W_f}{100}\right)
  \]

### 1.3 Column/Pier – CY

- **Inputs**: count \(N\), diameter \(d\) in OR rectangular \(B \times D\) in, height \(H\) ft, waste % \(W_f\)
- **Round column area (ft²)**:  
  \[
  A = \pi \times \left(\frac{d/12}{2}\right)^2
  \]
- **Rectangular area (ft²)**:  
  \[
  A = \frac{B}{12} \times \frac{D}{12}
  \]
- **Volume (yd³)**:  
  \[
  V_{yd^3} = \frac{N \times A \times H}{27} \times \left(1 + \frac{W_f}{100}\right)
  \]

### 1.4 Curb / Grade Beam – LF and CY

- **Inputs**: run length \(L\) ft, curb width \(B\) in, curb depth \(D\) in, waste % \(W_f\)
- **Volume (yd³)**: same as continuous footing formula.
- **Ordering string**: `"Order: {V_yd3.toFixed(2)} CY Curb / Grade Beam Concrete"`.

### 1.5 Bag-Mix Conversion (60 lb & 80 lb)

- **Assumption**:  
  - 80 lb bag ≈ 0.6 ft³  
  - 60 lb bag ≈ 0.45 ft³
- **Inputs**: required volume \(V_{yd^3}\), chosen bag size, waste % \(W_f\)
- **Volume in ft³**:  
  \[
  V_{ft^3} = V_{yd^3} \times 27
  \]
- **Adjusted**:  
  \[
  V_{adj} = V_{ft^3} \times \left(1 + \frac{W_f}{100}\right)
  \]
- **Bags (80 lb)**: `Math.ceil(V_adj / 0.6)`  
- **Bags (60 lb)**: `Math.ceil(V_adj / 0.45)`

---

## 2. Masonry

### 2.1 CMU 8x8x16 Wall – Block Count & Mortar

- **Inputs**: wall length \(L\) ft, wall height \(H\) ft, waste % \(W_f\)
- **Wall area (ft²)**:  
  \[
  A = L \times H
  \]
- **Coverage per block (ft²)**: 0.89 ft² (8x8x16 w/ joints)
- **Block count**:  
  \[
  N_{blocks} = \left\lceil \frac{A \times (1 + W_f/100)}{0.89} \right\rceil
  \]
- **Mortar bags (70–75 lb)**: `Math.ceil(N_blocks / 35)`
- **Material string**:  
  - `"Order: {N_blocks} Standard 8x8x16 CMU Blocks"`  
  - `"Order: {bagsMortar} Bags Type S Mortar (70–75 lb)"`.

### 2.2 Brick – Modular (Standard) & Jumbo

- **Inputs**: wall area \(A\) ft², brick type, waste % \(W_f\)
- **Coverage**:  
  - Standard modular ≈ 7 bricks/ft²  
  - Jumbo ≈ 5 bricks/ft²
- **Counts**:  
  \[
  N_{standard} = \left\lceil A \times 7 \times (1 + W_f/100) \right\rceil
  \]
  \[
  N_{jumbo} = \left\lceil A \times 5 \times (1 + W_f/100) \right\rceil
  \]
- **Material string**: `"Order: {N} {type} Face Bricks"`.

### 2.3 Pavers – Area & Bedding Sand

- **Inputs**: length \(L\) ft, width \(W\) ft, paver size (ft² per piece), bed depth \(D\) in, waste % \(W_f\)
- **Area**: \(A = L \times W\)
- **Pieces**:  
  \[
  N = \left\lceil \frac{A \times (1 + W_f/100)}{coverage} \right\rceil
  \]
- **Bedding (yd³)**:  
  \[
  V_{yd^3} = \frac{A \times (D/12)}{27} \times (1 + W_f/100)
  \]

---

## 3. Framing

### 3.1 Wall Studs – OC Spacing with Corners & Jacks

- **Inputs**: run length \(L\) ft, wall height \(H\) ft, OC spacing \(S\) in, openings count approx \(N_o\), waste % \(W_f\)
- **Layout studs** (excluding corners):  
  \[
  N_{layout} = \max\left(2, \left\lceil \frac{L}{S/12} \right\rceil + 1\right)
  \]
- **Corners & ends**: min 2 extra studs.
- **Opening jacks/kings**:  
  - For each opening: 2 jack, 2 king studs  
  \[
  N_{openings} = 4 \times N_o
  \]
- **Total studs**:  
  \[
  N_{studs} = \left\lceil (N_{layout} + 2 + N_{openings}) \times (1 + W_f/100) \right\rceil
  \]
- **Plates LF**:  
  \[
  LF_{plates} = 3 \times L
  \]

### 3.2 Floor Joists – OC + Rim Joists + Subfloor Sheets

- **Inputs**: floor length \(L\) ft, floor width \(W\) ft, OC spacing \(S\) in, depth (for board feet), waste % \(W_f\)
- **Joists count**:  
  \[
  N_{joists} = \max\left(2, \left\lceil \frac{L}{S/12} \right\rceil + 1\right)
  \]
- **Rim joists LF**:  
  \[
  LF_{rim} = 2L + 2W
  \]
- **Floor area**: \(A = L \times W\)
- **Waste-adjusted area**: \(A_{adj} = A \times (1 + W_f/100)\)
- **Subfloor sheets (4x8)**: `Math.max(1, Math.ceil(A_adj / 32))`

### 3.3 Rafters – Pitch-Based Length (Hypotenuse)

- **Inputs**: horizontal run \(R\) ft, rise per 12 in \(p\), waste % \(W_f\)
- **Pitch multiplier**:  
  \[
  M = \sqrt{1 + \left(\frac{p}{12}\right)^2}
  \]
- **Rafter length (ft)**:  
  \[
  L_{rafter} = R \times M
  \]
- **Rafter count**: same as joist spacing formula with run length.

### 3.4 Decking – LF Boards and Fasteners

- **Inputs**: deck length \(L\) ft, deck width \(W\) ft, board face width \(b\) in (e.g., 5.5"), stock length \(S_L\) ft, waste % \(W_f\)
- **Area**: \(A = L \times W\)
- **Board width (ft)**: \(b_{ft} = b / 12\)
- **Boards count** (approx):  
  \[
  N_{boards} = \max\left(1, \left\lceil \frac{A \times (1 + W_f/100)}{b_{ft} \times S_L} \right\rceil\right)
  \]
- **Board feet**:  
  \[
  BF = N_{boards} \times (1.25 \times 6 \times S_L) / 12
  \]
- **Fasteners** (screws): typically 2 per joist per board; computed in code via joist spacing and run length.

---

## 4. Exterior

### 4.1 Roofing – Squares, Bundles, Underlayment

- **Inputs**: base area \(A\) ft² OR run/rise geometry, pitch \(p\) in/12, waste % \(W_f\)
- **Pitch multiplier** \(M\) as above.
- **Effective area**:  
  \[
  A_{eff} = A \times M \times (1 + W_f/100)
  \]
- **Squares**:  
  \[
  Sq = A_{eff} / 100
  \]
- **Bundles**: `Math.ceil(Sq * 3)`
- **Underlayment rolls**: `Math.max(1, Math.ceil(A_eff / 400))`

### 4.2 Siding – Squares, Deductions, Accessories

- **Inputs**: wall length \(L\) ft, wall height \(H\) ft, window/door deduction \(D\) ft², waste % \(W_f\)
- **Area net**:  
  \[
  A_{net} = \max(0, L \times H - D)
  \]
- **Adjusted**:  
  \[
  A_{adj} = A_{net} \times (1 + W_f/100)
  \]
- **Squares**: `Sq = A_adj / 100`
- **Pieces**: depends on per-piece coverage; same pattern as pavers.
- **Accessory guidance**: starter, J-channel, corners sized from perimeter and openings; expressed as LF strings in material list.

### 4.3 Gutters – Linear Feet

- **Inputs**: run lengths per eave, total summed LF, waste % \(W_f\)
- **Total LF**:  
  \[
  LF_{adj} = \sum LF \times (1 + W_f/100)
  \]
- **Material string**: `"Order: {LF_adj.toFixed(1)} LF Seamless Gutters"` plus matching downspout counts based on drop points.

---

## 5. Interior

### 5.1 Drywall – 4x8 vs 4x12 Sheets & Buckets

- **Inputs**: total area \(A\) ft², waste % \(W_f\)
- **Adjusted area**:  
  \[
  A_{adj} = A \times (1 + W_f/100)
  \]
- **Sheets**:  
  - 4x8: `Math.max(1, Math.ceil(A_adj / 32))`  
  - 4x12: `Math.max(1, Math.ceil(A_adj / 48))`
- **Joint compound buckets** (5 gal): `Math.max(1, Math.ceil(A_adj / 500))`.

### 5.2 Paint – Gallons

- **Inputs**: wall/ceiling area \(A\) ft², coverage \(C\) ft²/gal, coats \(N_c\), waste % \(W_f\)
- **Gallons**:  
  \[
  G = \left\lceil \frac{A \times N_c \times (1 + W_f/100)}{C} \right\rceil
  \]

### 5.3 Flooring – Waste & Boxes

- **Inputs**: area \(A\) ft², per-box coverage \(B\) ft², waste % \(W_f\)
- **Adjusted area**:  
  \[
  A_{adj} = A \times (1 + W_f/100)
  \]
- **Boxes**:  
  \[
  N_{boxes} = \left\lceil \frac{A_{adj}}{B} \right\rceil
  \]

### 5.4 Trim / Baseboard – Stick Lengths

- **Inputs**: room length \(L\) ft, room width \(W\) ft, stock length \(S_L\) ft, waste % \(W_f\)
- **Perimeter LF**:  
  \[
  LF = 2L + 2W
  \]
- **Adjusted LF**:  
  \[
  LF_{adj} = LF \times (1 + W_f/100)
  \]
- **Sticks**:  
  \[
  N_{sticks} = \left\lceil \frac{LF_{adj}}{S_L} \right\rceil
  \]

---

## 6. Implementation Notes

- All calculators MUST:
  - Clamp user inputs to sane engineering ranges before math.
  - Avoid returning `"NaN"` or `"Infinity"` to the UI – any non-finite intermediate is coerced to `0` before output.
  - Use `tabular-nums` for numeric displays.
  - Emit material list strings in “supplier text message” format, prefixed with `"Order:"`.
- Any divergence from these formulas should be documented inline in the relevant calculator file with a rationale (local code, jurisdictional requirement, etc.).

