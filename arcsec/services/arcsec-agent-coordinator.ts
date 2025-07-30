import { mlEngine, MLPrediction } from './arcsec-ml-engine.js';
import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AgentTask {
  id: string;
  type: 'weather_analysis' | 'security_scan' | 'data_validation' | 'prediction' | 'optimization' | 'communication' | 'monitoring';
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: any;
  assignedAgent?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  results?: any;
}

export interface AgentCollaboration {
  primaryAgent: string;
  supportingAgents: string[];
  task: AgentTask;
  collaborationType: 'parallel' | 'sequential' | 'hierarchical';
  results: Map<string, MLPrediction>;
}

export class AgentCoordinator {
  private taskQueue: AgentTask[] = [];
  private activeTasks: Map<string, AgentTask> = new Map();
  private collaborations: Map<string, AgentCollaboration> = new Map();
  private agentSpecializations: Map<string, string[]> = new Map();

  constructor() {
    this.initializeAgentSpecializations();
  }

  private initializeAgentSpecializations() {
    this.agentSpecializations.set('JARVIS', [
      'task_coordination', 'decision_making', 'resource_allocation', 'system_orchestration'
    ]);
    this.agentSpecializations.set('STORM_CITADEL', [
      'weather_prediction', 'hurricane_tracking', 'climate_analysis', 'atmospheric_modeling'
    ]);
    this.agentSpecializations.set('ULTRON', [
      'data_validation', 'integrity_analysis', 'metadata_processing', 'quality_assurance'
    ]);
    this.agentSpecializations.set('PHOENIX', [
      'memory_management', 'data_recovery', 'backup_strategies', 'resurrection_protocols'
    ]);
    this.agentSpecializations.set('ODIN', [
      'security_analysis', 'threat_detection', 'risk_assessment', 'protocol_enforcement'
    ]);
    this.agentSpecializations.set('ECHO', [
      'audio_processing', 'natural_language', 'communication', 'user_interaction'
    ]);
    this.agentSpecializations.set('MITO', [
      'code_optimization', 'performance_tuning', 'development_automation', 'system_enhancement'
    ]);
    this.agentSpecializations.set('VADER', [
      'network_monitoring', 'anomaly_detection', 'surveillance', 'pattern_recognition'
    ]);
  }

  async assignTask(task: AgentTask): Promise<string> {
    const bestAgent = await this.findBestAgent(task);
    task.assignedAgent = bestAgent;
    task.status = 'pending';
    
    this.taskQueue.push(task);
    this.activeTasks.set(task.id, task);
    
    // Process task immediately if possible
    await this.processTask(task.id);
    
    return bestAgent;
  }

