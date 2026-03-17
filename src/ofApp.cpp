#include "ofApp.h"

// Relative position multipliers
static const float EARTH_RX     =  1.500f, EARTH_RY     =  1.190f, EARTH_Z    = -1830.0f;
static const float MAKEMAKE_RX  =  0.465f, MAKEMAKE_RY  = -0.030f, MAKEMAKE_Z = -1040.0f;
static const float HAUMEA_RX    = -0.350f, HAUMEA_RY    =  0.030f, HAUMEA_Z   = -1040.0f;
static const float BLACKHOLE_RX =  0.890f, BLACKHOLE_RY =  0.800f;
static const bool SHOW_DEBUG = false;

//========================================================================
void ofApp::setup() {
	ofDisableArbTex();
	ofBackgroundHex(0x000000);
	ofSetFrameRate(60);
	ofSetVerticalSync(true);

	currentModeSelection = MODE_EARTH;

	// Planets
	planetShader.load("shaders_gl3/planet");

	// Earth
	planet1.setRadius(500);
	planet1.setResolution(128);
	planet1.setPosition(ofGetWidth() * EARTH_RX, ofGetHeight() * EARTH_RY, EARTH_Z);
	planet1.rotateDeg(180, 1, 0, 0);
	texDiffuse1.load("meshes/earth_surface.jpg");
	texClouds1.load("meshes/earth_cloud.jpg");

	// Makemake
	planet2.setRadius(300);
	planet2.setResolution(128);
	planet2.setPosition(ofGetWidth() * MAKEMAKE_RX, ofGetHeight() * MAKEMAKE_RY, MAKEMAKE_Z);
	planet2.rotateDeg(180, 1, 0, 0);
	texDiffuse2.load("meshes/makemake.jpg");
	texClouds2.load("meshes/makemake.jpg");

	// Haumea
	planet3.setRadius(200);
	planet3.setResolution(128);
	planet3.setPosition(ofGetWidth() * HAUMEA_RX, ofGetHeight() * HAUMEA_RY, HAUMEA_Z);
	planet3.rotateDeg(180, 1, 0, 0);
	texDiffuse3.load("meshes/haumea.jpg");
	texClouds3.load("meshes/haumea.jpg");

	// Light debug arrow
	worldLightDir = glm::normalize(glm::vec3(2.0, -1.0, 1.0));

	// Background
	backgroundShader.load("shaders_gl3/background");
	blackHoleShader.load("shaders_gl3/blackhole");
	backgroundFbo.allocate(ofGetWidth(), ofGetHeight(), GL_RGBA);

	// Black hole
	blackHolePos = glm::vec3(ofGetWidth() * BLACKHOLE_RX, ofGetHeight() * BLACKHOLE_RY, 0);

	oldW = ofGetWidth();
	oldH = ofGetHeight();
}

