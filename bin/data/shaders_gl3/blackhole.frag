#version 150

uniform vec2      u_resolution;
uniform float     u_time;
uniform vec2      u_mouse;
uniform vec3      u_blackHolePos;
uniform sampler2D u_backgroundTexture;

out vec4 outputColor;
const float BLACKHOLE_SCALE          = 0.4;
// Lensing
const float EVENT_HORIZON_RADIUS     = 0.10;
const float LENS_RADIUS_MULT         = 2.8;
const float LENS_INFLUENCE_MULT      = 7.0;
// Photon ring
const float PHOTON_RING_MULT         = 1.30;
const float PHOTON_RING_WIDTH        = 0.012;
const float PHOTON_RING_BRIGHTNESS   = 3.2;

//========================================================================
float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p); 
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
        v += a*noise(p); p *= 2.0; a *= 0.5; 
    }
    return v;
}

//========================================================================
void main() {
    float asp   = u_resolution.x / u_resolution.y;
    vec2 st     = gl_FragCoord.xy / u_resolution.xy;
    st.x       *= asp;
    vec2 center = u_mouse / u_resolution.xy;
    center.x   *= asp;
    vec2  dir   = st - center;
    float r     = length(dir);
    // Radii
    vec2  nDir  = dir / max(r, 1e-6);
    float Rs          = EVENT_HORIZON_RADIUS * BLACKHOLE_SCALE;
    float lensRadius  = Rs * LENS_RADIUS_MULT;
    float photonR     = Rs * PHOTON_RING_MULT;
    // GRAVITATIONAL LENSING
    float lensedR_raw = r + (lensRadius * lensRadius) / max(r, Rs * 0.6);
    float influence   = smoothstep(lensRadius * LENS_INFLUENCE_MULT, lensRadius * 1.2, r);
    float lensedR     = mix(r, lensedR_raw, influence);
    vec2 lensedSt   = center + nDir * lensedR;
    vec2 bgUV       = vec2(lensedSt.x / asp, lensedSt.y);
    bgUV            = clamp(bgUV, 0.0, 1.0);
    vec3 bgColor    = texture(u_backgroundTexture, bgUV).rgb;
    float gRedshift = smoothstep(lensRadius * 2.0, Rs * 1.1, r);
    bgColor         = mix(bgColor, bgColor * vec3(1.4, 0.55, 0.30), gRedshift * 0.55);
    // PHOTON RING
    float photonRing  = exp(-abs(r - photonR) / PHOTON_RING_WIDTH);
    float angle       = atan(dir.y, dir.x);
    float ringMod     = 0.75 + 0.25 * sin(angle * 3.0 + u_time * 0.5);
    vec3  photonColor = vec3(0.85, 0.93, 1.00) * photonRing * PHOTON_RING_BRIGHTNESS * ringMod;
    // EVENT HORIZON
    float horizonMask = smoothstep(Rs, Rs * 1.05, r);
    // COMPOSE
    vec3 color = bgColor;
    color     += photonColor;
    color     *= horizonMask;
    outputColor = vec4(color, 1.0);
}