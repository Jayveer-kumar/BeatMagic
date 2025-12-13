#include <vector>
#include <math.h>
#include <emscripten.h>

extern "C" {

// 8D Rotation Effect
EMSCRIPTEN_KEEPALIVE
void process8D(float* left, float* right, int length, float speed) {
    cout<<"Cpp is executed : "<<endl;
    for (int i = 0; i < length; i++) {
        float phase = sin((float)i * speed);

        float l = left[i];
        float r = right[i];

        left[i]  = l * (0.5 + phase * 0.5);
        right[i] = r * (0.5 - phase * 0.5);
    }
}

}
