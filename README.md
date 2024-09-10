# Front-End for Face Image Super Resolution Application

## Overview

This repository contains the front-end code for a web application that allows users to:

- Upload images
- Detect faces in the uploaded images
- Apply various super-resolution methods to enhance the resolution of selected faces

The front-end is built using TypeScript and React.

## Features

- **Image Upload**: Upload image files directly through the interface.
- **Face Detection**: Sends the image to the server to detect faces and receives their locations.
- **Face Selection**: Displays detected faces, allowing users to choose which face to process.
- **Super-Resolution Methods**: Users can select from multiple super-resolution methods to enhance the chosen face.
- **Comparison Slider**: Compare the enhanced image with the original using a slider.
- **Method Comparison**: Option to test and compare results from all available super-resolution methods side by side.

## Setup

### Prerequisites

- **Node.js** (version 19 or later)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/LukaszBala/face-detection-sr-front.git
   cd face-detection-sr-front
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```


### Development

To start the development server, use:

   ```bash
   npm start
   ```