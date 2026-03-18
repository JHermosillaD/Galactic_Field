# Galactic Field

![OF](https://img.shields.io/badge/openFrameworks-0.12.1-black?style=flat-square)
![C++](https://img.shields.io/badge/C%2B%2B-17-blue?style=flat-square&logo=c%2B%2B)
![OpenGL](https://img.shields.io/badge/OpenGL-3.2-green?style=flat-square&logo=opengl)
![OS](https://img.shields.io/badge/OS-Linux-orange?style=flat-square&logo=linux&logoColor=black)
![License](https://img.shields.io/badge/License-GPL--v3.0-red?style=flat-square)

A real-time 3D space field built with [openFrameworks](https://openframeworks.cc/) and a personal project to immerse myself in creative coding and revisit my experience with OpenGL through the lens of openFrameworks.

<video width="1280" height="720" src="https://github.com/user-attachments/assets/e3b30439-6737-484b-8c46-812c6a0ed3aa.mp4"></video>

Project Structure
```
├── src/
│   ├── main.cpp
│   ├── ofApp.h
│   └── ofApp.cpp
└── bin/data/
    ├── meshes/
    │   ├── earth_surface.jpg
    │   ├── earth_cloud.jpg
    │   ├── makemake.jpg
    │   └── haumea.jpg
    └── shaders_gl3/
        ├── background.frag
        ├── background.vert
        ├── blackhole.frag
        ├── blackhole.vert
        ├── planet.frag
        └── planet.vert
```

The position of objects can be adjusted using the following controls:
| Key | Action |
|---|---|
| `TAB` | Object selection (Earth, Makemake, Haumea, Black Hole, Light) |
| `Arrows` | Move object (X/Y) |
| `w / s` | Change object depth (Z) |
| `F` | Toggle fullscreen |

Although the controls are always active, the display of debugging elements can be enabled/disabled using the `static const bool SHOW_DEBUG = false;` variable.


## Texture Credits

- Textures provided by [Solar System Scope](https://www.solarsystemscope.com/textures/), developed by [INOVE](http://inove.eu.com).
- Textures licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- Textures are based on NASA (Makemake and Haumea maps are fictional representations).
