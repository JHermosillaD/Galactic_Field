#version 150

uniform mat4 modelViewProjectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 normalMatrix;
in vec4 position;
in vec2 texcoord;
in vec3 normal;
out vec2 v_texCoord;
out vec3 v_normal;
out vec3 v_viewPosition;

void main(){
    v_texCoord = texcoord;
    v_normal = normalize((normalMatrix * vec4(normal, 0.0)).xyz);
    vec4 viewPos = modelViewMatrix * position;
    v_viewPosition = viewPos.xyz;
    gl_Position = modelViewProjectionMatrix * position;
}