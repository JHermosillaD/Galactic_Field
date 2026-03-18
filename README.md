# Galactic Field Project

A real-time 3D space field built with [openFrameworks](https://openframeworks.cc/) and a personal project to immerse myself in creative coding and revisit my experience with OpenGL through the lens of openFrameworks.


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
