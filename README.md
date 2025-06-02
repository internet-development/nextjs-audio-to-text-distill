# NEXTJS-OFFLINE-WHISPER-TO-LLM

![Image](https://github.com/user-attachments/assets/75313f6e-05ec-4bc4-8275-032ec07e5521)

This repository contains an offline-first, browser-based application developed with [Next.js](https://github.com/vercel/next.js/) that allows users to locally transcribe audio recordings (successfully tested for audio lengths up to 20 minutes) into accurate, plain-text transcripts.

These transcripts can then be processed by a locally hosted [Large Language Model](https://ollama.com/library/gemma3) (LLM), entirely offline without compromising data privacy.

While the initial setup for this repository may pose challenges for people without technical expertise, only two straightforward commands via a [CLI](https://ghostty.org/) are required once the environment is properly configured. This repository serves as an open source reference for securely handling sensitive data, ensuring it remains local and never transits external networks.

Contributions are welcome. If you wish to contribute, please submit a proposal via a GitHub issue or directly provide a pull request.

### Setup (MacOS)

Start by cloning the repository.

You will have wanted to setup your development environment by following steps [here](https://github.com/internet-development/nextjs-sass-starter/issues/3).

Then you will need to run the following commands

```sh
cd nextjs-offline-whisper-to-llm

npm install

brew install cmake
brew install ffmpeg
brew install ollama

# Best model for us is the best whisper model `large-v3-turbo`
npx nodejs-whisper download

# Start Ollama for the first time
# This command runs `ollama serve` with some environment variables
npm run llm

# Best model for us running on a MacBook Air M4, 2025 (32GB)
ollama pull gemma3:27b
```

Now you can run this script in another window

```sh
npm run local
```

Go to `http://localhost:10000` in your browser of choice.

### Development Scripts

If you need to run our test script to test the pipeline, run this command. This Script can also help fix the Whisper installation if you're running into issues with not being able to find `whisper-cli`

```sh
# Start Ollama for the first time
# This command runs `ollama serve` with some environment variables
npm run llm

# Then run this script in another window.
npm run script run
```

### Contact

If you have questions ping me on Twitter, [@wwwjim](https://www.twitter.com/wwwjim). Or you can ping [@internetxstudio](https://x.com/internetxstudio).
