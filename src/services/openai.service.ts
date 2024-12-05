import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import axios from 'axios';

interface TogetherAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly togetherAiUrl: string;
  private readonly togetherAiModel: string;
  private readonly openaiModel: string;
  private readonly logger = new Logger(OpenAIService.name);

  constructor(private readonly configService: ConfigService) {
    this.logger.log('Initializing OpenAI Service');
    try {
      const openaiApiKey = this.configService.getOrThrow<string>('OPENAI_API_KEY');
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      });
      
      this.togetherAiUrl = this.configService.getOrThrow<string>('TOGETHER_AI_URL');
      this.togetherAiModel = this.configService.getOrThrow<string>('TOGETHER_AI_MODEL');
      this.openaiModel = this.configService.getOrThrow<string>('OPENAI_MODEL');
      
      this.logger.log('Successfully initialized OpenAI Service with configurations');
      this.logger.debug(`Using OpenAI model: ${this.openaiModel}`);
      this.logger.debug(`Using Together AI model: ${this.togetherAiModel}`);
    } catch (error) {
      this.logger.error('Failed to initialize OpenAI Service', error);
      throw error;
    }
  }

  async getPriceFromImage(base64Image: string, prompt: string | undefined, ai?: string) {
    this.logger.debug(`Processing image with AI provider: ${ai}`);
    const defaultPrompt = this.configService.get<string>('DEFAULT_PROMPT') || 'Please analyze this image and provide information';
    const finalPrompt = prompt || defaultPrompt;
    
    this.logger.debug(`Using prompt: ${finalPrompt}`);

    if (ai === 'openai') {
      this.logger.log('Using OpenAI for image analysis');
      return this.getOpenAIPrice(base64Image, finalPrompt);
    }
    
    this.logger.log('Using Together AI for image analysis');
    return this.getTogetherAIPrice(base64Image, finalPrompt);
  }

  private async getOpenAIPrice(base64Image: string, prompt: string) {
    try {
      this.logger.debug('Sending request to OpenAI API');
      const maxTokens = parseInt(this.configService.get<string>('OPENAI_MAX_TOKENS') || '1000', 10);
      
      const response = await this.openai.chat.completions.create({
        model: this.openaiModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/webp;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: maxTokens,
      });
      
      this.logger.debug('Successfully received response from OpenAI');
      return response.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error in OpenAI API request', {
        error: error.message,
        stack: error.stack,
        status: error.status,
        model: this.openaiModel
      });
      throw error;
    }
  }

  private async getTogetherAIPrice(base64Image: string, prompt: string) {
    try {
      this.logger.debug('Sending request to Together AI API');
      const response = await axios.post(
        this.togetherAiUrl,
        {
          model: this.togetherAiModel,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/webp;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.configService.getOrThrow<string>('TOGETHER_AI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      this.logger.debug('Successfully received response from Together AI');
      const data = response.data as TogetherAIResponse;

      if (!data?.choices?.[0]?.message?.content) {
        const error = 'Invalid response format from Together AI API';
        this.logger.error(error, { response: data });
        throw new Error(error);
      }

      return data.choices[0].message.content;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Together AI API error', {
          error: error.message,
          response: error.response?.data,
          status: error.response?.status,
          model: this.togetherAiModel
        });
      } else {
        this.logger.error('Unexpected error in Together AI request', {
          error: error.message,
          stack: error.stack,
          model: this.togetherAiModel
        });
      }
      throw error;
    }
  }
}