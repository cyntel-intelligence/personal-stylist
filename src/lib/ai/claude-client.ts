import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam } from "@anthropic-ai/sdk/resources/messages";

// Initialize the Anthropic client
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Model constants
export const CLAUDE_MODELS = {
  SONNET: "claude-3-7-sonnet-20250219" as const,
  OPUS: "claude-opus-4-5-20251101" as const,
} as const;

export type ClaudeModel = (typeof CLAUDE_MODELS)[keyof typeof CLAUDE_MODELS];

/**
 * Claude API client for making requests
 */
export class ClaudeClient {
  /**
   * Send a text-only message to Claude
   */
  async sendMessage(
    prompt: string,
    model: ClaudeModel = CLAUDE_MODELS.SONNET,
    maxTokens: number = 4096
  ): Promise<string> {
    try {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((block) => block.type === "text");
      return textContent && textContent.type === "text" ? textContent.text : "";
    } catch (error) {
      console.error("Claude API error:", error);
      throw new Error("Failed to get response from Claude");
    }
  }

  /**
   * Send a message with images to Claude
   */
  async sendMessageWithImages(
    prompt: string,
    imageUrls: string[],
    model: ClaudeModel = CLAUDE_MODELS.SONNET,
    maxTokens: number = 4096
  ): Promise<string> {
    try {
      // Fetch images and convert to base64
      const imageBlocks = await Promise.all(
        imageUrls.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          const base64 = await this.blobToBase64(blob);
          const mediaType = blob.type.includes("png") ? "image/png" : "image/jpeg";

          return {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64.split(",")[1], // Remove data:image/jpeg;base64, prefix
            },
          };
        })
      );

      // Create message with images and text
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: [
              ...imageBlocks,
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      });

      // Extract text from response
      const textContent = response.content.find((block) => block.type === "text");
      return textContent && textContent.type === "text" ? textContent.text : "";
    } catch (error) {
      console.error("Claude API error with images:", error);
      throw new Error("Failed to analyze images with Claude");
    }
  }

  /**
   * Send a structured request and expect JSON response
   */
  async sendStructuredRequest<T>(
    prompt: string,
    model: ClaudeModel = CLAUDE_MODELS.SONNET,
    maxTokens: number = 4096
  ): Promise<T> {
    try {
      const response = await this.sendMessage(prompt, model, maxTokens);

      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // If no JSON found, try parsing the whole response
      return JSON.parse(response);
    } catch (error) {
      console.error("Failed to parse structured response:", error);
      throw new Error("Failed to get structured response from Claude");
    }
  }

  /**
   * Helper to convert Blob to base64
   */
  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Estimate token count (rough approximation)
   * 1 token ≈ 4 characters for English text
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate estimated cost for a request
   * Prices as of March 2025
   */
  estimateCost(
    inputTokens: number,
    outputTokens: number,
    model: ClaudeModel = CLAUDE_MODELS.SONNET
  ): number {
    const pricing = {
      [CLAUDE_MODELS.SONNET]: {
        input: 3 / 1_000_000, // $3 per million tokens
        output: 15 / 1_000_000, // $15 per million tokens
      },
      [CLAUDE_MODELS.OPUS]: {
        input: 15 / 1_000_000, // $15 per million tokens
        output: 75 / 1_000_000, // $75 per million tokens
      },
    };

    const rates = pricing[model];
    return inputTokens * rates.input + outputTokens * rates.output;
  }
}

// Export a singleton instance
export const claudeClient = new ClaudeClient();

// Export types
export type { MessageParam };
