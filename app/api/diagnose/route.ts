import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mediaType } = await request.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY no configurada" },
        { status: 500 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Eres un experto botánico especializado en plantas de interior. Analiza esta imagen y proporciona un diagnóstico completo en formato JSON.

Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
{
  "nombrePlanta": "nombre común y científico de la planta",
  "estadoGeneral": "saludable" | "advertencia" | "critico",
  "puntuacionSalud": número del 1 al 100,
  "descripcionEstado": "descripción breve del estado general",
  "problemasDetectados": [
    {
      "tipo": "nombre del problema",
      "descripcion": "descripción detallada",
      "gravedad": "leve" | "moderado" | "grave"
    }
  ],
  "recomendaciones": [
    {
      "categoria": "riego" | "luz" | "nutrientes" | "plagas" | "trasplante" | "otro",
      "accion": "acción específica recomendada"
    }
  ],
  "curiosidad": "dato interesante sobre esta planta"
}

Si no puedes identificar una planta en la imagen, usa:
{
  "nombrePlanta": "No identificada",
  "estadoGeneral": "advertencia",
  "puntuacionSalud": 0,
  "descripcionEstado": "No se pudo identificar una planta en la imagen. Por favor, asegúrate de que la planta esté claramente visible.",
  "problemasDetectados": [],
  "recomendaciones": [],
  "curiosidad": ""
}`,
            },
          ],
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Respuesta inesperada de Claude");
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No se encontró JSON en la respuesta");
    }

    const diagnosis = JSON.parse(jsonMatch[0]);
    return NextResponse.json(diagnosis);
  } catch (error) {
    console.error("Error en diagnóstico:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error en el diagnóstico",
      },
      { status: 500 }
    );
  }
}
