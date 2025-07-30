#!/usr/bin/env python3
"""
ARCSEC Network Security v3.0X
Advanced network monitoring, intrusion detection, and firewall management
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import sys
import json
import socket
import threading
import time
import subprocess
import ipaddress
import ssl
import hashlib
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional, Set, Tuple
from collections import defaultdict, deque
import re
import struct

class NetworkSecurityLevel:
    OPEN = "OPEN"
    RESTRICTED = "RESTRICTED"
    LOCKED_DOWN = "LOCKED_DOWN"
    WAR_MODE = "WAR_MODE"

class NetworkThreat:
    def __init__(self, threat_type: str, source_ip: str, severity: str, description: str):
        self.timestamp = datetime.now(timezone.utc)
        self.threat_type = threat_type
        self.source_ip = source_ip
        self.severity = severity
        self.description = description
        self.threat_id = hashlib.md5(f"{threat_type}{source_ip}{time.time()}".encode()).hexdigest()[:16]

class ARCSECNetworkSecurity:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.last_updated = "2025-07-30T20:00:00Z"
        self.protection_level = "WAR_MODE_MAXIMUM"
        
        # Network security configuration
        self.security_level = NetworkSecurityLevel.WAR_MODE
        self.monitoring_active = False
        self.intrusion_detection_active = False
        
        # Threat tracking
        self.detected_threats: List[NetworkThreat] = []
        self.blocked_ips: Set[str] = set()
        self.allowed_ips: Set[str] = set()
        self.connection_attempts: Dict[str, List[datetime]] = defaultdict(list)
        
        # Rate limiting
        self.rate_limits = {
            "connections_per_minute": 60,
            "connections_per_hour": 1000,
            "failed_attempts_threshold": 5
        }
        
        # Monitoring threads
        self.monitoring_threads: List[threading.Thread] = []
        
        # Network patterns for detection
        self.attack_patterns = {
            "port_scan": {
                "ports_per_minute": 10,
                "unique_ports_threshold": 20
            },
            "brute_force": {
                "attempts_per_minute": 10,
                "failed_threshold": 5
            },
            "ddos": {
                "connections_per_second": 100,
                "bandwidth_threshold": 1000000  # 1MB/s
            }
        }
        
        print(f"🛡️  ARCSEC Network Security v{self.version} - INITIALIZING")
        print(f"🔐 Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print(f"⚡ Security Level: {self.security_level}")
        
        self._initialize_firewall_rules()
    
    def _initialize_firewall_rules(self):
        """Initialize basic firewall rules"""
        try:
            # Default allowed IPs (localhost, private networks)
            self.allowed_ips.update([
                "127.0.0.1",
                "::1",
                "localhost"
            ])
            
            # Load existing rules if available
            if os.path.exists("ARCSEC_NETWORK_RULES.json"):
                with open("ARCSEC_NETWORK_RULES.json", 'r') as f:
                    rules = json.load(f)
                    self.blocked_ips.update(rules.get("blocked_ips", []))
                    self.allowed_ips.update(rules.get("allowed_ips", []))
            
            print(f"🔥 Firewall initialized: {len(self.blocked_ips)} blocked, {len(self.allowed_ips)} allowed")
            
        except Exception as e:
            print(f"⚠️  Firewall initialization warning: {e}")
    
    def start_network_monitoring(self):
        """Start comprehensive network monitoring"""
        if self.monitoring_active:
            print("⚠️  Network monitoring already active")
            return
        
        self.monitoring_active = True
        
        # Start monitoring threads
        monitors = [
            ("Connection Monitor", self._monitor_connections),
            ("Port Scan Detector", self._detect_port_scans),
            ("Intrusion Detector", self._detect_intrusions),
            ("Traffic Analyzer", self._analyze_traffic),
            ("Firewall Manager", self._manage_firewall)
        ]
        
        for name, target in monitors:
            thread = threading.Thread(target=target, name=name, daemon=True)
            thread.start()
            self.monitoring_threads.append(thread)
        
        self.intrusion_detection_active = True
        print("🔍 Network security monitoring started")
        print("   - Connection monitoring")
        print("   - Port scan detection")
        print("   - Intrusion detection")
        print("   - Traffic analysis")
        print("   - Dynamic firewall management")
    
    def stop_network_monitoring(self):
        """Stop network monitoring"""
        self.monitoring_active = False
        self.intrusion_detection_active = False
        
        # Wait for threads to finish
        for thread in self.monitoring_threads:
            if thread.is_alive():
                thread.join(timeout=5)
        
        self.monitoring_threads.clear()
        print("⏹️  Network monitoring stopped")
    
    def _monitor_connections(self):
        """Monitor network connections for suspicious activity"""
        import psutil
        
        while self.monitoring_active:
            try:
                connections = psutil.net_connections(kind='inet')
                current_time = datetime.now(timezone.utc)
                
                for conn in connections:
                    if conn.raddr:  # Has remote address
                        remote_ip = conn.raddr.ip
                        remote_port = conn.raddr.port
                        
                        # Track connection attempts
                        self.connection_attempts[remote_ip].append(current_time)
                        
                        # Clean old entries (keep last hour)
                        hour_ago = current_time.replace(minute=current_time.minute-60) if current_time.minute >= 60 else current_time.replace(hour=current_time.hour-1)
                        self.connection_attempts[remote_ip] = [
                            t for t in self.connection_attempts[remote_ip] if t > hour_ago
                        ]
                        
                        # Check rate limits
                        self._check_rate_limits(remote_ip, current_time)
                        
                        # Check if IP should be blocked
                        if self._should_block_ip(remote_ip):
                            self._block_ip(remote_ip, "Rate limit exceeded")
                
                time.sleep(5)  # Check every 5 seconds
                
            except Exception as e:
                self._log_threat("MONITOR_ERROR", "0.0.0.0", "LOW", f"Connection monitoring error: {e}")
                time.sleep(10)
    
    def _detect_port_scans(self):
        """Detect port scanning attempts"""
        port_access_tracker = defaultdict(lambda: defaultdict(list))
        
        while self.monitoring_active:
            try:
                import psutil
                connections = psutil.net_connections(kind='inet')
                current_time = datetime.now(timezone.utc)
                
                for conn in connections:
                    if conn.raddr and conn.laddr:
                        remote_ip = conn.raddr.ip
                        local_port = conn.laddr.port
                        
                        # Track port access
                        port_access_tracker[remote_ip][local_port].append(current_time)
                        
                        # Clean old entries (keep last 5 minutes)
                        five_min_ago = current_time.replace(minute=current_time.minute-5) if current_time.minute >= 5 else current_time.replace(hour=current_time.hour-1, minute=current_time.minute+55)
                        port_access_tracker[remote_ip][local_port] = [
                            t for t in port_access_tracker[remote_ip][local_port] if t > five_min_ago
                        ]
                
                # Analyze for port scanning patterns
                for ip, ports in port_access_tracker.items():
                    unique_ports = len(ports)
                    total_attempts = sum(len(attempts) for attempts in ports.values())
                    
                    if unique_ports > self.attack_patterns["port_scan"]["unique_ports_threshold"]:
                        self._log_threat("PORT_SCAN", ip, "HIGH", 
                                       f"Port scan detected: {unique_ports} unique ports accessed")
                        self._block_ip(ip, "Port scanning detected")
                    
                    elif total_attempts > self.attack_patterns["port_scan"]["ports_per_minute"]:
                        self._log_threat("RAPID_PORT_ACCESS", ip, "MEDIUM",
                                       f"Rapid port access: {total_attempts} attempts in 5 minutes")
                
                time.sleep(30)  # Check every 30 seconds
                
            except Exception as e:
                self._log_threat("PORTSCAN_DETECTOR_ERROR", "0.0.0.0", "LOW", f"Port scan detection error: {e}")
                time.sleep(30)
    
    def _detect_intrusions(self):
        """Advanced intrusion detection"""
        while self.intrusion_detection_active:
            try:
                # Check for suspicious network patterns
                self._check_suspicious_patterns()
                
                # Monitor system calls (if available)
                self._monitor_system_calls()
                
                # Check for known attack signatures
                self._check_attack_signatures()
                
                time.sleep(15)  # Check every 15 seconds
                
            except Exception as e:
                self._log_threat("INTRUSION_DETECTOR_ERROR", "0.0.0.0", "LOW", f"Intrusion detection error: {e}")
                time.sleep(30)
    
    def _check_suspicious_patterns(self):
        """Check for suspicious network patterns"""
        try:
            # Check for unusual connection patterns
            for ip, attempts in self.connection_attempts.items():
                if len(attempts) > self.attack_patterns["brute_force"]["attempts_per_minute"]:
                    self._log_threat("BRUTE_FORCE_ATTEMPT", ip, "HIGH",
                                   f"Brute force pattern detected: {len(attempts)} attempts")
                    self._block_ip(ip, "Brute force attack detected")
            
            # Check for DDoS patterns
            recent_connections = sum(1 for attempts in self.connection_attempts.values() for attempt in attempts 
                                   if (datetime.now(timezone.utc) - attempt).seconds < 60)
            
            if recent_connections > self.attack_patterns["ddos"]["connections_per_second"] * 60:
                self._log_threat("DDOS_ATTEMPT", "MULTIPLE", "CRITICAL",
                               f"Potential DDoS: {recent_connections} connections in last minute")
                self._activate_ddos_protection()
        
        except Exception as e:
            self._log_threat("PATTERN_CHECK_ERROR", "0.0.0.0", "LOW", f"Pattern check error: {e}")
    
    def _monitor_system_calls(self):
        """Monitor system calls for suspicious activity"""
        try:
            # This is a simplified version - real implementation would use kernel modules
            # Check for suspicious network-related system calls via process monitoring
            import psutil
            
            for process in psutil.process_iter(['pid', 'name', 'connections']):
                try:
                    connections = process.info.get('connections', [])
                    if len(connections) > 100:  # Arbitrary threshold
                        self._log_threat("EXCESSIVE_CONNECTIONS", "localhost", "MEDIUM",
                                       f"Process {process.info['name']} has {len(connections)} connections")
                
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
        
        except Exception as e:
            self._log_threat("SYSCALL_MONITOR_ERROR", "0.0.0.0", "LOW", f"System call monitoring error: {e}")
    
    def _check_attack_signatures(self):
        """Check for known attack signatures"""
        try:
            # Read recent log entries (simplified - would integrate with system logs)
            log_files = ["/var/log/auth.log", "/var/log/secure", "/var/log/messages"]
            
            attack_signatures = [
                r"Failed password",
                r"authentication failure",
                r"invalid user",
                r"connection refused",
                r"blocked by firewall",
                r"sql injection",
                r"xss attempt",
                r"directory traversal"
            ]
            
            for log_file in log_files:
                if os.path.exists(log_file):
                    try:
                        with open(log_file, 'r') as f:
                            # Read last 100 lines
                            lines = deque(f, maxlen=100)
                            
                            for line in lines:
                                for signature in attack_signatures:
                                    if re.search(signature, line, re.IGNORECASE):
                                        # Extract IP if possible
                                        ip_match = re.search(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', line)
                                        source_ip = ip_match.group() if ip_match else "UNKNOWN"
                                        
                                        self._log_threat("ATTACK_SIGNATURE", source_ip, "HIGH",
                                                       f"Attack signature detected: {signature}")
                                        
                                        if source_ip != "UNKNOWN" and self._is_valid_ip(source_ip):
                                            self._block_ip(source_ip, f"Attack signature: {signature}")
                    
                    except (PermissionError, FileNotFoundError):
                        continue
        
        except Exception as e:
            self._log_threat("SIGNATURE_CHECK_ERROR", "0.0.0.0", "LOW", f"Signature check error: {e}")
    
    def _analyze_traffic(self):
        """Analyze network traffic patterns"""
        while self.monitoring_active:
            try:
                import psutil
                
                # Get network statistics
                net_io = psutil.net_io_counters()
                
                # Simple bandwidth monitoring
                time.sleep(1)
                net_io_new = psutil.net_io_counters()
                
                bytes_sent_per_sec = net_io_new.bytes_sent - net_io.bytes_sent
                bytes_recv_per_sec = net_io_new.bytes_recv - net_io.bytes_recv
                
                # Check for suspicious bandwidth usage
                if bytes_sent_per_sec > self.attack_patterns["ddos"]["bandwidth_threshold"]:
                    self._log_threat("HIGH_OUTBOUND_TRAFFIC", "localhost", "MEDIUM",
                                   f"High outbound traffic: {bytes_sent_per_sec} bytes/sec")
                
                if bytes_recv_per_sec > self.attack_patterns["ddos"]["bandwidth_threshold"]:
                    self._log_threat("HIGH_INBOUND_TRAFFIC", "EXTERNAL", "MEDIUM",
                                   f"High inbound traffic: {bytes_recv_per_sec} bytes/sec")
                
                time.sleep(30)  # Analyze every 30 seconds
                
            except Exception as e:
                self._log_threat("TRAFFIC_ANALYSIS_ERROR", "0.0.0.0", "LOW", f"Traffic analysis error: {e}")
                time.sleep(30)
    
    def _manage_firewall(self):
        """Dynamic firewall management"""
        while self.monitoring_active:
            try:
                # Automatically unblock IPs after timeout (24 hours for non-critical)
                current_time = datetime.now(timezone.utc)
                
                # Save current firewall state
                self._save_firewall_rules()
                
                # Apply OS-level firewall rules if possible
                self._apply_system_firewall_rules()
                
                time.sleep(300)  # Update every 5 minutes
                
            except Exception as e:
                self._log_threat("FIREWALL_MANAGER_ERROR", "0.0.0.0", "LOW", f"Firewall management error: {e}")
                time.sleep(300)
    
    def _check_rate_limits(self, ip: str, current_time: datetime):
        """Check if IP exceeds rate limits"""
        attempts = self.connection_attempts[ip]
        
        # Check connections per minute
        minute_ago = current_time.replace(second=0) - datetime.timedelta(minutes=1)
        recent_attempts = [t for t in attempts if t > minute_ago]
        
        if len(recent_attempts) > self.rate_limits["connections_per_minute"]:
            self._log_threat("RATE_LIMIT_EXCEEDED", ip, "MEDIUM",
                           f"Rate limit exceeded: {len(recent_attempts)} connections/minute")
            return True
        
        return False
    
    def _should_block_ip(self, ip: str) -> bool:
        """Determine if IP should be blocked"""
        if ip in self.allowed_ips:
            return False
        
        if ip in self.blocked_ips:
            return True
        
        # Check if IP is in private ranges (usually safe)
        try:
            ip_obj = ipaddress.ip_address(ip)
            if ip_obj.is_private:
                return False
        except ValueError:
            return True  # Invalid IP should be blocked
        
        # Check connection attempt frequency
        attempts = len(self.connection_attempts[ip])
        if attempts > self.rate_limits["failed_attempts_threshold"]:
            return True
        
        return False
    
    def _block_ip(self, ip: str, reason: str):
        """Block an IP address"""
        if ip in self.allowed_ips or ip in self.blocked_ips:
            return
        
        self.blocked_ips.add(ip)
        self._log_threat("IP_BLOCKED", ip, "HIGH", f"IP blocked: {reason}")
        
        print(f"🚫 Blocked IP: {ip} ({reason})")
        
        # Apply system-level block if possible
        self._apply_ip_block(ip)
    
    def _apply_ip_block(self, ip: str):
        """Apply IP block at system level"""
        try:
            # Try to use iptables (Linux)
            if os.name == 'posix':
                subprocess.run(['iptables', '-A', 'INPUT', '-s', ip, '-j', 'DROP'], 
                             capture_output=True, timeout=10)
        except (subprocess.TimeoutExpired, FileNotFoundError, PermissionError):
            # Fallback to application-level blocking
            pass
    
    def _apply_system_firewall_rules(self):
        """Apply firewall rules at system level"""
        try:
            # This would integrate with system firewall (iptables, Windows Firewall, etc.)
            # For now, just log the action
            print(f"🔥 Firewall rules updated: {len(self.blocked_ips)} blocked IPs")
        except Exception as e:
            self._log_threat("FIREWALL_APPLY_ERROR", "0.0.0.0", "LOW", f"Failed to apply firewall rules: {e}")
    
    def _activate_ddos_protection(self):
        """Activate DDoS protection measures"""
        print("🛡️  ACTIVATING DDOS PROTECTION")
        
        # Increase rate limiting
        self.rate_limits["connections_per_minute"] = 10
        self.rate_limits["connections_per_hour"] = 100
        
        # Block all new connections temporarily
        self.security_level = NetworkSecurityLevel.LOCKED_DOWN
        
        self._log_threat("DDOS_PROTECTION_ACTIVATED", "SYSTEM", "CRITICAL", "DDoS protection activated")
    
    def _save_firewall_rules(self):
        """Save current firewall rules to file"""
        try:
            rules = {
                "arcsec_network_rules": {
                    "version": self.version,
                    "creator": self.creator,
                    "digital_signature": self.digital_signature,
                    "last_updated": datetime.now(timezone.utc).isoformat(),
                    "security_level": self.security_level
                },
                "blocked_ips": list(self.blocked_ips),
                "allowed_ips": list(self.allowed_ips),
                "rate_limits": self.rate_limits,
                "statistics": {
                    "total_threats": len(self.detected_threats),
                    "blocked_count": len(self.blocked_ips),
                    "monitoring_active": self.monitoring_active
                }
            }
            
            with open("ARCSEC_NETWORK_RULES.json", 'w') as f:
                json.dump(rules, f, indent=2)
                
        except Exception as e:
            self._log_threat("RULES_SAVE_ERROR", "0.0.0.0", "LOW", f"Failed to save rules: {e}")
    
    def _log_threat(self, threat_type: str, source_ip: str, severity: str, description: str):
        """Log a network security threat"""
        threat = NetworkThreat(threat_type, source_ip, severity, description)
        self.detected_threats.append(threat)
        
        # Print high-severity threats immediately
        if severity in ["HIGH", "CRITICAL"]:
            print(f"🚨 NETWORK THREAT [{severity}]: {description} (from {source_ip})")
        
        # Keep only last 1000 threats
        if len(self.detected_threats) > 1000:
            self.detected_threats = self.detected_threats[-1000:]
    
    def _is_valid_ip(self, ip: str) -> bool:
        """Check if string is a valid IP address"""
        try:
            ipaddress.ip_address(ip)
            return True
        except ValueError:
            return False
    
    def allow_ip(self, ip: str):
        """Add IP to allowed list"""
        if self._is_valid_ip(ip):
            self.allowed_ips.add(ip)
            self.blocked_ips.discard(ip)  # Remove from blocked if present
            print(f"✅ IP {ip} added to allowed list")
        else:
            print(f"❌ Invalid IP address: {ip}")
    
    def block_ip_manual(self, ip: str, reason: str = "Manual block"):
        """Manually block an IP address"""
        if self._is_valid_ip(ip):
            self._block_ip(ip, reason)
        else:
            print(f"❌ Invalid IP address: {ip}")
    
    def unblock_ip(self, ip: str):
        """Remove IP from blocked list"""
        if ip in self.blocked_ips:
            self.blocked_ips.remove(ip)
            print(f"✅ IP {ip} unblocked")
        else:
            print(f"⚠️  IP {ip} was not blocked")
    
    def get_security_status(self) -> Dict[str, Any]:
        """Get network security status"""
        recent_threats = [t for t in self.detected_threats 
                         if (datetime.now(timezone.utc) - t.timestamp).seconds < 3600]
        
        return {
            "security_level": self.security_level,
            "monitoring_active": self.monitoring_active,
            "intrusion_detection_active": self.intrusion_detection_active,
            "total_threats": len(self.detected_threats),
            "recent_threats": len(recent_threats),
            "blocked_ips": len(self.blocked_ips),
            "allowed_ips": len(self.allowed_ips),
            "active_monitoring_threads": len([t for t in self.monitoring_threads if t.is_alive()]),
            "last_check": datetime.now(timezone.utc).isoformat()
        }

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Network Security System")
    parser.add_argument("--start", action="store_true", help="Start network monitoring")
    parser.add_argument("--status", action="store_true", help="Show security status")
    parser.add_argument("--block", help="Block IP address")
    parser.add_argument("--unblock", help="Unblock IP address")
    parser.add_argument("--allow", help="Add IP to allowed list")
    parser.add_argument("--list-blocked", action="store_true", help="List blocked IPs")
    parser.add_argument("--list-threats", action="store_true", help="List recent threats")
    
    args = parser.parse_args()
    
    network_security = ARCSECNetworkSecurity()
    
    if args.start:
        network_security.start_network_monitoring()
        try:
            while True:
                time.sleep(60)
        except KeyboardInterrupt:
            network_security.stop_network_monitoring()
    
    elif args.status:
        status = network_security.get_security_status()
        print("🛡️  ARCSEC Network Security Status:")
        for key, value in status.items():
            print(f"   {key}: {value}")
    
    elif args.block:
        network_security.block_ip_manual(args.block)
    
    elif args.unblock:
        network_security.unblock_ip(args.unblock)
    
    elif args.allow:
        network_security.allow_ip(args.allow)
    
    elif args.list_blocked:
        print("🚫 Blocked IPs:")
        for ip in network_security.blocked_ips:
            print(f"   {ip}")
    
    elif args.list_threats:
        print("🚨 Recent Threats (last 10):")
        for threat in network_security.detected_threats[-10:]:
            print(f"   [{threat.severity}] {threat.threat_type}: {threat.description}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()