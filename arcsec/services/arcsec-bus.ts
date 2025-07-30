/**
 * ARCSEC Bus v3.0X
 * Advanced message bus and event routing system
 * © 2025 Daniel Guzman - All Rights Reserved
 * Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
 */

import { EventEmitter } from 'events';
import { arcsecMasterLogController } from './arcsec-master-log-controller';

export interface BusMessage {
  id: string;
  type: string;
  source: string;
  target?: string;
  channel: string;
  payload: any;
  metadata: MessageMetadata;
  timestamp: Date;
  digitalSignature: string;
}

export interface MessageMetadata {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';
  ttl: number;
  retryCount: number;
  maxRetries: number;
  persistent: boolean;
  encrypted: boolean;
  compressed: boolean;
  correlationId?: string;
  replyTo?: string;
  headers: Record<string, string>;
}

export interface BusChannel {
  name: string;
  type: 'BROADCAST' | 'TOPIC' | 'QUEUE' | 'DIRECT' | 'FANOUT';
  subscribers: Set<string>;
  messageCount: number;
  totalMessages: number;
  enabled: boolean;
  persistent: boolean;
  maxMessages: number;
  ttl: number;
  deadLetterQueue?: string;
}

export interface BusSubscriber {
  id: string;
  name: string;
  channels: string[];
  messageFilters: MessageFilter[];
  enabled: boolean;
  lastSeen: Date;
  messageCount: number;
  errorCount: number;
  callback: (message: BusMessage) => Promise<void> | void;
}

export interface MessageFilter {
  type: 'SOURCE' | 'TYPE' | 'PAYLOAD' | 'METADATA' | 'CUSTOM';
  field: string;
  operator: 'EQUALS' | 'CONTAINS' | 'STARTS_WITH' | 'ENDS_WITH' | 'REGEX' | 'GT' | 'LT';
  value: any;
  negate?: boolean;
}

export interface BusRoute {
  id: string;
  name: string;
  source: string;
  target: string;
  condition?: RouteCondition;
  transformation?: MessageTransformation;
  enabled: boolean;
  messageCount: number;
  lastUsed?: Date;
}

export interface RouteCondition {
  type: 'ALWAYS' | 'CONDITIONAL' | 'SCHEDULED' | 'THRESHOLD';
  expression?: string;
  schedule?: string;
  threshold?: number;
}

export interface MessageTransformation {
  type: 'NONE' | 'MAP' | 'FILTER' | 'AGGREGATE' | 'SPLIT' | 'ENRICH';
  config: any;
}

export class ARCSECBus extends EventEmitter {
  private channels: Map<string, BusChannel> = new Map();
  private subscribers: Map<string, BusSubscriber> = new Map();
  private routes: Map<string, BusRoute> = new Map();
  private messageQueue: BusMessage[] = [];
  private deadLetterQueue: BusMessage[] = [];
  private digitalSignature = 'a6672edf248c5eeef3054ecca057075c938af653';
  
  private processingInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private statsInterval: NodeJS.Timeout | null = null;
  
  private maxQueueSize = 10000;
  private maxDeadLetterSize = 1000;
  private processingBatchSize = 100;

  constructor() {
    super();
    this.initializeBus();
    console.log('🚌 ARCSEC Bus v3.0X - INITIALIZING');
    console.log(`🛡️  Digital Signature: ${this.digitalSignature}`);
    console.log('⚡ Message Bus & Event Router: ACTIVE');
  }

