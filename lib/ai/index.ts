import { AnthropicThumbnailProvider } from "./anthropic-provider";
import type { AIProvider } from "./provider";

export const aiProvider: AIProvider = new AnthropicThumbnailProvider();
export type { ThumbnailInput } from "./provider";
