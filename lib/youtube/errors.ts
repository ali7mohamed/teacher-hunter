export class YouTubeQuotaExceededError extends Error {
  constructor() {
    super("YouTube API quota exceeded");
    this.name = "YouTubeQuotaExceededError";
  }
}

export class YouTubeApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "YouTubeApiError";
  }
}
