#version 150

uniform sampler2D u_texDiffuse;
uniform sampler2D u_texClouds;
uniform float u_time;
uniform vec3 u_lightDir;
uniform float u_cloudOpacity; 

in vec2 v_texCoord;
in vec3 v_normal;
in vec3 v_viewPosition;

out vec4 outputColor;

void main(){
    vec3 N = normalize(v_normal);
    vec3 L = normalize(u_lightDir);
    
    vec4 planetColor = texture(u_texDiffuse, v_texCoord);
    vec2 cloudCoord = v_texCoord;
    
    cloudCoord.x -= u_time * 0.001; 
    cloudCoord.x = fract(cloudCoord.x);
    vec4 cloudTexture = texture(u_texClouds, cloudCoord);
    
    // Lighting
    float NdotL = dot(N, L);
    float ambient = 0.05;
    float diffuse = max(NdotL, 0.0);
    float lightIntensity = ambient + (1.0 - ambient) * diffuse;
    
    // Mixing
    float mixFactor = cloudTexture.r * u_cloudOpacity;
    vec3 composite = mix(planetColor.rgb, cloudTexture.rgb, mixFactor);
    composite *= lightIntensity;
    
    // Atmosphere / Rim Light
    vec3 V = normalize(-v_viewPosition);
    float NdotV = max(dot(N, V), 0.0);
    float rim = pow(1.0 - NdotV, 3.0);
    float rimLight = rim * smoothstep(-0.3, 0.5, NdotL);
    
    vec3 atmosphereColor = vec3(0.4, 0.6, 1.0);
    composite += atmosphereColor * rimLight * 0.4;
    
    outputColor = vec4(composite, 1.0);
}