import { Router, Request, Response } from 'express';
import { transcribeAudio } from '../services/transcriptionService.js';
import { detectLanguage, translateResponse, getSupportedLanguages } from '../services/translationService.js';

const router = Router();

// Transcribe Voice Note Audio
router.post('/voice/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, audioUrl, mimeType, languageHint } = req.body;
    const result = await transcribeAudio({ audioBase64, audioUrl, mimeType, languageHint });
    const detected = detectLanguage(result.text);

    res.json({
      success: true,
      transcription: result.text,
      language: detected.code,
      languageName: detected.name,
      isVernacular: detected.isVernacular,
      confidence: result.confidence,
      durationSeconds: result.durationSeconds
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Translate Message
router.post('/voice/translate', async (req: Request, res: Response) => {
  try {
    const { text, targetLang } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }

    const detected = detectLanguage(text);
    const target = targetLang || detected.code;
    const translated = await translateResponse(text, target);

    res.json({
      success: true,
      originalText: text,
      translatedText: translated,
      detectedLanguage: detected,
      targetLanguage: target
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Supported Multilingual Languages
router.get('/voice/languages', (req: Request, res: Response) => {
  res.json({
    success: true,
    languages: getSupportedLanguages()
  });
});

export default router;
