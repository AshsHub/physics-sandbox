import { mkdirSync, readdirSync } from "node:fs";
import { basename, extname, join, resolve } from "node:path";
import { spawn } from "node:child_process";

const DEMO_DIR = resolve("public", "demos");
const GIF_DIR = DEMO_DIR;
const WEBM_DIR = join(DEMO_DIR, "webm");
const mode = process.argv[2] ?? "gif";

if (!["gif", "webm"].includes(mode)) {
  throw new Error('Usage: node scripts/demo/convert-about-media.mjs "gif|webm"');
}

mkdirSync(WEBM_DIR, {
  recursive: true,
});

const sourceDir = mode === "gif" ? WEBM_DIR : GIF_DIR;
const sourceExtension = mode === "gif" ? ".webm" : ".gif";
const outputDir = mode === "gif" ? GIF_DIR : WEBM_DIR;
const outputExtension = mode === "gif" ? ".gif" : ".webm";
const sourceFiles = readdirSync(sourceDir).filter(
  (file) => extname(file).toLowerCase() === sourceExtension,
);

if (sourceFiles.length === 0) {
  throw new Error(`No ${sourceExtension} files found in ${sourceDir}.`);
}

for (const sourceFile of sourceFiles) {
  const sourcePath = join(sourceDir, sourceFile);
  const outputPath = join(
    outputDir,
    `${basename(sourceFile, sourceExtension)}${outputExtension}`,
  );

  if (mode === "gif") {
    await convertWebmToGif(sourcePath, outputPath);
  } else {
    await convertGifToWebm(sourcePath, outputPath);
  }
}

async function convertGifToWebm(sourcePath, outputPath) {
  await run("ffmpeg", [
    "-y",
    "-i",
    sourcePath,
    "-vf",
    "scale=1280:-2:flags=lanczos",
    "-c:v",
    "libvpx",
    "-crf",
    "12",
    "-b:v",
    "1M",
    "-pix_fmt",
    "yuv420p",
    outputPath,
  ]);
}

async function convertWebmToGif(sourcePath, outputPath) {
  const palettePath = outputPath.replace(/\.gif$/u, "-palette.png");

  await run("ffmpeg", [
    "-y",
    "-i",
    sourcePath,
    "-vf",
    "fps=15,scale=960:-1:flags=lanczos,palettegen",
    "-update",
    "1",
    palettePath,
  ]);

  await run("ffmpeg", [
    "-y",
    "-i",
    sourcePath,
    "-i",
    palettePath,
    "-lavfi",
    "fps=15,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse",
    outputPath,
  ]);
}

function run(command, args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      reject(new Error(`${command} exited with code ${code}.`));
    });
  });
}