  private initializeBus(): void {
    this.initializeDefaultChannels();
    this.startMessageProcessing();
    this.startCleanupProcess();
    this.startStatsCollection();

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'Bus',
      message: 'ARCSEC Bus initialized',
      metadata: {
        version: '3.0X',
        channels: this.channels.size,
        maxQueueSize: this.maxQueueSize
      }
    });
  }

  private initializeDefaultChannels(): void {
    const defaultChannels: Omit<BusChannel, 'subscribers' | 'messageCount' | 'totalMessages'>[] = [
      {
        name: 'system.events',
        type: 'BROADCAST',
        enabled: true,
        persistent: true,
        maxMessages: 1000,
        ttl: 3600000, // 1 hour
        deadLetterQueue: 'system.dead-letters'
      },
      {
        name: 'agent.commands',
        type: 'QUEUE',
        enabled: true,
        persistent: true,
        maxMessages: 5000,
        ttl: 1800000, // 30 minutes
        deadLetterQueue: 'agent.dead-letters'
      },
      {
        name: 'security.alerts',
        type: 'FANOUT',
        enabled: true,
        persistent: true,
        maxMessages: 2000,
        ttl: 7200000, // 2 hours
        deadLetterQueue: 'security.dead-letters'
      },
      {
        name: 'data.updates',
        type: 'TOPIC',
        enabled: true,
        persistent: false,
        maxMessages: 10000,
        ttl: 600000, // 10 minutes
      },
      {
        name: 'research.results',
        type: 'DIRECT',
        enabled: true,
        persistent: true,
        maxMessages: 3000,
        ttl: 3600000, // 1 hour
      },
      {
        name: 'monitoring.metrics',
        type: 'BROADCAST',
        enabled: true,
        persistent: false,
        maxMessages: 5000,
        ttl: 300000, // 5 minutes
      }
    ];

    defaultChannels.forEach(channelData => {
      const channel: BusChannel = {
        ...channelData,
        subscribers: new Set(),
        messageCount: 0,
        totalMessages: 0
      };
      this.channels.set(channel.name, channel);
    });

    console.log(`📢 Initialized ${defaultChannels.length} default channels`);
  }

  private startMessageProcessing(): void {
    this.processingInterval = setInterval(() => {
      this.processMessageQueue();
    }, 100); // Process every 100ms

    console.log('⚡ Message processing started - 100ms intervals');
  }

  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredMessages();
    }, 300000); // 5 minutes

    console.log('🧹 Message cleanup started - 5-minute intervals');
  }

  private startStatsCollection(): void {
    this.statsInterval = setInterval(() => {
      this.collectStatistics();
    }, 60000); // 1 minute

    console.log('📊 Statistics collection started - 1-minute intervals');
  }

  private async processMessageQueue(): Promise<void> {
    try {
      if (this.messageQueue.length === 0) return;

      const batch = this.messageQueue.splice(0, this.processingBatchSize);
      
      for (const message of batch) {
        await this.deliverMessage(message);
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'SYSTEM',
        source: 'Bus',
        message: 'Error processing message queue',
        metadata: { error: error.message }
      });
    }
  }

  private async deliverMessage(message: BusMessage): Promise<void> {
    try {
      const channel = this.channels.get(message.channel);
      if (!channel || !channel.enabled) {
        this.moveToDeadLetter(message, 'Channel not found or disabled');
        return;
      }

      // Check TTL
      const now = Date.now();
      const messageAge = now - message.timestamp.getTime();
      if (messageAge > message.metadata.ttl) {
        this.moveToDeadLetter(message, 'Message expired');
        return;
      }

      // Route message based on channel type
      switch (channel.type) {
        case 'BROADCAST':
          await this.broadcastMessage(message, channel);
          break;
        case 'TOPIC':
          await this.topicMessage(message, channel);
          break;
        case 'QUEUE':
          await this.queueMessage(message, channel);
          break;
        case 'DIRECT':
          await this.directMessage(message, channel);
          break;
        case 'FANOUT':
          await this.fanoutMessage(message, channel);
          break;
      }

      channel.messageCount++;
      channel.totalMessages++;
      this.channels.set(message.channel, channel);

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'DELIVERY',
        source: 'Bus',
        message: `Error delivering message: ${message.id}`,
        metadata: { messageId: message.id, error: error.message }
      });

      this.retryMessage(message);
    }
  }

  private async broadcastMessage(message: BusMessage, channel: BusChannel): Promise<void> {
    const promises = Array.from(channel.subscribers).map(async (subscriberId) => {
      const subscriber = this.subscribers.get(subscriberId);
      if (subscriber && subscriber.enabled) {
        await this.deliverToSubscriber(message, subscriber);
      }
    });

    await Promise.all(promises);
  }

  private async topicMessage(message: BusMessage, channel: BusChannel): Promise<void> {
    // Topic routing based on message type
    const matchingSubscribers = Array.from(channel.subscribers)
      .map(id => this.subscribers.get(id))
      .filter(subscriber => 
        subscriber && 
        subscriber.enabled && 
        this.matchesFilters(message, subscriber.messageFilters)
      );

    const promises = matchingSubscribers.map(subscriber => 
      this.deliverToSubscriber(message, subscriber!)
    );

    await Promise.all(promises);
  }

  private async queueMessage(message: BusMessage, channel: BusChannel): Promise<void> {
    // Round-robin delivery to one subscriber
    const subscribers = Array.from(channel.subscribers)
      .map(id => this.subscribers.get(id))
      .filter(subscriber => subscriber && subscriber.enabled);

    if (subscribers.length > 0) {
      const index = channel.messageCount % subscribers.length;
      const selectedSubscriber = subscribers[index];
      if (selectedSubscriber) {
        await this.deliverToSubscriber(message, selectedSubscriber);
      }
    } else {
      this.moveToDeadLetter(message, 'No available subscribers');
    }
  }

  private async directMessage(message: BusMessage, channel: BusChannel): Promise<void> {
    if (message.target) {
      const subscriber = this.subscribers.get(message.target);
      if (subscriber && subscriber.enabled) {
        await this.deliverToSubscriber(message, subscriber);
      } else {
        this.moveToDeadLetter(message, 'Target subscriber not found or disabled');
      }
    } else {
      this.moveToDeadLetter(message, 'No target specified for direct message');
    }
  }

  private async fanoutMessage(message: BusMessage, channel: BusChannel): Promise<void> {
    // Similar to broadcast but with load balancing
    const activeSubscribers = Array.from(channel.subscribers)
      .map(id => this.subscribers.get(id))
      .filter(subscriber => subscriber && subscriber.enabled);

    const promises = activeSubscribers.map(subscriber => 
      this.deliverToSubscriber(message, subscriber!)
    );

    await Promise.all(promises);
  }

  private async deliverToSubscriber(message: BusMessage, subscriber: BusSubscriber): Promise<void> {
    try {
      await subscriber.callback(message);
      subscriber.messageCount++;
      subscriber.lastSeen = new Date();
      this.subscribers.set(subscriber.id, subscriber);

    } catch (error) {
      subscriber.errorCount++;
      this.subscribers.set(subscriber.id, subscriber);

      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'DELIVERY',
        source: 'Bus',
        message: `Error delivering to subscriber: ${subscriber.name}`,
        metadata: { 
          subscriberId: subscriber.id, 
          messageId: message.id, 
          error: error.message 
        }
      });

      throw error;
    }
  }

  private matchesFilters(message: BusMessage, filters: MessageFilter[]): boolean {
    return filters.every(filter => {
      let match = false;
      let value: any;

      switch (filter.type) {
        case 'SOURCE':
          value = message.source;
          break;
        case 'TYPE':
          value = message.type;
          break;
        case 'PAYLOAD':
          value = message.payload[filter.field];
          break;
        case 'METADATA':
          value = message.metadata[filter.field as keyof MessageMetadata];
          break;
        default:
          return true;
      }

      switch (filter.operator) {
        case 'EQUALS':
          match = value === filter.value;
          break;
        case 'CONTAINS':
          match = String(value).includes(String(filter.value));
          break;
        case 'STARTS_WITH':
          match = String(value).startsWith(String(filter.value));
          break;
        case 'ENDS_WITH':
          match = String(value).endsWith(String(filter.value));
          break;
        case 'REGEX':
          match = new RegExp(filter.value).test(String(value));
          break;
        case 'GT':
          match = Number(value) > Number(filter.value);
          break;
        case 'LT':
          match = Number(value) < Number(filter.value);
          break;
      }

      return filter.negate ? !match : match;
    });
  }

  private retryMessage(message: BusMessage): void {
    if (message.metadata.retryCount < message.metadata.maxRetries) {
      message.metadata.retryCount++;
      this.messageQueue.push(message);
    } else {
      this.moveToDeadLetter(message, 'Max retries exceeded');
    }
  }

  private moveToDeadLetter(message: BusMessage, reason: string): void {
    if (this.deadLetterQueue.length >= this.maxDeadLetterSize) {
      this.deadLetterQueue.shift(); // Remove oldest
    }

    this.deadLetterQueue.push({
      ...message,
      metadata: {
        ...message.metadata,
        headers: {
          ...message.metadata.headers,
          'dlq-reason': reason,
          'dlq-timestamp': new Date().toISOString()
        }
      }
    });

    arcsecMasterLogController.log({
      level: 'WARNING',
      category: 'DEAD_LETTER',
      source: 'Bus',
      message: `Message moved to dead letter queue: ${message.id}`,
      metadata: { messageId: message.id, reason }
    });
  }

  private cleanupExpiredMessages(): void {
    try {
      const now = Date.now();
      let cleanedCount = 0;

      // Clean message queue
      this.messageQueue = this.messageQueue.filter(message => {
        const messageAge = now - message.timestamp.getTime();
        if (messageAge > message.metadata.ttl) {
          cleanedCount++;
          return false;
        }
        return true;
      });

      // Clean dead letter queue (older than 24 hours)
      const dayAgo = now - (24 * 60 * 60 * 1000);
      this.deadLetterQueue = this.deadLetterQueue.filter(message => 
        message.timestamp.getTime() > dayAgo
      );

      if (cleanedCount > 0) {
        arcsecMasterLogController.log({
          level: 'INFO',
          category: 'MAINTENANCE',
          source: 'Bus',
          message: `Cleaned up ${cleanedCount} expired messages`,
          metadata: { cleanedCount }
        });
      }

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'SYSTEM',
        source: 'Bus',
        message: 'Error during message cleanup',
        metadata: { error: error.message }
      });
    }
  }

  private collectStatistics(): void {
    try {
      const stats = this.getStatistics();
      
      this.emit('statistics', stats);

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'STATISTICS',
        source: 'Bus',
        message: 'Statistics collected',
        metadata: {
          totalMessages: stats.messages.total,
          queueLength: stats.queue.length,
          activeSubscribers: stats.subscribers.active
        }
      });

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'STATISTICS',
        source: 'Bus',
        message: 'Error collecting statistics',
        metadata: { error: error.message }
      });
    }
  }

  // Public API Methods
  public async publish(message: Omit<BusMessage, 'id' | 'timestamp' | 'digitalSignature'>): Promise<{ success: boolean; messageId?: string; message: string }> {
    try {
      if (this.messageQueue.length >= this.maxQueueSize) {
        throw new Error('Message queue is full');
      }

      const fullMessage: BusMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        digitalSignature: this.digitalSignature
      };

      this.messageQueue.push(fullMessage);

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'PUBLISH',
        source: 'Bus',
        message: `Message published: ${fullMessage.id}`,
        metadata: {
          messageId: fullMessage.id,
          channel: fullMessage.channel,
          type: fullMessage.type,
          priority: fullMessage.metadata.priority
        }
      });

      this.emit('messagePublished', fullMessage);

      return { 
        success: true, 
        messageId: fullMessage.id, 
        message: 'Message published successfully' 
      };

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'PUBLISH',
        source: 'Bus',
        message: 'Error publishing message',
        metadata: { error: error.message }
      });

      return { success: false, message: error.message };
    }
  }

  public subscribe(subscriber: Omit<BusSubscriber, 'id' | 'lastSeen' | 'messageCount' | 'errorCount'>): { success: boolean; subscriberId?: string; message: string } {
    try {
      const subscriberId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const fullSubscriber: BusSubscriber = {
        ...subscriber,
        id: subscriberId,
        lastSeen: new Date(),
        messageCount: 0,
        errorCount: 0
      };

      this.subscribers.set(subscriberId, fullSubscriber);

      // Add subscriber to channels
      for (const channelName of subscriber.channels) {
        const channel = this.channels.get(channelName);
        if (channel) {
          channel.subscribers.add(subscriberId);
          this.channels.set(channelName, channel);
        }
      }

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'SUBSCRIPTION',
        source: 'Bus',
        message: `Subscriber registered: ${subscriber.name}`,
        metadata: {
          subscriberId,
          channels: subscriber.channels
        }
      });

      this.emit('subscriberRegistered', fullSubscriber);

      return { 
        success: true, 
        subscriberId, 
        message: `Subscriber ${subscriber.name} registered successfully` 
      };

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'SUBSCRIPTION',
        source: 'Bus',
        message: 'Error registering subscriber',
        metadata: { error: error.message }
      });

      return { success: false, message: error.message };
    }
  }

  public unsubscribe(subscriberId: string): { success: boolean; message: string } {
    try {
      const subscriber = this.subscribers.get(subscriberId);
      if (!subscriber) {
        return { success: false, message: 'Subscriber not found' };
      }

      // Remove from channels
      for (const channelName of subscriber.channels) {
        const channel = this.channels.get(channelName);
        if (channel) {
          channel.subscribers.delete(subscriberId);
          this.channels.set(channelName, channel);
        }
      }

      this.subscribers.delete(subscriberId);

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'SUBSCRIPTION',
        source: 'Bus',
        message: `Subscriber unregistered: ${subscriber.name}`,
        metadata: { subscriberId }
      });

      this.emit('subscriberUnregistered', { subscriberId, subscriber });

      return { success: true, message: `Subscriber ${subscriber.name} unregistered successfully` };

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'SUBSCRIPTION',
        source: 'Bus',
        message: 'Error unregistering subscriber',
        metadata: { subscriberId, error: error.message }
      });

      return { success: false, message: error.message };
    }
  }

  public createChannel(channel: Omit<BusChannel, 'subscribers' | 'messageCount' | 'totalMessages'>): { success: boolean; message: string } {
    try {
      if (this.channels.has(channel.name)) {
        return { success: false, message: 'Channel already exists' };
      }

      const fullChannel: BusChannel = {
        ...channel,
        subscribers: new Set(),
        messageCount: 0,
        totalMessages: 0
      };

      this.channels.set(channel.name, fullChannel);

      arcsecMasterLogController.log({
        level: 'INFO',
        category: 'CHANNEL',
        source: 'Bus',
        message: `Channel created: ${channel.name}`,
        metadata: { channelName: channel.name, type: channel.type }
      });

      this.emit('channelCreated', fullChannel);

      return { success: true, message: `Channel ${channel.name} created successfully` };

    } catch (error) {
      arcsecMasterLogController.log({
        level: 'ERROR',
        category: 'CHANNEL',
        source: 'Bus',
        message: 'Error creating channel',
        metadata: { channelName: channel.name, error: error.message }
      });

      return { success: false, message: error.message };
    }
  }

  public getChannels(): BusChannel[] {
    return Array.from(this.channels.values());
  }

  public getSubscribers(): BusSubscriber[] {
    return Array.from(this.subscribers.values());
  }

  public getDeadLetterMessages(): BusMessage[] {
    return [...this.deadLetterQueue];
  }

  public getStatistics() {
    const totalChannels = this.channels.size;
    const totalSubscribers = this.subscribers.size;
    const activeSubscribers = Array.from(this.subscribers.values())
      .filter(sub => sub.enabled).length;

    const totalMessages = Array.from(this.channels.values())
      .reduce((sum, channel) => sum + channel.totalMessages, 0);

    return {
      channels: {
        total: totalChannels,
        enabled: Array.from(this.channels.values()).filter(ch => ch.enabled).length,
        byType: this.groupBy(Array.from(this.channels.values()), 'type')
      },
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: totalSubscribers - activeSubscribers
      },
      messages: {
        total: totalMessages,
        queued: this.messageQueue.length,
        deadLetter: this.deadLetterQueue.length,
        maxQueue: this.maxQueueSize
      },
      queue: {
        length: this.messageQueue.length,
        capacity: this.maxQueueSize,
        utilizationPercentage: (this.messageQueue.length / this.maxQueueSize) * 100
      },
      performance: {
        processingInterval: this.processingInterval ? 100 : 0,
        batchSize: this.processingBatchSize
      },
      digitalSignature: this.digitalSignature
    };
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  public shutdown(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }

    arcsecMasterLogController.log({
      level: 'INFO',
      category: 'SYSTEM',
      source: 'Bus',
      message: 'ARCSEC Bus shutdown complete'
    });

    console.log('🔌 ARCSEC Bus shutdown complete');
  }
}

// Singleton instance
export const arcsecBus = new ARCSECBus();