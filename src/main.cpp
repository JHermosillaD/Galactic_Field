#include "ofMain.h"
#include "ofApp.h"

#if defined TARGET_OPENGLES && not defined TARGET_EMSCRIPTEN
	#include "ofGLProgrammableRenderer.h"
#endif

//========================================================================
int main(){

	ofSetLogLevel(OF_LOG_ERROR);
	
	#if defined TARGET_OPENGLES && not defined TARGET_EMSCRIPTEN
		ofSetCurrentRenderer(ofGLProgrammableRenderer::TYPE);
	#endif

	ofGLWindowSettings settings;
	settings.setGLVersion(3, 2);
	settings.setSize(1024, 768);
	settings.windowMode = OF_WINDOW;

	auto window = ofCreateWindow(settings);
	ofRunApp(window, std::make_shared<ofApp>());
	ofRunMainLoop();
}