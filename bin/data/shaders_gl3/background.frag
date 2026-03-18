#version 150

uniform vec2  u_resolution;
uniform float u_time;
out vec4 outputColor;

//========================================================================
float hash(vec2 p) {
    vec3 p3  = fract(vec3(p.xyx) * .1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p, int octaves) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.87758,  0.47942,
                   -0.47942,  0.87758);
    for (int i = 0; i < octaves; i++) {
        v += a * noise(p);
        p  = rot * p * 2.07 + vec2(1.73, 9.22);
        a *= 0.50;
    }
    return v;
}

float fbmTurbulence(vec2 p, int octaves) {
    float v = 0.0, a = 0.5;
    mat2 rot = mat2(0.87758,  0.47942,
                   -0.47942,  0.87758);
    for (int i = 0; i < octaves; i++) {
        v += a * abs(noise(p) * 2.0 - 1.0);
        p  = rot * p * 2.07 + vec2(1.73, 9.22);
        a *= 0.50;
    }
    return v;
}

float warpedCloud(vec2 p, float drift) {
    vec2 q = vec2(fbm(p                        + drift * 0.030, 5),
                  fbm(p + vec2(5.20, 1.30)     - drift * 0.025, 5));
    vec2 r = vec2(fbm(p + 3.8*q + vec2(1.70, 9.20) + drift*0.018, 5),
                  fbm(p + 3.8*q + vec2(8.30, 2.80) - drift*0.018, 5));
    return fbm(p + 4.0 * r, 5);
}

//========================================================================
vec3 starLayer(vec2 uv, float t, float scale, float density, float dotRadius, float brightMul, float speedMul, vec2  seed) {
    vec3 col    = vec3(0.0);
    vec2 scaled = uv * scale;

    for (int dx = -1; dx <= 1; dx++) {
        for (int dy = -1; dy <= 1; dy++) {
            vec2 cell = floor(scaled) + vec2(float(dx), float(dy));
        
            if (hash(cell + seed) > density) continue;

            vec2 jitter = vec2(hash(cell + seed + vec2(17.3,  0.0)), hash(cell + seed + vec2( 0.0, 31.7)));
            vec2 starUV = (cell + jitter) / scale;
            float dist = length(uv - starUV) * scale;

            // Per-star brightness and colour temperature
            float br   = 0.35 + 0.65 * hash(cell + seed + vec2(5.1, 2.3));
            vec3  tint = mix(vec3(0.70, 0.85, 1.00), vec3(1.00, 0.92, 0.68), hash(cell + seed + vec2(8.7, 4.1)));
            float phase   = hash(cell + seed + vec2(2.9, 6.6)) * 83.7;
            float slowEnv = 0.5 + 0.5 * sin(t * speedMul * (0.4 + br * 1.2) + phase);
            slowEnv       = pow(slowEnv, 2.8);
            float shimmer = 0.80 + 0.20 * sin(t * speedMul * 11.3 + phase * 3.1);
            float twinkle = slowEnv * shimmer;
            float spot    = 1.0 - smoothstep(0.0, dotRadius, dist);
            col += tint * br * brightMul * twinkle * spot;
        }
    }
    return col;
}

vec3 starField(vec2 uv, float t) {
    vec3 col = vec3(0.0);
    col += starLayer(uv, t, 700.0, 0.10, 0.09, 0.80, 1.0, vec2( 0.00,  0.00));
    col += starLayer(uv, t, 260.0, 0.09, 0.12, 1.05, 0.7, vec2(43.71, 19.53));
    col += starLayer(uv, t,  80.0, 0.08, 0.16, 1.55, 0.5, vec2(97.31, 61.82));
    return col;
}

