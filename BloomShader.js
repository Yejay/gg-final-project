const bloomVertShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vTexCoord;

void main() {
    vTexCoord = aTexCoord;
    vec4 positionVec4 = vec4(aPosition, 1.0);
    positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
    gl_Position = positionVec4;
}`;

const bloomFragShader = `
precision mediump float;
varying vec2 vTexCoord;
uniform sampler2D tex0;
uniform vec2 resolution;
uniform float intensity;

vec4 blur13(sampler2D image, vec2 uv, vec2 direction) {
    vec4 color = vec4(0.0);
    vec2 off1 = vec2(1.411764705882353) * direction;
    vec2 off2 = vec2(3.2941176470588234) * direction;
    vec2 off3 = vec2(5.176470588235294) * direction;
    color += texture2D(image, uv) * 0.1964825501511404;
    color += texture2D(image, uv + (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv - (off1 / resolution)) * 0.2969069646728344;
    color += texture2D(image, uv + (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv - (off2 / resolution)) * 0.09447039785044732;
    color += texture2D(image, uv + (off3 / resolution)) * 0.010381362401148057;
    color += texture2D(image, uv - (off3 / resolution)) * 0.010381362401148057;
    return color;
}

void main() {
    vec2 uv = vTexCoord;
    vec2 res = resolution;
    
    // Horizontal blur
    vec4 blur1 = blur13(tex0, uv, vec2(1.0, 0.0));
    // Vertical blur
    vec4 blur2 = blur13(tex0, uv, vec2(0.0, 1.0));
    
    // Combine blurs and original
    vec4 original = texture2D(tex0, uv);
    vec4 bloom = (blur1 + blur2) * 0.5;
    
    // Enhance bloom
    bloom *= intensity;
    
    gl_FragColor = original + bloom;
}`;