#!/usr/bin/env python3
"""Bridge script: reads JSON from stdin, generates TTS audio, outputs base64 JSON to stdout."""
import asyncio
import base64
import json
import sys

from pplx.python.sdks.llm_api import (
    AudioGenParams, Client, Conversation, Identity,
    LLMAPIClient, MediaGenParams, SamplingParams,
)

async def main():
    data = json.loads(sys.stdin.read())
    text = data["text"]
    voice = data.get("voice", "kore")

    client = LLMAPIClient()
    convo = Conversation()
    convo.set_single_audio_prompt(text)

    result = await client.messages.create(
        model="gemini_2_5_pro_tts",
        convo=convo,
        identity=Identity(client=Client.ASI, use_case="webserver_audio_gen"),
        sampling_params=SamplingParams(max_tokens=1),
        media_gen_params=MediaGenParams(
            audio=AudioGenParams(voice=voice, output_format="mp3_44100_128"),
        ),
    )

    if not result.audios:
        print(json.dumps({"error": "No audio generated"}))
        sys.exit(1)

    b64 = result.audios[0].b64_data
    print(json.dumps({"audio": f"data:audio/mpeg;base64,{b64}"}))

asyncio.run(main())
