import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import os from "os";

const getAudioExtensionFromHeader = (headers: any) => {
  const ctype = headers["content-type"] || "";
  if (ctype.includes("audio/mpeg")) return ".mp3";
  if (ctype.includes("audio/ogg")) return ".ogg";
  if (ctype.includes("audio/wav")) return ".wav";
  if (ctype.includes("video/mp4")) return ".mp4";
  return null;
};

export const downloadToTempFile = async (url: string) => {
  const res = await axios.get(url, { responseType: "arraybuffer" });
  const ext = getAudioExtensionFromHeader(res.headers) || ".mp4";
  const tmpPath = path.join(os.tmpdir(), `msg_audio_${Date.now()}${ext}`);
  fs.writeFileSync(tmpPath, res.data);
  return tmpPath;
};

export const readAudioNGenerateText = async (
  filePath: string
): Promise<string> => {
  const form = new FormData();
  const stream = fs.createReadStream(filePath);
  form.append("file", stream);
  form.append("model", "whisper-1");

  const headers = {
    ...form.getHeaders(),
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  try {
    const resp = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 10 * 60 * 1000, // 10 minutes
        validateStatus: (s) => s < 500, // treat 5xx as errors to throw
      }
    );

    if (resp?.data?.text) return resp.data.text;
    return "Sorry, I couldn't process the audio message.";
  } catch (error: any) {
    console.error(
      "Error in voice to text conversion:",
      error?.response?.data || error.message || error
    );
    return "Sorry, I couldn't process the audio message.";
  } finally {
    stream.destroy?.();
    fs.unlink(filePath, () => {});
  }
};

export const convertImageToText = async (
  imgUrls: string[]
): Promise<string[]> => {
  const results: string[] = [];

  for (const url of imgUrls) {
    try {
      const res = await axios.post(
        "https://api.openai.com/v1/responses",
        {
          model: "gpt-4.1-mini",
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: "Describe the image in short with the necessary infromations",
                },
                {
                  type: "input_image",
                  image_url: url,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const description =
        res.data?.output?.[0]?.content?.[0]?.text || "No description";
      results.push(description);
    } catch (err: any) {
      console.error("Error describing the image:", err.response?.data || err);
      results.push("Error describing this image");
    }
  }

  return results;
};
