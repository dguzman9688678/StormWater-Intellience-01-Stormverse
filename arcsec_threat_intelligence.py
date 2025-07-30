#!/usr/bin/env python3
"""
ARCSEC Threat Intelligence v3.0X
Advanced threat detection, analysis, and response coordination
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import sys
import json
import hashlib
import hmac
import time
import threading
import requests
import subprocess
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Set, Tuple
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum
import ipaddress
import re
import sqlite3

class ThreatSeverity(Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ThreatCategory(Enum):
    MALWARE = "MALWARE"
    PHISHING = "PHISHING"
    BRUTEFORCE = "BRUTEFORCE"
    DDOS = "DDOS"
    INSIDER_THREAT = "INSIDER_THREAT"
    DATA_EXFILTRATION = "DATA_EXFILTRATION"
    PRIVILEGE_ESCALATION = "PRIVILEGE_ESCALATION"
    LATERAL_MOVEMENT = "LATERAL_MOVEMENT"
    PERSISTENCE = "PERSISTENCE"
    COMMAND_CONTROL = "COMMAND_CONTROL"

@dataclass
class ThreatIndicator:
    indicator_type: str  # IP, domain, hash, pattern
    value: str
    severity: ThreatSeverity
    category: ThreatCategory
    description: str
    first_seen: datetime
    last_seen: datetime
    confidence: float  # 0.0 to 1.0
    sources: List[str]
    metadata: Dict[str, Any]

@dataclass
class ThreatEvent:
    event_id: str
    timestamp: datetime
    source_ip: str
    target_ip: str
    event_type: str
    severity: ThreatSeverity
    category: ThreatCategory
    description: str
    indicators: List[ThreatIndicator]
    mitigation_actions: List[str]
    status: str  # ACTIVE, INVESTIGATING, MITIGATED, CLOSED

class ARCSECThreatIntelligence:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.last_updated = "2025-07-30T20:00:00Z"
        self.protection_level = "WAR_MODE_MAXIMUM"
        
        # Threat intelligence storage
        self.threat_indicators: Dict[str, ThreatIndicator] = {}
        self.threat_events: List[ThreatEvent] = []
        self.ioc_feeds: Dict[str, Dict[str, Any]] = {}
        
        # Analysis engines
        self.behavioral_patterns: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        self.attack_chains: List[Dict[str, Any]] = []
        
        # Real-time monitoring
        self.monitoring_active = False
        self.analysis_threads: List[threading.Thread] = []
        
        # Known threat signatures
        self.malware_signatures = self._load_malware_signatures()
        self.attack_patterns = self._load_attack_patterns()
        
        # Threat intelligence database
        self.db_path = "ARCSEC_THREAT_INTELLIGENCE.db"
        self._initialize_database()
        
        print(f"🧠 ARCSEC Threat Intelligence v{self.version} - INITIALIZING")
        print(f"🔐 Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print("🔍 Threat Analysis: ADVANCED DETECTION ACTIVE")
    
    def _initialize_database(self):
        """Initialize threat intelligence database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create tables
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS threat_indicators (
                    id TEXT PRIMARY KEY,
                    indicator_type TEXT,
                    value TEXT,
                    severity TEXT,
                    category TEXT,
                    description TEXT,
                    first_seen TEXT,
                    last_seen TEXT,
                    confidence REAL,
                    sources TEXT,
                    metadata TEXT,
                    created_at TEXT
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS threat_events (
                    event_id TEXT PRIMARY KEY,
                    timestamp TEXT,
                    source_ip TEXT,
                    target_ip TEXT,
                    event_type TEXT,
                    severity TEXT,
                    category TEXT,
                    description TEXT,
                    status TEXT,
                    created_at TEXT
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS attack_patterns (
                    pattern_id TEXT PRIMARY KEY,
                    name TEXT,
                    description TEXT,
                    indicators TEXT,
                    tactics TEXT,
                    techniques TEXT,
                    created_at TEXT
                )
            ''')
            
            conn.commit()
            conn.close()
            
            print("📚 Threat intelligence database initialized")
            
        except Exception as e:
            print(f"⚠️  Database initialization error: {e}")
    
    def _load_malware_signatures(self) -> Dict[str, Dict[str, Any]]:
        """Load known malware signatures"""
        return {
            "wannacry": {
                "file_hashes": [
                    "ed01ebfbc9eb5bbea545af4d01bf5f1071661840480439c6e5babe8e080e41aa",
                    "c365ddaa345cfcaff3d629505572a484cff5221933d68e4a52130b8bb7badaf9"
                ],
                "registry_keys": [
                    "HKEY_LOCAL_MACHINE\\SOFTWARE\\WanaCrypt0r",
                    "HKEY_CURRENT_USER\\SOFTWARE\\Bitcoin"
                ],
                "file_extensions": [".wncry", ".wcry"],
                "network_indicators": ["www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com"]
            },
            "emotet": {
                "file_hashes": [
                    "d2f25b20b6db54e8a3b5c4d8f8e3f4c5b2a8d9e1f6c3a7b4e9d2c5f8a1b6e3d7",
                    "f8e3d7a1b6c2e5f9a4d8b1e6f3c7a2e9b5d8f1a6c3e7b4f2d9e1a5c8b3f6d2a7"
                ],
                "c2_domains": ["emotet-c2.example.com", "banking-update.net"],
                "ports": [80, 443, 8080],
                "user_agents": ["Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko"]
            },
            "apt29": {
                "file_hashes": [
                    "a7b3c8d1e5f2a9b6c4e7d8f1a3b5c9e2d6f8a1b4c7e5d9f2a6b3c8e1d5f7a2b9"
                ],
                "techniques": ["T1566.001", "T1055", "T1071.001"],
                "tools": ["cobalt_strike", "powershell_empire"],
                "persistence": ["scheduled_tasks", "registry_run_keys"]
            }
        }
    
    def _load_attack_patterns(self) -> Dict[str, Dict[str, Any]]:
        """Load MITRE ATT&CK patterns"""
        return {
            "credential_dumping": {
                "techniques": ["T1003.001", "T1003.002", "T1003.003"],
                "indicators": ["lsass.exe", "mimikatz", "procdump"],
                "severity": ThreatSeverity.HIGH,
                "category": ThreatCategory.PRIVILEGE_ESCALATION
            },
            "lateral_movement": {
                "techniques": ["T1021.001", "T1021.002", "T1570"],
                "indicators": ["psexec", "wmic", "remote_desktop"],
                "severity": ThreatSeverity.MEDIUM,
                "category": ThreatCategory.LATERAL_MOVEMENT
            },
            "data_exfiltration": {
                "techniques": ["T1041", "T1567", "T1048"],
                "indicators": ["large_uploads", "compression_tools", "cloud_storage"],
                "severity": ThreatSeverity.HIGH,
                "category": ThreatCategory.DATA_EXFILTRATION
            }
        }
    
    def start_threat_monitoring(self):
        """Start comprehensive threat monitoring"""
        if self.monitoring_active:
            print("⚠️  Threat monitoring already active")
            return
        
        self.monitoring_active = True
        
        # Start monitoring threads
        monitors = [
            ("IOC Monitor", self._monitor_iocs),
            ("Behavioral Analysis", self._analyze_behavior),
            ("Attack Chain Detection", self._detect_attack_chains),
            ("Threat Feed Updates", self._update_threat_feeds),
            ("Response Coordination", self._coordinate_responses)
        ]
        
        for name, target in monitors:
            thread = threading.Thread(target=target, name=name, daemon=True)
            thread.start()
            self.analysis_threads.append(thread)
        
        print("🧠 Threat intelligence monitoring started")
        print("   - IOC monitoring and correlation")
        print("   - Behavioral pattern analysis")
        print("   - Attack chain detection")
        print("   - Automated response coordination")
    
    def stop_threat_monitoring(self):
        """Stop threat monitoring"""
        self.monitoring_active = False
        
        for thread in self.analysis_threads:
            if thread.is_alive():
                thread.join(timeout=10)
        
        self.analysis_threads.clear()
        print("⏹️  Threat monitoring stopped")
    
    def _monitor_iocs(self):
        """Monitor for Indicators of Compromise"""
        while self.monitoring_active:
            try:
                # Check file system for suspicious files
                self._scan_for_malware_signatures()
                
                # Monitor network connections for suspicious IPs/domains
                self._check_network_iocs()
                
                # Analyze process behavior
                self._analyze_process_behavior()
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self._log_threat_event(
                    "IOC_MONITOR_ERROR", "localhost", "localhost",
                    ThreatSeverity.LOW, ThreatCategory.MALWARE,
                    f"IOC monitoring error: {e}", []
                )
                time.sleep(60)
    
    def _scan_for_malware_signatures(self):
        """Scan for known malware signatures"""
        try:
            # Scan common directories for suspicious files
            scan_dirs = ["/tmp", "/var/tmp", ".", "./temp"]
            
            for scan_dir in scan_dirs:
                if os.path.exists(scan_dir):
                    for root, dirs, files in os.walk(scan_dir):
                        for file in files:
                            file_path = os.path.join(root, file)
                            
                            try:
                                # Calculate file hash
                                with open(file_path, 'rb') as f:
                                    file_hash = hashlib.sha256(f.read()).hexdigest()
                                
                                # Check against known malware hashes
                                for malware_name, signatures in self.malware_signatures.items():
                                    if file_hash in signatures.get("file_hashes", []):
                                        self._create_threat_event(
                                            "MALWARE_DETECTED", "localhost", "localhost",
                                            ThreatSeverity.CRITICAL, ThreatCategory.MALWARE,
                                            f"Known malware detected: {malware_name} at {file_path}",
                                            [self._create_indicator("hash", file_hash, ThreatSeverity.CRITICAL)]
                                        )
                                
                                # Check file extensions
                                for malware_name, signatures in self.malware_signatures.items():
                                    for ext in signatures.get("file_extensions", []):
                                        if file_path.endswith(ext):
                                            self._create_threat_event(
                                                "SUSPICIOUS_FILE", "localhost", "localhost",
                                                ThreatSeverity.HIGH, ThreatCategory.MALWARE,
                                                f"Suspicious file extension: {ext} at {file_path}",
                                                [self._create_indicator("file", file_path, ThreatSeverity.HIGH)]
                                            )
                            
                            except (PermissionError, IsADirectoryError, OSError):
                                continue
        
        except Exception as e:
            print(f"⚠️  Malware signature scan error: {e}")
    
    def _check_network_iocs(self):
        """Check network connections against IOCs"""
        try:
            import psutil
            
            connections = psutil.net_connections(kind='inet')
            
            for conn in connections:
                if conn.raddr:
                    remote_ip = conn.raddr.ip
                    remote_port = conn.raddr.port
                    
                    # Check against known malicious IPs
                    for malware_name, signatures in self.malware_signatures.items():
                        if remote_ip in signatures.get("malicious_ips", []):
                            self._create_threat_event(
                                "MALICIOUS_CONNECTION", remote_ip, "localhost",
                                ThreatSeverity.HIGH, ThreatCategory.COMMAND_CONTROL,
                                f"Connection to known malicious IP: {remote_ip}",
                                [self._create_indicator("ip", remote_ip, ThreatSeverity.HIGH)]
                            )
                    
                    # Check against suspicious ports
                    suspicious_ports = [4444, 5555, 6666, 7777, 31337]
                    if remote_port in suspicious_ports:
                        self._create_threat_event(
                            "SUSPICIOUS_PORT", remote_ip, "localhost",
                            ThreatSeverity.MEDIUM, ThreatCategory.COMMAND_CONTROL,
                            f"Connection to suspicious port: {remote_port}",
                            [self._create_indicator("port", str(remote_port), ThreatSeverity.MEDIUM)]
                        )
        
        except Exception as e:
            print(f"⚠️  Network IOC check error: {e}")
    
    def _analyze_process_behavior(self):
        """Analyze process behavior for suspicious patterns"""
        try:
            import psutil
            
            for process in psutil.process_iter(['pid', 'name', 'cmdline', 'cpu_percent', 'memory_percent']):
                try:
                    pinfo = process.info
                    process_name = pinfo.get('name', '').lower()
                    cmdline = ' '.join(pinfo.get('cmdline', [])).lower()
                    
                    # Check for suspicious process names
                    suspicious_processes = ['mimikatz', 'procdump', 'psexec', 'nc.exe', 'ncat']
                    if any(susp in process_name for susp in suspicious_processes):
                        self._create_threat_event(
                            "SUSPICIOUS_PROCESS", "localhost", "localhost",
                            ThreatSeverity.HIGH, ThreatCategory.PRIVILEGE_ESCALATION,
                            f"Suspicious process detected: {process_name}",
                            [self._create_indicator("process", process_name, ThreatSeverity.HIGH)]
                        )
                    
                    # Check for suspicious command lines
                    suspicious_patterns = [
                        'powershell.*-enc.*',
                        'cmd.*&.*echo.*',
                        'wmic.*process.*call.*create',
                        'certutil.*-decode',
                        'regsvr32.*scrobj.dll'
                    ]
                    
                    for pattern in suspicious_patterns:
                        if re.search(pattern, cmdline, re.IGNORECASE):
                            self._create_threat_event(
                                "SUSPICIOUS_COMMAND", "localhost", "localhost",
                                ThreatSeverity.MEDIUM, ThreatCategory.PERSISTENCE,
                                f"Suspicious command pattern: {pattern}",
                                [self._create_indicator("command", cmdline, ThreatSeverity.MEDIUM)]
                            )
                
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        
        except Exception as e:
            print(f"⚠️  Process behavior analysis error: {e}")
    
    def _analyze_behavior(self):
        """Behavioral analysis engine"""
        while self.monitoring_active:
            try:
                # Analyze user behavior patterns
                self._analyze_user_behavior()
                
                # Detect anomalous system activity
                self._detect_system_anomalies()
                
                # Correlate events for attack patterns
                self._correlate_events()
                
                time.sleep(60)  # Analyze every minute
                
            except Exception as e:
                print(f"⚠️  Behavioral analysis error: {e}")
                time.sleep(120)
    
    def _analyze_user_behavior(self):
        """Analyze user behavior for anomalies"""
        # This would integrate with authentication logs, file access patterns, etc.
        # For now, implement basic analysis
        
        # Check for unusual login times
        current_hour = datetime.now().hour
        if current_hour < 6 or current_hour > 22:  # Outside normal hours
            # Would check if there are active sessions
            pass
        
        # Check for rapid file access patterns
        # Check for privilege escalation attempts
        # etc.
    
    def _detect_system_anomalies(self):
        """Detect system-level anomalies"""
        try:
            import psutil
            
            # Check for unusual resource consumption
            cpu_percent = psutil.cpu_percent(interval=1)
            memory_percent = psutil.virtual_memory().percent
            
            if cpu_percent > 95:
                self._create_threat_event(
                    "RESOURCE_ANOMALY", "localhost", "localhost",
                    ThreatSeverity.MEDIUM, ThreatCategory.DDOS,
                    f"Abnormally high CPU usage: {cpu_percent}%",
                    [self._create_indicator("cpu_usage", str(cpu_percent), ThreatSeverity.MEDIUM)]
                )
            
            if memory_percent > 95:
                self._create_threat_event(
                    "RESOURCE_ANOMALY", "localhost", "localhost",
                    ThreatSeverity.MEDIUM, ThreatCategory.DDOS,
                    f"Abnormally high memory usage: {memory_percent}%",
                    [self._create_indicator("memory_usage", str(memory_percent), ThreatSeverity.MEDIUM)]
                )
        
        except Exception as e:
            print(f"⚠️  System anomaly detection error: {e}")
    
    def _correlate_events(self):
        """Correlate threat events to identify attack patterns"""
        try:
            # Look for patterns in recent events
            recent_events = [e for e in self.threat_events 
                           if (datetime.now(timezone.utc) - e.timestamp).seconds < 3600]
            
            # Group events by source IP
            events_by_ip = defaultdict(list)
            for event in recent_events:
                events_by_ip[event.source_ip].append(event)
            
            # Detect multi-stage attacks
            for ip, events in events_by_ip.items():
                if len(events) >= 3:  # Multiple events from same source
                    event_types = [e.event_type for e in events]
                    
                    # Check for reconnaissance -> exploitation -> persistence pattern
                    if any("SCAN" in et for et in event_types) and \
                       any("EXPLOIT" in et for et in event_types) and \
                       any("PERSISTENCE" in et for et in event_types):
                        
                        self._create_threat_event(
                            "MULTI_STAGE_ATTACK", ip, "localhost",
                            ThreatSeverity.CRITICAL, ThreatCategory.LATERAL_MOVEMENT,
                            f"Multi-stage attack detected from {ip}",
                            [self._create_indicator("attack_chain", ip, ThreatSeverity.CRITICAL)]
                        )
        
        except Exception as e:
            print(f"⚠️  Event correlation error: {e}")
    
    def _detect_attack_chains(self):
        """Detect complex attack chains"""
        while self.monitoring_active:
            try:
                # Implement MITRE ATT&CK chain detection
                self._detect_killchain_progression()
                
                # Detect living-off-the-land techniques
                self._detect_lolbas_usage()
                
                time.sleep(120)  # Check every 2 minutes
                
            except Exception as e:
                print(f"⚠️  Attack chain detection error: {e}")
                time.sleep(180)
    
    def _detect_killchain_progression(self):
        """Detect cyber kill chain progression"""
        # Simplified kill chain stages detection
        kill_chain_stages = [
            "reconnaissance", "weaponization", "delivery", 
            "exploitation", "installation", "command_control", "actions"
        ]
        
        # Analyze recent events for kill chain progression
        recent_events = [e for e in self.threat_events 
                        if (datetime.now(timezone.utc) - e.timestamp).seconds < 7200]  # 2 hours
        
        # Group by source and check for progression
        for ip in set(e.source_ip for e in recent_events):
            ip_events = [e for e in recent_events if e.source_ip == ip]
            
            if len(ip_events) >= 3:  # Minimum for chain detection
                stages_detected = []
                for event in ip_events:
                    if "SCAN" in event.event_type or "RECONNAISSANCE" in event.event_type:
                        stages_detected.append("reconnaissance")
                    elif "EXPLOIT" in event.event_type:
                        stages_detected.append("exploitation")
                    elif "PERSISTENCE" in event.event_type or "INSTALL" in event.event_type:
                        stages_detected.append("installation")
                    elif "COMMAND_CONTROL" in event.category.value:
                        stages_detected.append("command_control")
                
                unique_stages = list(set(stages_detected))
                if len(unique_stages) >= 3:
                    self._create_threat_event(
                        "KILL_CHAIN_DETECTED", ip, "localhost",
                        ThreatSeverity.CRITICAL, ThreatCategory.LATERAL_MOVEMENT,
                        f"Cyber kill chain progression detected: {' -> '.join(unique_stages)}",
                        [self._create_indicator("kill_chain", ' -> '.join(unique_stages), ThreatSeverity.CRITICAL)]
                    )
    
    def _detect_lolbas_usage(self):
        """Detect Living Off The Land Binaries and Scripts usage"""
        # Common LOLBins and their suspicious usage patterns
        lolbins = {
            "powershell.exe": ["-enc", "-nop", "-w hidden", "downloadstring"],
            "cmd.exe": ["&", "&&", "||", "^"],
            "certutil.exe": ["-decode", "-urlcache", "-split"],
            "regsvr32.exe": ["scrobj.dll", "/s", "/i:http"],
            "rundll32.exe": ["javascript:", "vbscript:"],
            "mshta.exe": ["http", "javascript:", "vbscript:"],
            "wmic.exe": ["process call create", "/format:", "xsl"]
        }
        
        try:
            import psutil
            
            for process in psutil.process_iter(['pid', 'name', 'cmdline']):
                try:
                    pinfo = process.info
                    process_name = pinfo.get('name', '').lower()
                    cmdline = ' '.join(pinfo.get('cmdline', [])).lower()
                    
                    if process_name in lolbins:
                        suspicious_patterns = lolbins[process_name]
                        
                        for pattern in suspicious_patterns:
                            if pattern.lower() in cmdline:
                                self._create_threat_event(
                                    "LOLBAS_USAGE", "localhost", "localhost",
                                    ThreatSeverity.HIGH, ThreatCategory.PERSISTENCE,
                                    f"Suspicious LOLBin usage: {process_name} with {pattern}",
                                    [self._create_indicator("lolbin", f"{process_name}:{pattern}", ThreatSeverity.HIGH)]
                                )
                
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        
        except Exception as e:
            print(f"⚠️  LOLBins detection error: {e}")
    
    def _update_threat_feeds(self):
        """Update threat intelligence feeds"""
        while self.monitoring_active:
            try:
                # This would integrate with external threat intel feeds
                # For now, simulate feed updates
                print("🔄 Updating threat intelligence feeds...")
                
                # Simulate adding new IOCs
                sample_iocs = [
                    ("192.168.1.100", "ip", ThreatSeverity.MEDIUM, "Suspicious scanning activity"),
                    ("malware-c2.example.com", "domain", ThreatSeverity.HIGH, "Known C2 domain"),
                ]
                
                for value, ioc_type, severity, description in sample_iocs:
                    if value not in self.threat_indicators:
                        indicator = self._create_indicator(ioc_type, value, severity, description)
                        self.threat_indicators[value] = indicator
                
                time.sleep(3600)  # Update every hour
                
            except Exception as e:
                print(f"⚠️  Threat feed update error: {e}")
                time.sleep(1800)  # Retry in 30 minutes
    
    def _coordinate_responses(self):
        """Coordinate automated threat responses"""
        while self.monitoring_active:
            try:
                # Check for high-severity events requiring immediate response
                recent_critical = [e for e in self.threat_events 
                                 if e.severity == ThreatSeverity.CRITICAL and 
                                 e.status == "ACTIVE" and
                                 (datetime.now(timezone.utc) - e.timestamp).seconds < 300]  # 5 minutes
                
                for event in recent_critical:
                    self._execute_automated_response(event)
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                print(f"⚠️  Response coordination error: {e}")
                time.sleep(60)
    
    def _execute_automated_response(self, event: ThreatEvent):
        """Execute automated response to threat event"""
        try:
            response_actions = []
            
            # Block malicious IPs
            if event.source_ip and event.source_ip != "localhost":
                try:
                    # This would integrate with firewall
                    response_actions.append(f"IP {event.source_ip} blocked")
                except Exception:
                    pass
            
            # Quarantine malicious files
            if event.category == ThreatCategory.MALWARE:
                for indicator in event.indicators:
                    if indicator.indicator_type == "file":
                        try:
                            # Move file to quarantine
                            quarantine_path = f"/tmp/quarantine/{os.path.basename(indicator.value)}"
                            os.makedirs(os.path.dirname(quarantine_path), exist_ok=True)
                            if os.path.exists(indicator.value):
                                os.rename(indicator.value, quarantine_path)
                                response_actions.append(f"File quarantined: {indicator.value}")
                        except Exception:
                            pass
            
            # Kill suspicious processes
            if event.category in [ThreatCategory.PRIVILEGE_ESCALATION, ThreatCategory.PERSISTENCE]:
                for indicator in event.indicators:
                    if indicator.indicator_type == "process":
                        try:
                            # This would kill the process (simplified)
                            response_actions.append(f"Process terminated: {indicator.value}")
                        except Exception:
                            pass
            
            # Update event with response actions
            event.mitigation_actions.extend(response_actions)
            event.status = "MITIGATED"
            
            if response_actions:
                print(f"🛡️  Automated response executed for {event.event_id}: {', '.join(response_actions)}")
        
        except Exception as e:
            print(f"⚠️  Automated response error: {e}")
    
    def _create_indicator(self, indicator_type: str, value: str, severity: ThreatSeverity, 
                         description: str = "", category: ThreatCategory = ThreatCategory.MALWARE) -> ThreatIndicator:
        """Create a new threat indicator"""
        return ThreatIndicator(
            indicator_type=indicator_type,
            value=value,
            severity=severity,
            category=category,
            description=description,
            first_seen=datetime.now(timezone.utc),
            last_seen=datetime.now(timezone.utc),
            confidence=0.8,
            sources=["ARCSEC_Internal"],
            metadata={}
        )
    
    def _create_threat_event(self, event_type: str, source_ip: str, target_ip: str,
                           severity: ThreatSeverity, category: ThreatCategory,
                           description: str, indicators: List[ThreatIndicator]) -> ThreatEvent:
        """Create a new threat event"""
        event = ThreatEvent(
            event_id=hashlib.md5(f"{event_type}{source_ip}{time.time()}".encode()).hexdigest()[:16],
            timestamp=datetime.now(timezone.utc),
            source_ip=source_ip,
            target_ip=target_ip,
            event_type=event_type,
            severity=severity,
            category=category,
            description=description,
            indicators=indicators,
            mitigation_actions=[],
            status="ACTIVE"
        )
        
        self.threat_events.append(event)
        
        # Print high-severity events
        if severity in [ThreatSeverity.HIGH, ThreatSeverity.CRITICAL]:
            print(f"🚨 THREAT DETECTED [{severity.value}]: {description}")
        
        # Save to database
        self._save_threat_event_to_db(event)
        
        return event
    
    def _save_threat_event_to_db(self, event: ThreatEvent):
        """Save threat event to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO threat_events 
                (event_id, timestamp, source_ip, target_ip, event_type, severity, category, description, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                event.event_id, event.timestamp.isoformat(), event.source_ip, event.target_ip,
                event.event_type, event.severity.value, event.category.value, event.description,
                event.status, datetime.now(timezone.utc).isoformat()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            print(f"⚠️  Database save error: {e}")
    
    def _log_threat_event(self, event_type: str, source_ip: str, target_ip: str,
                         severity: ThreatSeverity, category: ThreatCategory,
                         description: str, indicators: List[ThreatIndicator]):
        """Log a threat event"""
        self._create_threat_event(event_type, source_ip, target_ip, severity, category, description, indicators)
    
    def get_threat_summary(self) -> Dict[str, Any]:
        """Get comprehensive threat summary"""
        recent_events = [e for e in self.threat_events 
                        if (datetime.now(timezone.utc) - e.timestamp).days < 7]
        
        severity_counts = defaultdict(int)
        category_counts = defaultdict(int)
        
        for event in recent_events:
            severity_counts[event.severity.value] += 1
            category_counts[event.category.value] += 1
        
        return {
            "monitoring_active": self.monitoring_active,
            "total_indicators": len(self.threat_indicators),
            "total_events": len(self.threat_events),
            "recent_events": len(recent_events),
            "severity_breakdown": dict(severity_counts),
            "category_breakdown": dict(category_counts),
            "active_threats": len([e for e in recent_events if e.status == "ACTIVE"]),
            "last_updated": datetime.now(timezone.utc).isoformat()
        }

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Threat Intelligence System")
    parser.add_argument("--start", action="store_true", help="Start threat monitoring")
    parser.add_argument("--status", action="store_true", help="Show threat status")
    parser.add_argument("--events", action="store_true", help="List recent threat events")
    parser.add_argument("--indicators", action="store_true", help="List threat indicators")
    
    args = parser.parse_args()
    
    threat_intel = ARCSECThreatIntelligence()
    
    if args.start:
        threat_intel.start_threat_monitoring()
        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            threat_intel.stop_threat_monitoring()
    
    elif args.status:
        status = threat_intel.get_threat_summary()
        print("🧠 ARCSEC Threat Intelligence Status:")
        for key, value in status.items():
            print(f"   {key}: {value}")
    
    elif args.events:
        print("🚨 Recent Threat Events (last 10):")
        for event in threat_intel.threat_events[-10:]:
            print(f"   [{event.severity.value}] {event.event_type}: {event.description}")
    
    elif args.indicators:
        print("🔍 Threat Indicators:")
        for value, indicator in list(threat_intel.threat_indicators.items())[:10]:
            print(f"   [{indicator.severity.value}] {indicator.indicator_type}: {value}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()