//========================================================================
void main() {
    vec2 uv  = gl_FragCoord.xy / u_resolution.xy;
    float asp = u_resolution.x / u_resolution.y;
    vec2 st  = vec2(uv.x * asp, uv.y);
    float t  = u_time;

    // ZONE MASK
    float diag        = uv.x - (1.0 - uv.y);
    float boundaryWarp = (fbm(st * 1.4 + t * 0.008, 4) - 0.5) * 0.85;
    float zoneMask    = smoothstep(-0.35, 0.50, diag + boundaryWarp);

    // VOID MASK
    float voidFbm  = warpedCloud(st * 1.1 + vec2(33.0, 17.0), t + 200.0);
    float nebulaMask = smoothstep(0.38, 0.72, voidFbm);

    // COOL REGION
    float cool = warpedCloud(st * 2.4 + vec2(0.0, 12.0), t);
    vec3 c_void_cool = vec3(0.005, 0.002, 0.018);
    vec3 c_dim_cool  = vec3(0.040, 0.008, 0.160);
    vec3 c_mid_cool  = vec3(0.130, 0.028, 0.460);
    vec3 c_gas_cool  = vec3(0.100, 0.150, 0.650);
    vec3 c_hi_cool   = vec3(0.340, 0.100, 0.820);
    vec3 coolColor = c_void_cool;
    coolColor = mix(coolColor, c_dim_cool, smoothstep(0.42, 0.62, cool));
    coolColor = mix(coolColor, c_mid_cool, smoothstep(0.56, 0.75, cool));
    coolColor = mix(coolColor, c_gas_cool, smoothstep(0.67, 0.85, cool) * 0.75);
    coolColor = mix(coolColor, c_hi_cool,  smoothstep(0.78, 1.00, cool) * 0.55);

    // Internal proto-star luminosity
    float coolGlow = fbm(st * 4.2 + vec2(20.0, 33.0) + t * 0.012, 3);
    coolColor += c_gas_cool * smoothstep(0.76, 1.00, coolGlow) * 0.50;
    coolColor += c_hi_cool  * smoothstep(0.86, 1.00, coolGlow) * 0.28;

    // WARM REGION
    float warm = warpedCloud(st * 2.8 + vec2(4.10, 1.30), t + 80.0);
    vec3 c_void_warm = vec3(0.010, 0.002, 0.000);
    vec3 c_dim_warm  = vec3(0.130, 0.014, 0.008);
    vec3 c_gas_warm  = vec3(0.620, 0.060, 0.012);
    vec3 c_mid_warm  = vec3(0.820, 0.260, 0.000);
    vec3 c_hi_warm   = vec3(0.960, 0.620, 0.035);
    vec3 c_core_warm = vec3(1.000, 0.920, 0.540);
    vec3 warmColor = c_void_warm;
    warmColor = mix(warmColor, c_dim_warm,  smoothstep(0.40, 0.58, warm));
    warmColor = mix(warmColor, c_gas_warm,  smoothstep(0.52, 0.70, warm));
    warmColor = mix(warmColor, c_mid_warm,  smoothstep(0.62, 0.80, warm));
    warmColor = mix(warmColor, c_hi_warm,   smoothstep(0.74, 0.92, warm));
    warmColor = mix(warmColor, c_core_warm, smoothstep(0.86, 1.00, warm) * 0.65);

    // TURBULENCE
    float filaments = fbmTurbulence(st * 5.5 + vec2(52.0, 22.0) + t * 0.016, 4);
    warmColor += c_mid_warm  * smoothstep(0.74, 0.92, filaments) * 0.40;
    warmColor += c_hi_warm   * smoothstep(0.84, 1.00, filaments) * 0.28;
    float warmGlow = fbm(st * 3.6 + vec2(72.0, 6.0) + t * 0.010, 3);
    warmColor += c_hi_warm   * smoothstep(0.78, 1.00, warmGlow) * 0.55;
    warmColor += c_core_warm * smoothstep(0.88, 1.00, warmGlow) * 0.30;
    float blendNoise = fbm(st * 3.0 + vec2(16.0, 8.5) + t * 0.014, 4);
    vec3 c_seam_lo   = vec3(0.18, 0.008, 0.09);
    vec3 c_seam_hi   = vec3(0.78, 0.120, 0.42);
    vec3 seamColor   = mix(c_seam_lo, c_seam_hi, smoothstep(0.50, 0.82, blendNoise));
    float seamMask   = smoothstep(0.40, 0.00, abs(diag + boundaryWarp * 0.55));

    // COMPOSITE NEBULA
    vec3 nebula = mix(coolColor, warmColor, zoneMask);
    nebula = mix(nebula, seamColor, seamMask * 0.75);
    vec3 voidColor = mix(c_void_cool, c_void_warm, zoneMask);
    nebula = mix(voidColor, nebula, nebulaMask);

    // STAR FIELD
    vec3 stars = starField(uv, t);

    // FINAL COMPOSITE
    vec3 finalColor = nebula + stars;
    finalColor = pow(max(finalColor, vec3(0.0)), vec3(0.88));
    outputColor = vec4(finalColor, 1.0);
}