//========================================================================
void ofApp::draw() {

	// Background
	backgroundFbo.begin();
	ofClear(0, 0, 0, 255);
	ofPushMatrix();
	ofPushView();
	ofViewport(0, 0, ofGetWidth(), ofGetHeight());
	ofSetupScreenOrtho(ofGetWidth(), ofGetHeight());
	backgroundShader.begin();
	backgroundShader.setUniform2f("u_resolution", ofGetWidth(), ofGetHeight());
	backgroundShader.setUniform1f("u_time", ofGetElapsedTimef());
	ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
	backgroundShader.end();
	ofPopView();
	ofPopMatrix();
	backgroundFbo.end();

	// Black hole
	ofPushMatrix();
	ofPushView();
	ofViewport(0, 0, ofGetWidth(), ofGetHeight());
	ofSetupScreenOrtho(ofGetWidth(), ofGetHeight());
	blackHoleShader.begin();
	blackHoleShader.setUniform2f("u_resolution", ofGetWidth(), ofGetHeight());
	blackHoleShader.setUniform1f("u_time", ofGetElapsedTimef());
	blackHoleShader.setUniform2f("u_mouse", blackHolePos.x, blackHolePos.y);
	blackHoleShader.setUniform3f("u_blackHolePos", blackHolePos);
	blackHoleShader.setUniformTexture("u_backgroundTexture", backgroundFbo.getTexture(), 0);
	ofEnableBlendMode(OF_BLENDMODE_ALPHA);
	ofDrawRectangle(0, 0, ofGetWidth(), ofGetHeight());
	ofDisableBlendMode();
	blackHoleShader.end();
	ofPopView();
	ofPopMatrix();

	// Planets
	ofEnableDepthTest();

	glm::vec3 viewSpaceLightDir = glm::normalize(glm::vec3(ofGetCurrentMatrix(OF_MATRIX_MODELVIEW) * glm::vec4(worldLightDir, 0.0f)));

	// Earth
	planetShader.begin();
	planetShader.setUniform1f("u_time", ofGetElapsedTimef());
	planetShader.setUniformTexture("u_texDiffuse", texDiffuse1.getTexture(), 0);
	planetShader.setUniformTexture("u_texClouds", texClouds1.getTexture(), 1);
	planetShader.setUniform3f("u_lightDir", viewSpaceLightDir);
	planetShader.setUniform1f("u_cloudOpacity", 1.0f);
	ofPushMatrix();
	ofTranslate(planet1.getPosition());
	ofRotateDeg(180, 1, 0, 0);
	ofRotateDeg(ofGetElapsedTimef() * 4.0, 0, 1, 0);
	glm::mat4 mv1 = ofGetCurrentMatrix(OF_MATRIX_MODELVIEW);
	planetShader.setUniformMatrix4f("normalMatrix", glm::transpose(glm::inverse(mv1)));
	planet1.getMesh().draw(OF_MESH_FILL);
	ofPopMatrix();
	planetShader.end();

	// Makemake
	planetShader.begin();
	planetShader.setUniform1f("u_time", ofGetElapsedTimef() * 1.5);
	planetShader.setUniformTexture("u_texDiffuse", texDiffuse2.getTexture(), 0);
	planetShader.setUniformTexture("u_texClouds", texClouds2.getTexture(), 1);
	planetShader.setUniform3f("u_lightDir", viewSpaceLightDir);
	planetShader.setUniform1f("u_cloudOpacity", 0.0f);
	ofPushMatrix();
	ofTranslate(planet2.getPosition());
	ofRotateDeg(180, 1, 0, 0);
	ofRotateDeg(ofGetElapsedTimef() * -2.0, 0, 1, 0);
	glm::mat4 mv2 = ofGetCurrentMatrix(OF_MATRIX_MODELVIEW);
	planetShader.setUniformMatrix4f("normalMatrix", glm::transpose(glm::inverse(mv2)));
	planet2.getMesh().draw(OF_MESH_FILL);
	ofPopMatrix();
	planetShader.end();

	// Haumea
	planetShader.begin();
	planetShader.setUniform1f("u_time", ofGetElapsedTimef() * 2.0);
	planetShader.setUniformTexture("u_texDiffuse", texDiffuse3.getTexture(), 0);
	planetShader.setUniformTexture("u_texClouds", texClouds3.getTexture(), 1);
	planetShader.setUniform3f("u_lightDir", viewSpaceLightDir);
	planetShader.setUniform1f("u_cloudOpacity", 0.0f);
	ofPushMatrix();
	ofTranslate(planet3.getPosition());
	ofRotateDeg(180, 1, 0, 0);
	ofRotateDeg(ofGetElapsedTimef() * 3.5, 0, 1, 0);
	glm::mat4 mv3 = ofGetCurrentMatrix(OF_MATRIX_MODELVIEW);
	planetShader.setUniformMatrix4f("normalMatrix", glm::transpose(glm::inverse(mv3)));
	planet3.getMesh().draw(OF_MESH_FILL);
	ofPopMatrix();
	planetShader.end();

	ofDisableDepthTest();

	// Light debug arrow
	if (currentModeSelection == MODE_LIGHT) {
		ofPushStyle();
		ofSetColor(255, 255, 0);
		ofSetLineWidth(3);
		glm::vec3 center(ofGetWidth() / 2, ofGetHeight() / 2, 0);
		glm::vec3 lightEnd = center + (worldLightDir * 200.0f);
		ofDrawLine(center, lightEnd);
		ofPopStyle();
	}

	drawHud();
	ofSetColor(255);
}

//========================================================================
void ofApp::drawHud() {
	static const char* modeNames[] = {
		"EARTH", "MAKEMAKE", "HAUMEA", "BLACKHOLE", "LIGHT"
	};

	if (!SHOW_DEBUG) return;

	ofPushStyle();
	ofSetColor(180);
	string modeStr = string("TAB: ") + modeNames[(int)currentModeSelection];
	ofDrawBitmapString(modeStr, 14, ofGetHeight() - 28);
	ofDrawBitmapString("arrows: x/y   W/S: depth", 14, ofGetHeight() - 14);

	glm::vec3 p1 = planet1.getPosition();
	glm::vec3 p2 = planet2.getPosition();
	glm::vec3 p3 = planet3.getPosition();

	int x = 14, y = 20, lineH = 14;

	ofSetColor(255, 255, 255, 140);
	ofDrawBitmapString("--- POSITIONS ---",                                                        x, y);
	ofDrawBitmapString("EARTH     x:" + ofToString((int)p1.x) + "  y:" + ofToString((int)p1.y) + "  z:" + ofToString((int)p1.z), x, y + lineH * 1);
	ofDrawBitmapString("MAKEMAKE  x:" + ofToString((int)p2.x) + "  y:" + ofToString((int)p2.y) + "  z:" + ofToString((int)p2.z), x, y + lineH * 2);
	ofDrawBitmapString("HAUMEA    x:" + ofToString((int)p3.x) + "  y:" + ofToString((int)p3.y) + "  z:" + ofToString((int)p3.z), x, y + lineH * 3);
	ofDrawBitmapString("BLACKHOLE x:" + ofToString((int)blackHolePos.x) + "  y:" + ofToString((int)blackHolePos.y),               x, y + lineH * 4);

	ofSetColor(160, 220, 160, 160);
	ofDrawBitmapString("--- RELATIVE (rx, ry) ---",                                                                                                         x, y + lineH * 6);
	ofDrawBitmapString("EARTH     rx:" + ofToString(p1.x / ofGetWidth(), 3) + "  ry:" + ofToString(p1.y / ofGetHeight(), 3) + "  z:" + ofToString((int)p1.z), x, y + lineH * 7);
	ofDrawBitmapString("MAKEMAKE  rx:" + ofToString(p2.x / ofGetWidth(), 3) + "  ry:" + ofToString(p2.y / ofGetHeight(), 3) + "  z:" + ofToString((int)p2.z), x, y + lineH * 8);
	ofDrawBitmapString("HAUMEA    rx:" + ofToString(p3.x / ofGetWidth(), 3) + "  ry:" + ofToString(p3.y / ofGetHeight(), 3) + "  z:" + ofToString((int)p3.z), x, y + lineH * 9);
	ofDrawBitmapString("BLACKHOLE rx:" + ofToString(blackHolePos.x / ofGetWidth(), 3) + "  ry:" + ofToString(blackHolePos.y / ofGetHeight(), 3),               x, y + lineH * 10);

	ofSetColor(255, 220, 60, 220);
	int activeRow = (int)currentModeSelection;
	if (activeRow < 4) {
		ofDrawBitmapString(">", x - 10, y + lineH * (activeRow + 1));
		ofDrawBitmapString(">", x - 10, y + lineH * (activeRow + 7));
	}

	ofPopStyle();
}

