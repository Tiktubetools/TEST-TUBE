# Implementation Checklist - TikTube Tools New Feature Extension

- [ ] Define backend configuration variables for Whisper and Gemini Fallbacks in `.env.example`
- [ ] Implement robust background Job Queue System in `server.ts` mimicking BullMQ API
- [ ] Integrate FFmpeg-static transcode workflows to scale/package H.264 + AAC TikTok streams
- [ ] Build YouTube subtitle grabber with fallback auto-transcriber using Gemini Multimodal Audio
- [ ] Add `tk-downloader-hd` and `yt-transcript-ai` to tool lists and site stats inside `server.ts`
- [ ] Extend Admin panel settings (`Dashboard.tsx`) with provider select, Whisper configs, and global toggle buttons
- [ ] Create interactive `TikTokDownloaderHD.tsx` component inside `src/components/Tools/`
- [ ] Create interactive `YouTubeTranscriptAI.tsx` component inside `src/components/Tools/`
- [ ] Register new components inside `TikTokTools.tsx`, `YouTubeTools.tsx`, and `App.tsx`
- [ ] Conduct compilation checks with `lint_applet` and `compile_applet`
- [ ] Verify execution states and start production server
