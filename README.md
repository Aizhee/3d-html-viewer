
# 3D HTML Viewer

<!-- [![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/Aizhe.magiceightball?label=Visual%20Studio%20Marketplace&style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=Aizhe.magiceightball)     [![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/Aizhe.magiceightball?label=Installs&style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=Aizhe.magiceightball)     [![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/stars/Aizhe.magiceightball?label=Rating&style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=Aizhe.magiceightball) -->

A Visual Studio Code extension that allows you to preview your HTML files in a 3D perspective. Perfect for visualizing the structure of your HTML documents and exploring the spatial relationships between elements.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/O4O0XNVKI)

## Features

- **3D Visualization:** View your HTML documents in a 3D space.
- **Customizable Zoom:** Adjust the camera zoom level to focus on specific elements.
- **Layer Colors:** Apply colors to layers for better differentiation.
- **Gap Control:** Customize the gap between layers to suit your preferences.
- **Randomized Colors:** Option to color the layers randomly for a more vibrant experience.

## Commands

- **View HTML in 3D:** `extension.3dhtmlviewer.open`
  - **Shortcut:** `Ctrl+Shift+3` (Windows/Linux) or `Cmd(⌘)+Shift+3` (Mac)
  - **Description:** Opens a 3D preview of your current HTML file.

## Configuration

Default setting can be changed, just press `F1`, search for Open Settings (UI), there you can change the following:

- **Zoom Level (`3dhtmlviewer.zoom`):**
  - Type: `number`
  - Default: `0.8`
  - Range: `0` to `1`
  - Description: Sets the default zoom level of the camera.

- **Color the Layers (`3dhtmlviewer.colorTheLayers`):**
  - Type: `boolean`
  - Default: `true`
  - Description: Enables or disables coloring the layers.

- **Randomize Colors (`3dhtmlviewer.colorRandom`):**
  - Type: `boolean`
  - Default: `false`
  - Description: Colors the layers randomly when enabled.

- **Hue (`3dhtmlviewer.hue`):**
  - Type: `number`
  - Default: `0`
  - Range: `0` to `360`
  - Description: Sets the default hue value of the layers.

- **Gap Between Layers (`3dhtmlviewer.gap`):**
  - Type: `number`
  - Default: `20`
  - Range: `0` to `100`
  - Description: Controls the gap distance between layers.

## Installation

To install the **3D HTML Viewer** extension, follow these steps:

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar.
3. Search for "3D HTML Viewer" by Aizhe.
4. Click **Install**.

## Usage

1. Open an HTML file in VS Code.
2. Press `Ctrl+Shift+3` (Windows/Linux) or `Cmd+Shift+3` (Mac) to activate the 3D viewer.
3. Customize the view using the available settings.

## Contributing

If you encounter any issues or have suggestions for improvements, please visit the [GitHub repository](https://github.com/Aizhee/3d-html-viewer) and submit an issue or pull request.

## License

Uses GPL-3.0 Licensed code from [dom3d.js](github.com/OrionReed/dom3d) by OrionReed which this project is based on. 

[GPL-3.0](LICENSE) © Aizhe 2024


---

