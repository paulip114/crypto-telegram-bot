const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const cryptoNewsCommand = require("../src/commands/news");
const { summarizeCryptoNews } = require("../src/GPT/summarizeNews");

// Mock axios
const mock = new MockAdapter(axios);

jest.mock("../src/GPT/summarizeNews", () => ({
  summarizeCryptoNews: jest.fn(),
}));

describe("Telegram /crypto_news command", () => {
  let mockCtx;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCtx = {
      reply: jest.fn(),
      sendChatAction: jest.fn(),
    };
  });

  test("should fetch crypto news and return a summary", async () => {
    // Mock API response
    mock.onGet(/cryptopanic.com/).reply(200, {
      results: [
        { title: "Bitcoin Hits $60K", url: "https://example.com/1" },
        {
          title: "Ethereum Upgrade Reduces Fees",
          url: "https://example.com/2",
        },
        {
          title: "Binance Expands to More Countries",
          url: "https://example.com/3",
        },
      ],
    });

    // Mock OpenAI summary response
    summarizeCryptoNews.mockResolvedValue(
      "🔍 Summary:\n1. Bitcoin Hits $60K.\n2. Ethereum upgrade lowers fees.\n3. Binance expands."
    );

    await cryptoNewsCommand(mockCtx);

    // Check if bot sends messages
    expect(mockCtx.reply).toHaveBeenCalledTimes(3);

    // Check first message (Fetching news...)
    expect(mockCtx.reply).toHaveBeenCalledWith(
      "🔍 Fetching crypto news, please wait..."
    );

    // Check if it returns news titles
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("1. Bitcoin Hits $60K")
    );

    // Check OpenAI summary is returned
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("🔍 Summary:")
    );
  });

  test("should handle API failure gracefully", async () => {
    mock.onGet(/cryptopanic.com/).reply(500); // Simulate API failure

    summarizeCryptoNews.mockResolvedValue("⚠️ Failed to summarize news.");

    await cryptoNewsCommand(mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      "🔍 Fetching crypto news, please wait..."
    );
    expect(mockCtx.reply).toHaveBeenCalledWith(
      expect.stringContaining("⚠️ Failed to summarize news.")
    );
  });
});
