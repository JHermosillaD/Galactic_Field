#pragma once
#include "ofMain.h"

enum ControlMode {
	MODE_EARTH,
	MODE_MAKEMAKE,
	MODE_HAUMEA,
	MODE_BLACKHOLE,
	MODE_LIGHT,
	MODE_COUNT
};

class ofApp : public ofBaseApp {

public:
	void setup();
	void update();
	void draw();
	void exit();

	void keyPressed(int key);
	void keyReleased(int key);
	void mouseMoved(int x, int y);
	void mouseDragged(int x, int y, int button);
	void mousePressed(int x, int y, int button);
	void mouseReleased(int x, int y, int button);
	void mouseEntered(int x, int y);
	void mouseExited(int x, int y);
	void windowResized(int w, int h);
	void dragEvent(ofDragInfo dragInfo);
	void gotMessage(ofMessage msg);

	// Planets
	ofShader planetShader;
	ofSpherePrimitive planet1;
	ofImage texDiffuse1;
	ofImage texClouds1;
	ofSpherePrimitive planet2;
	ofSpherePrimitive planet3;
	ofImage texDiffuse2;
	ofImage texClouds2;
	ofImage texDiffuse3;
	ofImage texClouds3;

	// Black hole
	ofShader backgroundShader;
	ofShader blackHoleShader;
	ofFbo backgroundFbo;
	glm::vec3 blackHolePos;

	// Light debug arrow
	glm::vec3 worldLightDir;
	ControlMode currentModeSelection;
	void drawHud();

	// Window
	float oldW;
	float oldH;
};