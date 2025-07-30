#!/usr/bin/env python3
"""
ARCSEC Webhook Gateway v3.0X
Advanced webhook management and external service integration
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import json
import hmac
import hashlib
import time
import asyncio
import aiohttp
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import urllib.parse
import base64

class WebhookEventType(Enum):
    SYSTEM_ALERT = "system.alert"
    SECURITY_INCIDENT = "security.incident"
    DEPLOYMENT_STATUS = "deployment.status"
    HEALTH_CHECK = "health.check"
    COMPLIANCE_VIOLATION = "compliance.violation"
    FILE_CHANGE = "file.change"
    ARCSEC_VIOLATION = "arcsec.violation"
    CUSTOM = "custom"

class WebhookStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    FAILED = "failed"
    DISABLED = "disabled"

@dataclass
class WebhookEndpoint:
    id: str
    name: str
    url: str
    secret: str
    events: List[WebhookEventType]
    status: WebhookStatus
    headers: Dict[str, str]
    retry_config: Dict[str, Any]
    metadata: Dict[str, Any]
    created: datetime
    last_success: Optional[datetime] = None
    last_failure: Optional[datetime] = None
    failure_count: int = 0

@dataclass
class WebhookEvent:
    id: str
    event_type: WebhookEventType
    timestamp: datetime
    source: str
    data: Dict[str, Any]
    metadata: Dict[str, Any]
    signature: str

@dataclass
class WebhookDelivery:
    id: str
    webhook_id: str
    event_id: str
    attempt: int
    status: str
    response_code: Optional[int]
    response_body: Optional[str]
    duration_ms: int
    timestamp: datetime
    error: Optional[str] = None

class ARCSECWebhookGateway:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        
        self.webhooks: Dict[str, WebhookEndpoint] = {}
        self.event_queue: asyncio.Queue = asyncio.Queue()
        self.delivery_history: List[WebhookDelivery] = []
        self.processing_task: Optional[asyncio.Task] = None
        
        # Configure logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
        
        # Integration configurations
        self.integrations = {
            'github': self.setup_github_integration,
            'slack': self.setup_slack_integration,
            'discord': self.setup_discord_integration,
            'teams': self.setup_teams_integration,
            'pagerduty': self.setup_pagerduty_integration,
            'datadog': self.setup_datadog_integration,
            'newrelic': self.setup_newrelic_integration,
            'aws': self.setup_aws_integration,
            'gcp': self.setup_gcp_integration,
            'azure': self.setup_azure_integration
        }
        
        print(f"🛰️  ARCSEC Webhook Gateway v{self.version} - INITIALIZING")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print("⚡ External Service Integration: ACTIVE")
    
    def generate_webhook_id(self) -> str:
        """Generate unique webhook ID"""
        timestamp = int(time.time() * 1000)
        return f"webhook-{timestamp}-{hashlib.md5(str(timestamp).encode()).hexdigest()[:8]}"
    
    def generate_event_id(self) -> str:
        """Generate unique event ID"""
        timestamp = int(time.time() * 1000)
        return f"event-{timestamp}-{hashlib.md5(str(timestamp).encode()).hexdigest()[:8]}"
    
    def generate_signature(self, payload: str, secret: str) -> str:
        """Generate HMAC signature for webhook payload"""
        return hmac.new(
            secret.encode('utf-8'),
            payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
    
    def register_webhook(self, name: str, url: str, events: List[WebhookEventType], 
                        secret: Optional[str] = None, headers: Optional[Dict[str, str]] = None,
                        retry_config: Optional[Dict[str, Any]] = None) -> str:
        """Register a new webhook endpoint"""
        webhook_id = self.generate_webhook_id()
        
        if not secret:
            secret = base64.urlsafe_b64encode(os.urandom(32)).decode('utf-8')
        
        if not headers:
            headers = {"Content-Type": "application/json"}
        
        if not retry_config:
            retry_config = {
                "max_attempts": 3,
                "initial_delay": 1000,  # ms
                "max_delay": 30000,     # ms
                "backoff_factor": 2
            }
        
        webhook = WebhookEndpoint(
            id=webhook_id,
            name=name,
            url=url,
            secret=secret,
            events=events,
            status=WebhookStatus.ACTIVE,
            headers=headers,
            retry_config=retry_config,
            metadata={
                "creator": self.creator,
                "digital_signature": self.digital_signature,
                "version": self.version
            },
            created=datetime.now(timezone.utc)
        )
        
        self.webhooks[webhook_id] = webhook
        
        self.logger.info(f"Registered webhook: {name} ({webhook_id})")
        return webhook_id
    
    def emit_event(self, event_type: WebhookEventType, source: str, data: Dict[str, Any],
                   metadata: Optional[Dict[str, Any]] = None) -> str:
        """Emit a webhook event"""
        event_id = self.generate_event_id()
        
        if not metadata:
            metadata = {}
        
        # Add ARCSEC metadata
        metadata.update({
            "arcsec_version": self.version,
            "digital_signature": self.digital_signature,
            "creator": self.creator
        })
        
        event = WebhookEvent(
            id=event_id,
            event_type=event_type,
            timestamp=datetime.now(timezone.utc),
            source=source,
            data=data,
            metadata=metadata,
            signature=""  # Will be set during delivery
        )
        
        # Queue event for processing
        asyncio.create_task(self.event_queue.put(event))
        
        self.logger.info(f"Emitted event: {event_type.value} from {source} ({event_id})")
        return event_id
    
    async def process_events(self):
        """Process events from the queue"""
        while True:
            try:
                event = await self.event_queue.get()
                await self.deliver_event(event)
            except Exception as e:
                self.logger.error(f"Error processing event: {str(e)}")
    
    async def deliver_event(self, event: WebhookEvent):
        """Deliver event to all matching webhooks"""
        matching_webhooks = [
            webhook for webhook in self.webhooks.values()
            if webhook.status == WebhookStatus.ACTIVE and event.event_type in webhook.events
        ]
        
        if not matching_webhooks:
            self.logger.debug(f"No webhooks configured for event type: {event.event_type.value}")
            return
        
        # Deliver to all matching webhooks
        tasks = [
            self.deliver_to_webhook(webhook, event)
            for webhook in matching_webhooks
        ]
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def deliver_to_webhook(self, webhook: WebhookEndpoint, event: WebhookEvent):
        """Deliver event to a specific webhook with retry logic"""
        attempt = 1
        max_attempts = webhook.retry_config.get("max_attempts", 3)
        delay = webhook.retry_config.get("initial_delay", 1000) / 1000  # Convert to seconds
        
        while attempt <= max_attempts:
            delivery_id = f"delivery-{int(time.time() * 1000)}-{attempt}"
            start_time = time.time()
            
            try:
                # Prepare payload
                payload = {
                    "event_id": event.id,
                    "event_type": event.event_type.value,
                    "timestamp": event.timestamp.isoformat(),
                    "source": event.source,
                    "data": event.data,
                    "metadata": event.metadata
                }
                
                payload_str = json.dumps(payload, separators=(',', ':'))
                signature = self.generate_signature(payload_str, webhook.secret)
                
                # Prepare headers
                headers = webhook.headers.copy()
                headers.update({
                    "X-ARCSEC-Signature": f"sha256={signature}",
                    "X-ARCSEC-Event-ID": event.id,
                    "X-ARCSEC-Event-Type": event.event_type.value,
                    "X-ARCSEC-Timestamp": str(int(event.timestamp.timestamp())),
                    "X-ARCSEC-Delivery": delivery_id,
                    "User-Agent": f"ARCSEC-Webhook-Gateway/{self.version}"
                })
                
                # Make HTTP request
                timeout = aiohttp.ClientTimeout(total=30)
                async with aiohttp.ClientSession(timeout=timeout) as session:
                    async with session.post(
                        webhook.url,
                        data=payload_str,
                        headers=headers
                    ) as response:
                        response_body = await response.text()
                        duration_ms = int((time.time() - start_time) * 1000)
                        
                        # Record delivery
                        delivery = WebhookDelivery(
                            id=delivery_id,
                            webhook_id=webhook.id,
                            event_id=event.id,
                            attempt=attempt,
                            status="success" if response.status < 400 else "failed",
                            response_code=response.status,
                            response_body=response_body[:1000],  # Limit size
                            duration_ms=duration_ms,
                            timestamp=datetime.now(timezone.utc)
                        )
                        
                        self.delivery_history.append(delivery)
                        
                        if response.status < 400:
                            # Success
                            webhook.last_success = datetime.now(timezone.utc)
                            webhook.failure_count = 0
                            self.logger.info(f"Webhook delivery successful: {webhook.name} ({delivery_id})")
                            return
                        else:
                            # HTTP error
                            delivery.error = f"HTTP {response.status}: {response_body[:200]}"
                            raise aiohttp.ClientResponseError(
                                request_info=None,
                                history=None,
                                status=response.status,
                                message=response_body
                            )
            
            except Exception as e:
                duration_ms = int((time.time() - start_time) * 1000)
                error_msg = str(e)
                
                # Record failed delivery
                delivery = WebhookDelivery(
                    id=delivery_id,
                    webhook_id=webhook.id,
                    event_id=event.id,
                    attempt=attempt,
                    status="failed",
                    response_code=None,
                    response_body=None,
                    duration_ms=duration_ms,
                    timestamp=datetime.now(timezone.utc),
                    error=error_msg
                )
                
                self.delivery_history.append(delivery)
                
                if attempt == max_attempts:
                    # Final attempt failed
                    webhook.last_failure = datetime.now(timezone.utc)
                    webhook.failure_count += 1
                    
                    if webhook.failure_count >= 5:
                        webhook.status = WebhookStatus.FAILED
                        self.logger.warning(f"Webhook marked as failed: {webhook.name}")
                    
                    self.logger.error(f"Webhook delivery failed after {max_attempts} attempts: {webhook.name}")
                    return
                else:
                    # Retry with backoff
                    self.logger.warning(f"Webhook delivery attempt {attempt} failed, retrying: {webhook.name}")
                    await asyncio.sleep(delay)
                    delay *= webhook.retry_config.get("backoff_factor", 2)
                    delay = min(delay, webhook.retry_config.get("max_delay", 30000) / 1000)
            
            attempt += 1
    
    def start_processing(self):
        """Start the event processing task"""
        if self.processing_task is None or self.processing_task.done():
            self.processing_task = asyncio.create_task(self.process_events())
            self.logger.info("Started webhook event processing")
    
    def stop_processing(self):
        """Stop the event processing task"""
        if self.processing_task and not self.processing_task.done():
            self.processing_task.cancel()
            self.logger.info("Stopped webhook event processing")
    
    # Integration setup methods
    def setup_github_integration(self, config: Dict[str, Any]) -> str:
        """Setup GitHub webhook integration"""
        events = [
            WebhookEventType.DEPLOYMENT_STATUS,
            WebhookEventType.SECURITY_INCIDENT,
            WebhookEventType.FILE_CHANGE
        ]
        
        return self.register_webhook(
            name="GitHub Integration",
            url=config.get("webhook_url"),
            events=events,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"token {config.get('token')}"
            }
        )
    
    def setup_slack_integration(self, config: Dict[str, Any]) -> str:
        """Setup Slack webhook integration"""
        events = [
            WebhookEventType.SYSTEM_ALERT,
            WebhookEventType.SECURITY_INCIDENT,
            WebhookEventType.COMPLIANCE_VIOLATION
        ]
        
        return self.register_webhook(
            name="Slack Integration",
            url=config.get("webhook_url"),
            events=events,
            headers={"Content-Type": "application/json"}
        )
    
    def setup_discord_integration(self, config: Dict[str, Any]) -> str:
        """Setup Discord webhook integration"""
        events = [WebhookEventType.SYSTEM_ALERT, WebhookEventType.DEPLOYMENT_STATUS]
        
        return self.register_webhook(
            name="Discord Integration",
            url=config.get("webhook_url"),
            events=events,
            headers={"Content-Type": "application/json"}
        )
    
    def setup_teams_integration(self, config: Dict[str, Any]) -> str:
        """Setup Microsoft Teams webhook integration"""
        events = [
            WebhookEventType.SYSTEM_ALERT,
            WebhookEventType.SECURITY_INCIDENT,
            WebhookEventType.COMPLIANCE_VIOLATION
        ]
        
        return self.register_webhook(
            name="Microsoft Teams Integration",
            url=config.get("webhook_url"),
            events=events,
            headers={"Content-Type": "application/json"}
        )
    
    def setup_pagerduty_integration(self, config: Dict[str, Any]) -> str:
        """Setup PagerDuty integration"""
        events = [
            WebhookEventType.SYSTEM_ALERT,
            WebhookEventType.SECURITY_INCIDENT
        ]
        
        return self.register_webhook(
            name="PagerDuty Integration",
            url="https://events.pagerduty.com/v2/enqueue",
            events=events,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Token token={config.get('api_key')}"
            }
        )
    
    def setup_datadog_integration(self, config: Dict[str, Any]) -> str:
        """Setup Datadog webhook integration"""
        events = [
            WebhookEventType.SYSTEM_ALERT,
            WebhookEventType.HEALTH_CHECK
        ]
        
        return self.register_webhook(
            name="Datadog Integration",
            url=f"https://api.datadoghq.com/api/v1/events?api_key={config.get('api_key')}",
            events=events,
            headers={"Content-Type": "application/json"}
        )
    
    def setup_newrelic_integration(self, config: Dict[str, Any]) -> str:
        """Setup New Relic integration"""
        events = [WebhookEventType.SYSTEM_ALERT, WebhookEventType.DEPLOYMENT_STATUS]
        
        return self.register_webhook(
            name="New Relic Integration",
            url="https://api.newrelic.com/v2/applications.json",
            events=events,
            headers={
                "Content-Type": "application/json",
                "X-Api-Key": config.get("api_key")
            }
        )
    
    def setup_aws_integration(self, config: Dict[str, Any]) -> str:
        """Setup AWS SNS/SQS integration"""
        events = [
            WebhookEventType.SYSTEM_ALERT,
            WebhookEventType.SECURITY_INCIDENT,
            WebhookEventType.DEPLOYMENT_STATUS
        ]
        
        return self.register_webhook(
            name="AWS Integration",
            url=config.get("sns_endpoint") or config.get("webhook_url"),
            events=events,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"AWS4-HMAC-SHA256 {config.get('auth_header')}"
            }
        )
    
    def setup_gcp_integration(self, config: Dict[str, Any]) -> str:
        """Setup Google Cloud Platform integration"""
        events = [
            WebhookEventType.SYSTEM_ALERT,
            WebhookEventType.DEPLOYMENT_STATUS
        ]
        
        return self.register_webhook(
            name="GCP Integration",
            url=config.get("webhook_url"),
            events=events,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {config.get('access_token')}"
            }
        )
    
    def setup_azure_integration(self, config: Dict[str, Any]) -> str:
        """Setup Microsoft Azure integration"""
        events = [
            WebhookEventType.SYSTEM_ALERT,
            WebhookEventType.SECURITY_INCIDENT
        ]
        
        return self.register_webhook(
            name="Azure Integration",
            url=config.get("webhook_url"),
            events=events,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {config.get('access_token')}"
            }
        )
    
    def get_webhook_stats(self) -> Dict[str, Any]:
        """Get webhook statistics"""
        total_webhooks = len(self.webhooks)
        active_webhooks = sum(1 for w in self.webhooks.values() if w.status == WebhookStatus.ACTIVE)
        failed_webhooks = sum(1 for w in self.webhooks.values() if w.status == WebhookStatus.FAILED)
        
        total_deliveries = len(self.delivery_history)
        successful_deliveries = sum(1 for d in self.delivery_history if d.status == "success")
        failed_deliveries = total_deliveries - successful_deliveries
        
        return {
            "webhooks": {
                "total": total_webhooks,
                "active": active_webhooks,
                "failed": failed_webhooks,
                "success_rate": (active_webhooks / total_webhooks * 100) if total_webhooks > 0 else 0
            },
            "deliveries": {
                "total": total_deliveries,
                "successful": successful_deliveries,
                "failed": failed_deliveries,
                "success_rate": (successful_deliveries / total_deliveries * 100) if total_deliveries > 0 else 0
            },
            "integrations": {
                "available": list(self.integrations.keys()),
                "configured": [w.name for w in self.webhooks.values()]
            }
        }
    
    def export_configuration(self) -> Dict[str, Any]:
        """Export webhook configuration"""
        return {
            "version": self.version,
            "creator": self.creator,
            "digital_signature": self.digital_signature,
            "exported": datetime.now(timezone.utc).isoformat(),
            "webhooks": [
                {
                    "id": webhook.id,
                    "name": webhook.name,
                    "url": webhook.url,
                    "events": [e.value for e in webhook.events],
                    "status": webhook.status.value,
                    "headers": {k: v for k, v in webhook.headers.items() if k != "Authorization"},
                    "retry_config": webhook.retry_config,
                    "created": webhook.created.isoformat()
                }
                for webhook in self.webhooks.values()
            ]
        }

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Webhook Gateway")
    parser.add_argument("--config", help="Configuration file path")
    parser.add_argument("--test", help="Test webhook URL")
    parser.add_argument("--list", action="store_true", help="List configured webhooks")
    parser.add_argument("--stats", action="store_true", help="Show webhook statistics")
    
    args = parser.parse_args()
    
    gateway = ARCSECWebhookGateway()
    
    if args.config:
        # Load configuration
        try:
            with open(args.config, 'r') as f:
                config = json.load(f)
            
            for webhook_config in config.get("webhooks", []):
                events = [WebhookEventType(e) for e in webhook_config["events"]]
                gateway.register_webhook(
                    name=webhook_config["name"],
                    url=webhook_config["url"],
                    events=events,
                    headers=webhook_config.get("headers", {})
                )
            
            print(f"✅ Loaded {len(config.get('webhooks', []))} webhooks from configuration")
            
        except Exception as e:
            print(f"❌ Failed to load configuration: {str(e)}")
            return
    
    if args.test:
        # Test webhook
        webhook_id = gateway.register_webhook(
            name="Test Webhook",
            url=args.test,
            events=[WebhookEventType.SYSTEM_ALERT]
        )
        
        # Start processing
        gateway.start_processing()
        
        # Send test event
        event_id = gateway.emit_event(
            event_type=WebhookEventType.SYSTEM_ALERT,
            source="ARCSEC_TEST",
            data={"message": "Test webhook delivery", "test": True}
        )
        
        print(f"🧪 Test event sent: {event_id}")
        print(f"🛰️  Webhook: {args.test}")
        
        # Wait for delivery
        import time
        time.sleep(5)
        
        gateway.stop_processing()
    
    elif args.list:
        # List webhooks
        if not gateway.webhooks:
            print("No webhooks configured")
        else:
            print("📋 Configured Webhooks:")
            for webhook in gateway.webhooks.values():
                events_str = ", ".join([e.value for e in webhook.events])
                print(f"   {webhook.name} ({webhook.status.value})")
                print(f"     URL: {webhook.url}")
                print(f"     Events: {events_str}")
                print()
    
    elif args.stats:
        # Show statistics
        stats = gateway.get_webhook_stats()
        
        print("📊 Webhook Gateway Statistics")
        print(f"   Total Webhooks: {stats['webhooks']['total']}")
        print(f"   Active: {stats['webhooks']['active']}")
        print(f"   Failed: {stats['webhooks']['failed']}")
        print(f"   Success Rate: {stats['webhooks']['success_rate']:.1f}%")
        print()
        print(f"   Total Deliveries: {stats['deliveries']['total']}")
        print(f"   Successful: {stats['deliveries']['successful']}")
        print(f"   Failed: {stats['deliveries']['failed']}")
        print(f"   Delivery Success Rate: {stats['deliveries']['success_rate']:.1f}%")
        print()
        print(f"   Available Integrations: {', '.join(stats['integrations']['available'])}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()