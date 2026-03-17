#version 150

uniform vec2      u_resolution;
uniform float     u_time;
uniform vec2      u_mouse;
uniform vec3      u_blackHolePos;
uniform sampler2D u_backgroundTexture;

out vec4 outputColor;

// ============================================================================
//  PARAMETERS
// ============================================================================

const float BLACKHOLE_SCALE          = 0.4;

// Lensing
const float EVENT_HORIZON_RADIUS     = 0.10;   // black disc, in normalised units
const float LENS_RADIUS_MULT         = 2.8;    // Einstein ring sits at EH * this
const float LENS_INFLUENCE_MULT      = 7.0;    // how far lensing reaches (in lens-radii)

// Photon ring (the bright halo just outside the shadow)
const float PHOTON_RING_MULT         = 1.30;   // radius relative to EH
const float PHOTON_RING_WIDTH        = 0.012;  // half-width
const float PHOTON_RING_BRIGHTNESS   = 3.2;

// ============================================================================
//  HELPERS
// ============================================================================

float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
               mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a*noise(p); p *= 2.0; a *= 0.5; }
    return v;
}

// ============================================================================
//  MAIN
// ============================================================================

void main() {
    float asp = u_resolution.x / u_resolution.y;

    // Aspect-corrected coordinates (everything lives in this space)
    vec2 st     = gl_FragCoord.xy / u_resolution.xy;
    st.x       *= asp;

    vec2 center = u_mouse / u_resolution.xy;
    center.x   *= asp;

    vec2  dir  = st - center;
    float r    = length(dir);
    vec2  nDir = dir / max(r, 1e-6);

    // ── Radii ─────────────────────────────────────────────────────────────────
    float Rs         = EVENT_HORIZON_RADIUS * BLACKHOLE_SCALE;
    float lensRadius = Rs * LENS_RADIUS_MULT;
    float photonR    = Rs * PHOTON_RING_MULT;
    // ── GRAVITATIONAL LENSING ─────────────────────────────────────────────────
    //
    //  Real deflection: a ray passing at impact parameter b is bent by
    //  Δα = 2Rs/b  (weak-field approximation).
    //
    //  In 2-D screen space we remap the sample radius:
    //    newR = r + lensRadius² / r
    //
    //  This pushes sample positions *outward* — background behind the BH
    //  stretches into an Einstein ring instead of collapsing to a dark blob.
    //  The mapping has a caustic at r = lensRadius where d(newR)/dr = 0,
    //  which is where the ring forms.
    //
    float lensedR_raw = r + (lensRadius * lensRadius) / max(r, Rs * 0.6);

    // Blend lensing influence smoothly to zero far from the BH
    float influence = smoothstep(lensRadius * LENS_INFLUENCE_MULT,
                                 lensRadius * 1.2, r);
    float lensedR   = mix(r, lensedR_raw, influence);

    // Sample background using the lensed radius
    vec2 lensedSt = center + nDir * lensedR;
    vec2 bgUV     = vec2(lensedSt.x / asp, lensedSt.y);
    bgUV          = clamp(bgUV, 0.0, 1.0);
    vec3 bgColor  = texture(u_backgroundTexture, bgUV).rgb;

    // Subtle Doppler tint: light from one side is blue-shifted (approaching),
    // the other red-shifted (receding).  Use the x-component of the
    // tangential direction as a proxy for line-of-sight velocity.

    // Gravitational redshift: colours near the horizon shift red
    float gRedshift = smoothstep(lensRadius * 2.0, Rs * 1.1, r);
    bgColor = mix(bgColor,
                  bgColor * vec3(1.4, 0.55, 0.30),
                  gRedshift * 0.55);

    // ── PHOTON RING ───────────────────────────────────────────────────────────
    //  Narrow bright halo at the shadow edge where light orbits the BH.
    float photonRing = exp(-abs(r - photonR) / PHOTON_RING_WIDTH);
    // Modulate around azimuth so it isn't perfectly uniform
    float angle      = atan(dir.y, dir.x);
    float ringMod    = 0.75 + 0.25 * sin(angle * 3.0 + u_time * 0.5);
    vec3  photonColor = vec3(0.85, 0.93, 1.00)
                      * photonRing * PHOTON_RING_BRIGHTNESS * ringMod;



    // ── EVENT HORIZON ─────────────────────────────────────────────────────────
    //  Smooth black disc. Nothing escapes — set to exactly zero inside.
    float horizonMask = smoothstep(Rs, Rs * 1.05, r);   // 0 inside, 1 outside

    // ── COMPOSE ───────────────────────────────────────────────────────────────
    vec3 color = bgColor;
    color     += photonColor;
    color     *= horizonMask;           // black event horizon

    outputColor = vec4(color, 1.0);
}
