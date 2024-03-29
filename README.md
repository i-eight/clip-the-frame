# Clip The Frame

This tool clips multiple parts of an image that are separated by frames.

[![Deploy static content to Pages](https://github.com/i-eight/clip-the-frame/actions/workflows/deploy.yaml/badge.svg?branch=main)](https://github.com/i-eight/clip-the-frame/actions/workflows/deploy.yaml)

## Demo

<div><video controls src="https://github.com/i-eight/clip-the-frame/assets/32570/45b470c2-35c7-469a-aeaf-52c7e2be76a9" /></div>

* 動画の中の画像は[こちらの天気の子の絵コンテ](https://kadobun.jp/trial/ehb2tco22lko.html)を使わせて頂いています。

## Stack

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [OpenCV.js](https://docs.opencv.org/4.9.0/)
- [RadixUI Themes](https://www.radix-ui.com/)
- [TypeScript](https://www.typescriptlang.org/)

Don't need a server.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

If you want to check the operation of the build results.

```bash
npm run preview
```

## Deploy

When the main branch is updated, this project is automatically deployed to GitHub Pages.