//========================================================================
void ofApp::windowResized(int w, int h) {
	backgroundFbo.allocate(w, h, GL_RGBA);

	float rx1 = planet1.getPosition().x / oldW;
	float ry1 = planet1.getPosition().y / oldH;
	float rx2 = planet2.getPosition().x / oldW;
	float ry2 = planet2.getPosition().y / oldH;
	float rx3 = planet3.getPosition().x / oldW;
	float ry3 = planet3.getPosition().y / oldH;
	float rbhx = blackHolePos.x / oldW;
	float rbhy = blackHolePos.y / oldH;

	planet1.setPosition(rx1 * w, ry1 * h, planet1.getPosition().z);
	planet2.setPosition(rx2 * w, ry2 * h, planet2.getPosition().z);
	planet3.setPosition(rx3 * w, ry3 * h, planet3.getPosition().z);
	blackHolePos.x = rbhx * w;
	blackHolePos.y = rbhy * h;

	oldW = w;
	oldH = h;
}

//========================================================================
void ofApp::keyPressed(int key) {

	if (key == 'f' || key == 'F') {
		ofToggleFullscreen();
	}

	if (key == OF_KEY_TAB) {
		currentModeSelection = (ControlMode)((int(currentModeSelection) + 1) % MODE_COUNT);
	}

	glm::vec3 change(0, 0, 0);
	float moveSpeed = 10.0f;
	float rotateSpeed = 2.0f;

	if (key == OF_KEY_LEFT)       change.x = -1;
	if (key == OF_KEY_RIGHT)      change.x =  1;
	if (key == OF_KEY_UP)         change.y = -1;
	if (key == OF_KEY_DOWN)       change.y =  1;
	if (key == 'w' || key == 'W') change.z = -1;
	if (key == 's' || key == 'S') change.z =  1;

	switch (currentModeSelection) {
	case MODE_EARTH:
		planet1.setPosition(planet1.getPosition() + (change * moveSpeed));
		break;
	case MODE_MAKEMAKE:
		planet2.setPosition(planet2.getPosition() + (change * moveSpeed));
		break;
	case MODE_HAUMEA:
		planet3.setPosition(planet3.getPosition() + (change * moveSpeed));
		break;
	case MODE_BLACKHOLE:
		blackHolePos += (change * moveSpeed);
		break;
	case MODE_LIGHT:
		if (change.x != 0) {
			glm::mat4 rotY = glm::rotate(glm::mat4(1.0f), glm::radians(change.x * rotateSpeed), glm::vec3(0, 1, 0));
			worldLightDir = glm::vec3(rotY * glm::vec4(worldLightDir, 0.0f));
		}
		if (change.y != 0) {
			glm::mat4 rotX = glm::rotate(glm::mat4(1.0f), glm::radians(-change.y * rotateSpeed), glm::vec3(1, 0, 0));
			worldLightDir = glm::vec3(rotX * glm::vec4(worldLightDir, 0.0f));
		}
		worldLightDir = glm::normalize(worldLightDir);
		break;
	default:
		break;
	}
}

//========================================================================
void ofApp::keyReleased(int key) { }
void ofApp::mouseMoved(int x, int y) { }
void ofApp::mouseDragged(int x, int y, int button) { }
void ofApp::mousePressed(int x, int y, int button) { }
void ofApp::mouseReleased(int x, int y, int button) { }
void ofApp::mouseEntered(int x, int y) { }
void ofApp::mouseExited(int x, int y) { }
void ofApp::gotMessage(ofMessage msg) { }
void ofApp::dragEvent(ofDragInfo dragInfo) { }
void ofApp::update() { }
void ofApp::exit() { }