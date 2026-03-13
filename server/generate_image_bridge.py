#!/usr/bin/env python3
"""Bridge script: reads JSON from stdin, generates image, outputs base64 JSON to stdout."""
import asyncio
import base64
import json
import sys

from pplx.python.sdks.llm_api import (
    Client, Conversation, Identity, ImageBlock, ImageGenAspectRatio,
    ImageGenParams, ImageSource, ImageSourceType, LLMAPIClient,
    MediaGenParams, SamplingParams, TextBlock,
)

ASPECT_RATIOS = {
    "1:1": ImageGenAspectRatio.RATIO_1_1,
    "3:4": ImageGenAspectRatio.RATIO_3_4,
    "4:3": ImageGenAspectRatio.RATIO_4_3,
    "9:16": ImageGenAspectRatio.RATIO_9_16,
    "16:9": ImageGenAspectRatio.RATIO_16_9,
}

async def main():
    data = json.loads(sys.stdin.read())
    prompt = data["prompt"]
    aspect_ratio = data.get("aspect_ratio", "1:1")

    client = LLMAPIClient()
    convo = Conversation()
    content = [TextBlock(text=prompt)]
    convo.add_user(content)

    result = await client.messages.create(
        model="nano_banana_2",
        convo=convo,
        identity=Identity(client=Client.ASI, use_case="webserver_image_gen"),
        sampling_params=SamplingParams(max_tokens=1),
        media_gen_params=MediaGenParams(
            image=ImageGenParams(
                number_of_images=1,
                aspect_ratio=ASPECT_RATIOS.get(aspect_ratio, ImageGenAspectRatio.RATIO_1_1),
            ),
        ),
    )

    if not result.images:
        print(json.dumps({"error": "No image generated"}))
        sys.exit(1)

    b64 = result.images[0].b64_data
    print(json.dumps({"image": f"data:image/png;base64,{b64}"}))

asyncio.run(main())
