# Implementation Plan - TikTube Tools New Feature Extension

This plan outlines the system integration of **TikTok Video Downloader HD** and **YouTube Transcript Extractor AI** using production-grade local queues, FFmpeg transcoding workflows, and official caption parsing + Gemini speech-to-text pipelines.

## 1. Tool #1: TikTok Downloader HD (AVC H.264 + AAC MP4)
- **Objective:** Enable high-definition, watermark-free vertical video downloads, scaled dynamically to 360p, 720p, or 1080p.
- **Backend Architecture:**
  - Establish a robust in-memory **Job Queue Engine** mimicking BullMQ on `/server.ts` to run asynchronous background transcode queues. It tracks states (`waiting`, `active`, `completed`, `failed`), supports retry mechanics, and streams live progress logs.
  - Retrieve TikTok raw MP4 streams using the free, production-grade `TikWM` lookup services.
  - Utilize `ffmpeg` (via `ffmpeg-static`) on the container to read the source byte buffer and transcode/convert it on disk (`/tmp`) to standard AVC H.264 video with AAC audio inside an MP4 container, applying adaptive scaling `-vf scale` flags based on client resolution choice.
- **Frontend Workflows:**
  - Create interactive card interface with live polling progress bars, state steppers (connecting, fetching bytes, transcoding, finalized), and download actions.
  - Provide inline preview player and video/author metrics.

## 2. Tool #2: YouTube Transcript Extractor AI
- **Objective:** Harvest highly accurate, multi-lingual (Arabic, English, French) transcripts with search filters and file export modules (TXT, SRT, JSON).
- **Backend Pipeline:**
  - Submit target YouTube URLs to the speech/caption queue.
  - **Primary Step:** Scrape official caption tracks from YouTube's timedtext player configurations. If found, parse XML directly into standardized JSON, TXT, and SRT with timed indices.
  - **Secondary Step (Whisper/Gemini Audio Pipeline Fallback):** If no captions are available:
    - Download the audio track (.mp3) to `/tmp`.
    - Securely stream input buffers to Google's Gemini Multimodal AI platform via the `@google/genai` TypeScript SDK.
    - Instruct Gemini to act as a state-of-the-art multilingual speaker transcriber, returning precise speech-to-text paragraphs with timestamps and punctuation fixes.
- **Frontend UI:**
  - Full transcript search bar with paragraph highlights.
  - Timed segment jumping, plus exports to CSV/JSON/SRT formats.

## 3. Configuration & Registry Updates
- **Metadata Registries:** Map `tk-downloader-hd` and `yt-transcript-ai` to track server queries inside site stats and audit dashboards.
- **Admin panel Controls:** Let admins toggle model providers, select Whisper sizes vs. Gemini instances, and globally disable/enable the newly built feature sets.
