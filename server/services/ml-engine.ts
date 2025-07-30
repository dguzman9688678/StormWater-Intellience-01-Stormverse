import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MLModelConfig {
  agentId: string;
  modelType: 'classification' | 'regression' | 'prediction' | 'analysis' | 'generation';
  specialization: string;
  confidenceThreshold: number;
  learningRate: number;
}

export interface MLPrediction {
  agentId: string;
  prediction: any;
  confidence: number;
  timestamp: Date;
  modelVersion: string;
  metadata: Record<string, any>;
}

export interface TrainingData {
  inputs: any[];
  outputs: any[];
  labels?: string[];
  features?: string[];
  metadata?: any;
  timestamp?: Date;
}

export class MLEngine {
  private models: Map<string, MLModelConfig> = new Map();
  private trainingHistory: Map<string, TrainingData[]> = new Map();
  private predictions: Map<string, MLPrediction[]> = new Map();

  constructor() {
    this.initializeAgentModels();
  }

  private initializeAgentModels() {
    const agentConfigs: MLModelConfig[] = [
      {
        agentId: 'JARVIS',
        modelType: 'classification',
        specialization: 'Command routing and decision trees',
        confidenceThreshold: 0.85,
        learningRate: 0.001
      },
      {
        agentId: 'STORM_CITADEL',
        modelType: 'prediction',
        specialization: 'Weather pattern prediction and hurricane tracking',
        confidenceThreshold: 0.90,
        learningRate: 0.002
      },
      {
        agentId: 'ULTRON',
        modelType: 'analysis',
        specialization: 'Data validation and integrity analysis',
        confidenceThreshold: 0.95,
        learningRate: 0.0015
      },
      {
        agentId: 'PHOENIX',
        modelType: 'regression',
        specialization: 'Memory optimization and data recovery patterns',
        confidenceThreshold: 0.80,
        learningRate: 0.0012
      },
      {
        agentId: 'ODIN',
        modelType: 'classification',
        specialization: 'Security threat detection and risk assessment',
        confidenceThreshold: 0.98,
        learningRate: 0.0008
      },
      {
        agentId: 'ECHO',
        modelType: 'generation',
        specialization: 'Natural language processing and audio analysis',
        confidenceThreshold: 0.75,
        learningRate: 0.002
      },
      {
        agentId: 'MITO',
        modelType: 'analysis',
        specialization: 'Code optimization and performance analysis',
        confidenceThreshold: 0.88,
        learningRate: 0.0018
      },
      {
        agentId: 'VADER',
        modelType: 'prediction',
        specialization: 'Network behavior prediction and anomaly detection',
        confidenceThreshold: 0.92,
        learningRate: 0.0014
      }
    ];

    agentConfigs.forEach(config => {
      this.models.set(config.agentId, config);
      this.trainingHistory.set(config.agentId, []);
      this.predictions.set(config.agentId, []);
    });
  }

  async trainAgent(agentId: string, trainingData: TrainingData): Promise<boolean> {
    const model = this.models.get(agentId);
    if (!model) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      // Use OpenAI for advanced training analysis
      const trainingAnalysis = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an advanced ML training coordinator for agent ${agentId} specializing in ${model.specialization}. Analyze the training data and provide optimization recommendations.`
          },
          {
            role: "user",
            content: `Analyze this training data for model type ${model.modelType}: ${JSON.stringify(trainingData)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(trainingAnalysis.choices[0].message.content || '{}');
      
      // Store training data with analysis
      const history = this.trainingHistory.get(agentId) || [];
      history.push({
        ...trainingData,
        metadata: analysis
      });
      this.trainingHistory.set(agentId, history);

      // Update model configuration based on analysis
      if (analysis.suggestedLearningRate) {
        model.learningRate = analysis.suggestedLearningRate;
      }
      if (analysis.suggestedConfidenceThreshold) {
        model.confidenceThreshold = analysis.suggestedConfidenceThreshold;
      }

      return true;
    } catch (error) {
      console.error(`Training failed for agent ${agentId}:`, error);
      return false;
    }
  }

