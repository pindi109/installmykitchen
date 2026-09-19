exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API key not configured" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { image, mediaType } = body;
  if (!image || !mediaType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing image or mediaType" }),
    };
  }

  // Call Claude Vision
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-7",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: image },
            },
            {
              type: "text",
              text: `You are analysing a kitchen plan or photo to count cabinet units for installation cost estimation.

Count every kitchen cabinet unit visible: base units, wall units, tall/larder units, corner units. Each individual door opening counts as one unit. A 1000mm base unit with two doors = 2 units.

If this is a floor plan, count from the drawing. If a photo, count visible door/drawer fronts.

Return ONLY valid JSON with no other text:
{"units": <integer>, "confidence": "high|medium|low", "notes": "<one sentence explanation>"}

If you cannot determine a count, return: {"units": 0, "confidence": "low", "notes": "Unable to count units from this image — try a clearer photo or plan"}`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Claude API error", detail: err }),
    };
  }

  const data = await response.json();
  let result;
  try {
    result = JSON.parse(data.content[0].text);
  } catch {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "Could not parse Claude response" }),
    };
  }

  const units = Math.max(0, parseInt(result.units) || 0);

  // Map to size tier
  let size = "medium";
  if (units > 0 && units <= 12) size = "small";
  else if (units >= 21) size = "large";

  const costs = {
    small:  { low: 1800, high: 2800 },
    medium: { low: 2800, high: 4200 },
    large:  { low: 4200, high: 7500 },
  };

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      units,
      size,
      confidence: result.confidence || "low",
      notes: result.notes || "",
      costLow: costs[size].low,
      costHigh: costs[size].high,
    }),
  };
};
