#!/usr/bin/env python3
"""Bridge script: reads JSON from stdin (base64 audio), transcribes, outputs JSON to stdout."""
import asyncio
import base64
import json
import sys

from pplx.python.sdks.llm_api import (
    AudioBlock, AudioSource, Client, Conversation, Identity,
    LLMAPIClient, MediaGenParams, SamplingParams, SpeechToTextParams,
)

async def main():
    data = json.loads(sys.stdin.read())
    audio_b64 = data["audio"]

    # Strip data URI prefix if present
    if "," in audio_b64:
        audio_b64 = audio_b64.split(",", 1)[1]

    client = LLMAPIClient()
    convo = Conversation()
    convo.add_user(AudioBlock(source=AudioSource(media_type="audio/webm", data=audio_b64)))

    result = await client.messages.create(
        model="elevenlabs_scribe_v2",
        convo=convo,
        identity=Identity(client=Client.ASI, use_case="webserver_transcription"),
        sampling_params=SamplingParams(max_tokens=1),
        media_gen_params=MediaGenParams(
            speech_to_text=SpeechToTextParams(
                diarize=False,
                timestamps_granularity="none",
            ),
        ),
    )

    if not result.transcriptions:
        print(json.dumps({"error": "No transcription generated"}))
        sys.exit(1)

    print(json.dumps({"text": result.transcriptions[0].text}))

asyncio.run(main())