  async predict(agentId: string, input: any): Promise<MLPrediction> {
    const model = this.models.get(agentId);
    if (!model) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      const predictionPrompt = this.buildPredictionPrompt(model, input);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are ${agentId}, an AI agent specializing in ${model.specialization}. Your model type is ${model.modelType}. Provide predictions with confidence scores.`
          },
          {
            role: "user",
            content: predictionPrompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      const prediction: MLPrediction = {
        agentId,
        prediction: result.prediction,
        confidence: result.confidence || 0.5,
        timestamp: new Date(),
        modelVersion: '1.0.0',
        metadata: {
          modelType: model.modelType,
          specialization: model.specialization,
          processingTime: Date.now()
        }
      };

      // Store prediction
      const predictions = this.predictions.get(agentId) || [];
      predictions.push(prediction);
      this.predictions.set(agentId, predictions.slice(-100)); // Keep last 100 predictions

      return prediction;
    } catch (error) {
      console.error(`Prediction failed for agent ${agentId}:`, error);
      throw error;
    }
  }

  private buildPredictionPrompt(model: MLModelConfig, input: any): string {
    const basePrompt = `Based on your specialization in ${model.specialization}, analyze the following input and provide a prediction:

Input: ${JSON.stringify(input)}

Please provide your response in JSON format with:
- prediction: your main prediction/analysis result
- confidence: confidence score between 0 and 1
- reasoning: brief explanation of your analysis
- recommendations: any actionable recommendations`;

    switch (model.modelType) {
      case 'classification':
        return `${basePrompt}
- classification: the category/class this input belongs to`;
      case 'regression':
        return `${basePrompt}
- value: the predicted numerical value
- range: the expected range of the prediction`;
      case 'prediction':
        return `${basePrompt}
- forecast: future state prediction
- timeframe: when this prediction applies`;
      case 'analysis':
        return `${basePrompt}
- insights: key analytical insights
- patterns: detected patterns in the data`;
      case 'generation':
        return `${basePrompt}
- generated_content: the generated output
- variations: alternative generations`;
      default:
        return basePrompt;
    }
  }

  async getModelMetrics(agentId: string): Promise<any> {
    const model = this.models.get(agentId);
    const history = this.trainingHistory.get(agentId) || [];
    const predictions = this.predictions.get(agentId) || [];

    if (!model) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const recentPredictions = predictions.slice(-20);
    const avgConfidence = recentPredictions.reduce((sum, p) => sum + p.confidence, 0) / recentPredictions.length || 0;

    return {
      agentId,
      modelType: model.modelType,
      specialization: model.specialization,
      configuration: {
        confidenceThreshold: model.confidenceThreshold,
        learningRate: model.learningRate
      },
      statistics: {
        totalTrainingSessions: history.length,
        totalPredictions: predictions.length,
        averageConfidence: avgConfidence,
        lastTrainingDate: history.length > 0 ? history[history.length - 1]?.timestamp : null,
        lastPredictionDate: predictions.length > 0 ? predictions[predictions.length - 1].timestamp : null
      },
      recentPerformance: {
        predictions: recentPredictions.map(p => ({
          confidence: p.confidence,
          timestamp: p.timestamp
        }))
      }
    };
  }

  async optimizeModel(agentId: string): Promise<boolean> {
    const metrics = await this.getModelMetrics(agentId);
    const model = this.models.get(agentId);
    
    if (!model) return false;

    try {
      const optimization = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an ML optimization expert. Analyze model performance and suggest improvements."
          },
          {
            role: "user",
            content: `Optimize this model configuration: ${JSON.stringify(metrics)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const optimizations = JSON.parse(optimization.choices[0].message.content || '{}');
      
      // Apply optimizations
      if (optimizations.learningRate) {
        model.learningRate = optimizations.learningRate;
      }
      if (optimizations.confidenceThreshold) {
        model.confidenceThreshold = optimizations.confidenceThreshold;
      }

      return true;
    } catch (error) {
      console.error(`Optimization failed for agent ${agentId}:`, error);
      return false;
    }
  }

  getAllModels(): Map<string, MLModelConfig> {
    return new Map(this.models);
  }

  getSystemStatus() {
    const models = Array.from(this.models.entries());
    const totalPredictions = Array.from(this.predictions.values())
      .reduce((sum, predictions) => sum + predictions.length, 0);
    
    return {
      totalAgents: models.length,
      totalPredictions,
      averageConfidence: this.calculateOverallConfidence(),
      systemHealth: this.calculateSystemHealth(),
      lastActivity: this.getLastActivity()
    };
  }

  private calculateOverallConfidence(): number {
    const allPredictions = Array.from(this.predictions.values()).flat();
    if (allPredictions.length === 0) return 0;
    
    return allPredictions.reduce((sum, p) => sum + p.confidence, 0) / allPredictions.length;
  }

  private calculateSystemHealth(): 'excellent' | 'good' | 'fair' | 'poor' {
    const confidence = this.calculateOverallConfidence();
    if (confidence > 0.9) return 'excellent';
    if (confidence > 0.8) return 'good';
    if (confidence > 0.7) return 'fair';
    return 'poor';
  }

  private getLastActivity(): Date | null {
    const allPredictions = Array.from(this.predictions.values()).flat();
    if (allPredictions.length === 0) return null;
    
    return allPredictions.reduce((latest, p) => 
      p.timestamp > latest ? p.timestamp : latest, new Date(0)
    );
  }
}

export const mlEngine = new MLEngine();