  private async findBestAgent(task: AgentTask): Promise<string> {
    const taskAnalysis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are JARVIS, the coordinator of the StormVerse AI agent network. Analyze tasks and assign them to the most suitable agent based on their specializations."
        },
        {
          role: "user",
          content: `Analyze this task and recommend the best agent:
Task Type: ${task.type}
Priority: ${task.priority}
Payload: ${JSON.stringify(task.payload)}

Available agents and their specializations:
${Array.from(this.agentSpecializations.entries()).map(([agent, specs]) => 
  `${agent}: ${specs.join(', ')}`
).join('\n')}

Respond with JSON: {"recommendedAgent": "AGENT_NAME", "reasoning": "explanation", "confidence": 0.95}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(taskAnalysis.choices[0].message.content || '{}');
    return analysis.recommendedAgent || 'JARVIS';
  }

  async processTask(taskId: string): Promise<any> {
    const task = this.activeTasks.get(taskId);
    if (!task || !task.assignedAgent) {
      throw new Error(`Task ${taskId} not found or not assigned`);
    }

    try {
      task.status = 'processing';
      
      // Check if this task requires collaboration
      const needsCollaboration = await this.assessCollaborationNeed(task);
      
      if (needsCollaboration) {
        return await this.executeCollaborativeTask(task);
      } else {
        return await this.executeSingleAgentTask(task);
      }
    } catch (error) {
      task.status = 'failed';
      task.results = { error: error.message };
      throw error;
    }
  }

  private async assessCollaborationNeed(task: AgentTask): Promise<boolean> {
    const complexTaskTypes = ['weather_analysis', 'security_scan', 'prediction'];
    const highPriorityTasks = ['high', 'critical'];
    
    return complexTaskTypes.includes(task.type) || highPriorityTasks.includes(task.priority);
  }

  private async executeSingleAgentTask(task: AgentTask): Promise<any> {
    const prediction = await mlEngine.predict(task.assignedAgent!, task.payload);
    
    task.status = 'completed';
    task.completedAt = new Date();
    task.results = prediction;
    
    return prediction;
  }

  private async executeCollaborativeTask(task: AgentTask): Promise<any> {
    const collaboration = await this.setupCollaboration(task);
    const results = new Map<string, MLPrediction>();
    
    try {
      // Execute based on collaboration type
      switch (collaboration.collaborationType) {
        case 'parallel':
          await this.executeParallelCollaboration(collaboration, results);
          break;
        case 'sequential':
          await this.executeSequentialCollaboration(collaboration, results);
          break;
        case 'hierarchical':
          await this.executeHierarchicalCollaboration(collaboration, results);
          break;
      }
      
      // Synthesize results
      const finalResult = await this.synthesizeCollaborationResults(collaboration, results);
      
      task.status = 'completed';
      task.completedAt = new Date();
      task.results = finalResult;
      
      return finalResult;
    } catch (error) {
      task.status = 'failed';
      task.results = { error: error.message };
      throw error;
    }
  }

  private async setupCollaboration(task: AgentTask): Promise<AgentCollaboration> {
    const supportingAgents = await this.selectSupportingAgents(task);
    const collaborationType = this.determineCollaborationType(task);
    
    const collaboration: AgentCollaboration = {
      primaryAgent: task.assignedAgent!,
      supportingAgents,
      task,
      collaborationType,
      results: new Map()
    };
    
    this.collaborations.set(task.id, collaboration);
    return collaboration;
  }

  private async selectSupportingAgents(task: AgentTask): Promise<string[]> {
    const supportingAgents: string[] = [];
    
    switch (task.type) {
      case 'weather_analysis':
        supportingAgents.push('ULTRON', 'VADER'); // Data validation + Pattern recognition
        break;
      case 'security_scan':
        supportingAgents.push('VADER', 'PHOENIX'); // Network monitoring + Memory analysis
        break;
      case 'prediction':
        supportingAgents.push('ULTRON', 'MITO'); // Data validation + Performance analysis
        break;
      case 'data_validation':
        supportingAgents.push('PHOENIX', 'ODIN'); // Memory management + Security
        break;
    }
    
    return supportingAgents.filter(agent => agent !== task.assignedAgent);
  }

  private determineCollaborationType(task: AgentTask): 'parallel' | 'sequential' | 'hierarchical' {
    if (task.priority === 'critical') return 'parallel';
    if (task.type === 'data_validation') return 'sequential';
    return 'hierarchical';
  }

  private async executeParallelCollaboration(
    collaboration: AgentCollaboration, 
    results: Map<string, MLPrediction>
  ): Promise<void> {
    const allAgents = [collaboration.primaryAgent, ...collaboration.supportingAgents];
    const promises = allAgents.map(async (agent) => {
      const prediction = await mlEngine.predict(agent, collaboration.task.payload);
      results.set(agent, prediction);
      return prediction;
    });
    
    await Promise.all(promises);
  }

  private async executeSequentialCollaboration(
    collaboration: AgentCollaboration,
    results: Map<string, MLPrediction>
  ): Promise<void> {
    let currentPayload = collaboration.task.payload;
    
    // Process in sequence: primary agent first, then supporting agents
    const primaryResult = await mlEngine.predict(collaboration.primaryAgent, currentPayload);
    results.set(collaboration.primaryAgent, primaryResult);
    
    currentPayload = { ...currentPayload, previousResult: primaryResult };
    
    for (const agent of collaboration.supportingAgents) {
      const prediction = await mlEngine.predict(agent, currentPayload);
      results.set(agent, prediction);
      currentPayload = { ...currentPayload, previousResult: prediction };
    }
  }

  private async executeHierarchicalCollaboration(
    collaboration: AgentCollaboration,
    results: Map<string, MLPrediction>
  ): Promise<void> {
    // Supporting agents work in parallel first
    const supportingPromises = collaboration.supportingAgents.map(async (agent) => {
      const prediction = await mlEngine.predict(agent, collaboration.task.payload);
      results.set(agent, prediction);
      return prediction;
    });
    
    const supportingResults = await Promise.all(supportingPromises);
    
    // Primary agent processes with supporting results
    const enrichedPayload = {
      ...collaboration.task.payload,
      supportingAnalysis: supportingResults
    };
    
    const primaryResult = await mlEngine.predict(collaboration.primaryAgent, enrichedPayload);
    results.set(collaboration.primaryAgent, primaryResult);
  }

  private async synthesizeCollaborationResults(
    collaboration: AgentCollaboration,
    results: Map<string, MLPrediction>
  ): Promise<any> {
    const allResults = Array.from(results.entries()).map(([agent, prediction]) => ({
      agent,
      prediction: prediction.prediction,
      confidence: prediction.confidence
    }));

    const synthesis = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are JARVIS, synthesizing results from multiple AI agents. Combine their analyses into a coherent final result for task type: ${collaboration.task.type}`
        },
        {
          role: "user",
          content: `Synthesize these agent results:
${JSON.stringify(allResults, null, 2)}

Provide a comprehensive analysis that:
1. Weighs each agent's contribution based on their expertise
2. Identifies consensus and conflicts
3. Provides a final recommendation with confidence score
4. Highlights any areas needing attention

Respond in JSON format.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const synthesizedResult = JSON.parse(synthesis.choices[0].message.content || '{}');
    
    return {
      taskId: collaboration.task.id,
      primaryAgent: collaboration.primaryAgent,
      collaborationType: collaboration.collaborationType,
      individualResults: allResults,
      synthesizedResult,
      overallConfidence: synthesizedResult.confidence || 0.8,
      timestamp: new Date()
    };
  }

  async getTaskStatus(taskId: string): Promise<AgentTask | null> {
    return this.activeTasks.get(taskId) || null;
  }

  async getAgentWorkload(agentId: string): Promise<any> {
    const assignedTasks = Array.from(this.activeTasks.values())
      .filter(task => task.assignedAgent === agentId);
    
    const metrics = await mlEngine.getModelMetrics(agentId);
    
    return {
      agentId,
      currentTasks: assignedTasks.length,
      pendingTasks: assignedTasks.filter(t => t.status === 'pending').length,
      processingTasks: assignedTasks.filter(t => t.status === 'processing').length,
      completedTasks: assignedTasks.filter(t => t.status === 'completed').length,
      failedTasks: assignedTasks.filter(t => t.status === 'failed').length,
      modelMetrics: metrics,
      specializations: this.agentSpecializations.get(agentId) || []
    };
  }

  async getSystemOverview(): Promise<any> {
    const allTasks = Array.from(this.activeTasks.values());
    const systemStatus = mlEngine.getSystemStatus();
    
    const agentWorkloads = await Promise.all(
      Array.from(this.agentSpecializations.keys()).map(agentId => 
        this.getAgentWorkload(agentId)
      )
    );

    return {
      totalTasks: allTasks.length,
      tasksByStatus: {
        pending: allTasks.filter(t => t.status === 'pending').length,
        processing: allTasks.filter(t => t.status === 'processing').length,
        completed: allTasks.filter(t => t.status === 'completed').length,
        failed: allTasks.filter(t => t.status === 'failed').length
      },
      activeCollaborations: this.collaborations.size,
      mlSystemStatus: systemStatus,
      agentWorkloads,
      systemHealth: this.calculateSystemHealth(agentWorkloads)
    };
  }

  private calculateSystemHealth(workloads: any[]): 'excellent' | 'good' | 'fair' | 'poor' {
    const avgConfidence = workloads.reduce((sum, w) => sum + (w.modelMetrics.statistics.averageConfidence || 0), 0) / workloads.length;
    const totalLoad = workloads.reduce((sum, w) => sum + w.currentTasks, 0);
    
    if (avgConfidence > 0.9 && totalLoad < 50) return 'excellent';
    if (avgConfidence > 0.8 && totalLoad < 100) return 'good';
    if (avgConfidence > 0.7 && totalLoad < 200) return 'fair';
    return 'poor';
  }
}

export const agentCoordinator = new AgentCoordinator();