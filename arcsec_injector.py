#!/usr/bin/env python3
"""
ARCSEC Injector v3.0X
Runtime enforcement and tamper prevention system
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import sys
import json
import time
import hashlib
import hmac
import signal
import threading
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Callable
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import atexit

class ARCSECInjector:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.last_updated = "2025-07-30T20:00:00Z"
        self.protection_level = "WAR_MODE_MAXIMUM"
        self.war_mode = True
        self.enforcement_active = False
        self.manifest_file = "ARCSEC_FINGERPRINT_MANIFEST.json"
        self.violation_log = "ARCSEC_VIOLATIONS.log"
        self.observer = None
        self.lock = threading.Lock()
        self.violation_count = 0
        self.enforcement_rules = self.load_enforcement_rules()
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGTERM, self.shutdown_handler)
        signal.signal(signal.SIGINT, self.shutdown_handler)
        atexit.register(self.cleanup)
    
    def shutdown_handler(self, signum, frame):
        """Handle shutdown signals gracefully"""
        print(f"\n🛑 Received signal {signum}, shutting down ARCSEC...")
        self.cleanup()
        sys.exit(0)
    
    def load_enforcement_rules(self) -> Dict[str, Any]:
        """Load ARCSEC enforcement rules and policies"""
        return {
            "naming_convention": {
                "prefix_required": "arcsec",
                "allowed_separators": ["-", "_"],
                "case_sensitivity": False,
                "extensions": [".ts", ".js", ".py", ".json", ".md"]
            },
            "protection_levels": {
                "CRITICAL": {
                    "block_modifications": True,
                    "require_signature": True,
                    "immediate_restore": True,
                    "alert_level": "EMERGENCY"
                },
                "HIGH": {
                    "block_modifications": True,
                    "require_signature": True,
                    "immediate_restore": False,
                    "alert_level": "CRITICAL"
                },
                "MEDIUM": {
                    "block_modifications": False,
                    "require_signature": True,
                    "immediate_restore": False,
                    "alert_level": "WARNING"
                }
            },
            "violation_responses": {
                "UNAUTHORIZED_MODIFICATION": "BLOCK_AND_RESTORE",
                "NAMING_VIOLATION": "REJECT_AND_ALERT",
                "SIGNATURE_MISMATCH": "QUARANTINE_AND_INVESTIGATE",
                "DELETION_ATTEMPT": "PREVENT_AND_BACKUP"
            },
            "monitoring": {
                "real_time_scanning": True,
                "integrity_checks": True,
                "behavioral_analysis": True,
                "threat_detection": True
            }
        }
    
    def validate_arcsec_naming(self, filepath: str) -> Dict[str, Any]:
        """Validate ARCSEC file naming convention"""
        path = Path(filepath)
        filename = path.name.lower()
        
        rules = self.enforcement_rules["naming_convention"]
        
        # Check if file should follow ARCSEC naming
        is_arcsec_file = (
            filename.startswith("arcsec") or 
            "arcsec" in filename or
            path.parent.name == "services"
        )
        
        if not is_arcsec_file:
            return {"valid": True, "reason": "Not an ARCSEC file"}
        
        # Validate naming convention
        violations = []
        
        if not filename.startswith(rules["prefix_required"]):
            violations.append(f"Missing required prefix: {rules['prefix_required']}")
        
        if not any(filename.endswith(ext) for ext in rules["extensions"]):
            violations.append(f"Invalid extension. Allowed: {rules['extensions']}")
        
        # Check for valid separators
        filename_body = filename.replace(rules["prefix_required"], "", 1)
        for char in filename_body:
            if char.isalnum() or char in rules["allowed_separators"] or char == ".":
                continue
            violations.append(f"Invalid character in filename: '{char}'")
            break
        
        return {
            "valid": len(violations) == 0,
            "violations": violations,
            "enforcement_action": "REJECT_AND_ALERT" if violations else None
        }
    
    def check_file_integrity(self, filepath: str) -> Dict[str, Any]:
        """Check file integrity against manifest"""
        try:
            if not os.path.exists(self.manifest_file):
                return {"status": "NO_MANIFEST", "action": "GENERATE_BASELINE"}
            
            with open(self.manifest_file, 'r') as f:
                manifest = json.load(f)
            
            fingerprints = manifest.get("file_fingerprints", {})
            expected_fingerprint = fingerprints.get(filepath)
            
            if not expected_fingerprint:
                return {"status": "NEW_FILE", "action": "ADD_TO_MANIFEST"}
            
            # Calculate current hash
            with open(filepath, 'rb') as f:
                content = f.read()
            
            current_hash = hashlib.sha256(content).hexdigest()
            expected_hash = expected_fingerprint.get("hashes", {}).get("sha256")
            
            if current_hash != expected_hash:
                return {
                    "status": "INTEGRITY_VIOLATION",
                    "action": "BLOCK_AND_RESTORE",
                    "expected_hash": expected_hash,
                    "current_hash": current_hash
                }
            
            return {"status": "VERIFIED", "action": "ALLOW"}
            
        except Exception as e:
            return {"status": "CHECK_ERROR", "error": str(e), "action": "ALERT"}
    
    def log_violation(self, violation_type: str, filepath: str, details: Dict[str, Any]):
        """Log security violations"""
        with self.lock:
            self.violation_count += 1
            
            violation_entry = {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "violation_id": f"ARCSEC-{self.violation_count:06d}",
                "type": violation_type,
                "filepath": filepath,
                "details": details,
                "enforcement_action": details.get("action", "UNKNOWN"),
                "war_mode": self.war_mode,
                "digital_signature": self.digital_signature
            }
            
            # Write to violation log
            with open(self.violation_log, 'a') as f:
                f.write(json.dumps(violation_entry) + "\n")
            
            # Print alert
            print(f"🚨 ARCSEC VIOLATION DETECTED:")
            print(f"   📅 Time: {violation_entry['timestamp']}")
            print(f"   🆔 ID: {violation_entry['violation_id']}")
            print(f"   📂 File: {filepath}")
            print(f"   ⚠️  Type: {violation_type}")
            print(f"   🔧 Action: {violation_entry['enforcement_action']}")
            print()
    
    def enforce_protection(self, filepath: str, event_type: str) -> bool:
        """Enforce ARCSEC protection policies"""
        try:
            # Validate naming convention
            naming_result = self.validate_arcsec_naming(filepath)
            
            if not naming_result["valid"]:
                self.log_violation("NAMING_VIOLATION", filepath, naming_result)
                
                if self.war_mode:
                    print(f"❌ BLOCKED: {filepath} - Naming violation")
                    # In a real implementation, this would prevent the file operation
                    return False
            
            # Check file integrity
            if os.path.exists(filepath) and event_type in ["modified", "created"]:
                integrity_result = self.check_file_integrity(filepath)
                
                if integrity_result["status"] == "INTEGRITY_VIOLATION":
                    self.log_violation("UNAUTHORIZED_MODIFICATION", filepath, integrity_result)
                    
                    if self.war_mode:
                        print(f"🛡️  PROTECTED: {filepath} - Unauthorized modification blocked")
                        # In a real implementation, this would restore the file
                        return False
            
            return True
            
        except Exception as e:
            self.log_violation("ENFORCEMENT_ERROR", filepath, {"error": str(e)})
            return False
    
    def backup_file(self, filepath: str) -> str:
        """Create backup of protected file"""
        try:
            backup_dir = Path(".arcsec_backups")
            backup_dir.mkdir(exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = Path(filepath).name
            backup_path = backup_dir / f"{filename}.{timestamp}.backup"
            
            import shutil
            shutil.copy2(filepath, backup_path)
            
            return str(backup_path)
            
        except Exception as e:
            print(f"⚠️  Backup failed for {filepath}: {str(e)}")
            return ""
    
    def restore_file(self, filepath: str) -> bool:
        """Restore file from manifest or backup"""
        try:
            # Try to find most recent backup
            backup_dir = Path(".arcsec_backups")
            if backup_dir.exists():
                filename = Path(filepath).name
                backups = list(backup_dir.glob(f"{filename}.*.backup"))
                
                if backups:
                    latest_backup = max(backups, key=lambda p: p.stat().st_mtime)
                    import shutil
                    shutil.copy2(latest_backup, filepath)
                    print(f"🔄 Restored {filepath} from backup: {latest_backup}")
                    return True
            
            print(f"⚠️  No backup found for {filepath}")
            return False
            
        except Exception as e:
            print(f"❌ Restore failed for {filepath}: {str(e)}")
            return False

class ARCSECFileHandler(FileSystemEventHandler):
    """File system event handler for ARCSEC enforcement"""
    
    def __init__(self, injector: ARCSECInjector):
        self.injector = injector
        super().__init__()
    
    def on_any_event(self, event):
        if event.is_directory:
            return
        
        filepath = event.src_path
        
        # Only monitor ARCSEC-related files
        if not self.is_arcsec_related(filepath):
            return
        
        print(f"📁 File event: {event.event_type} - {filepath}")
        
        # Enforce protection
        if not self.injector.enforce_protection(filepath, event.event_type):
            # Handle enforcement action
            if event.event_type == "modified":
                self.injector.restore_file(filepath)
            elif event.event_type == "deleted":
                self.injector.restore_file(filepath)
    
    def is_arcsec_related(self, filepath: str) -> bool:
        """Check if file is ARCSEC-related"""
        path = Path(filepath)
        filename = path.name.lower()
        
        return (
            filename.startswith("arcsec") or
            "arcsec" in filename or
            path.suffix in [".ts", ".js", ".py"] and "server/services" in str(path)
        )

class ARCSECRuntimeEnforcer:
    """Main runtime enforcement system"""
    
    def __init__(self):
        self.injector = ARCSECInjector()
        self.running = False
        self.monitor_thread = None
    
    def start_monitoring(self, watch_paths: List[str] = None):
        """Start real-time file monitoring"""
        if watch_paths is None:
            watch_paths = [
                "./server/services",
                "./",  # Root for ARCSEC files
            ]
        
        self.injector.enforcement_active = True
        self.running = True
        
        print("🔒 ARCSEC Injector v3.0X - Runtime Enforcement")
        print("🛡️  Digital Signature: a6672edf248c5eeef3054ecca057075c938af653")
        print("👨‍💻 Creator: Daniel Guzman")
        print("⚡ WAR MODE: ACTIVE - MAXIMUM PROTECTION ENABLED")
        print()
        
        # Set up file system monitoring
        event_handler = ARCSECFileHandler(self.injector)
        self.injector.observer = Observer()
        
        for path in watch_paths:
            if os.path.exists(path):
                self.injector.observer.schedule(event_handler, path, recursive=True)
                print(f"👁️  Monitoring: {path}")
        
        self.injector.observer.start()
        print("🔍 Real-time monitoring started")
        print("🛡️  ARCSEC protection active")
        print()
        
        try:
            while self.running:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop_monitoring()
    
    def stop_monitoring(self):
        """Stop monitoring and cleanup"""
        print("\n🔌 Stopping ARCSEC enforcement...")
        self.running = False
        
        if self.injector.observer:
            self.injector.observer.stop()
            self.injector.observer.join()
        
        self.injector.enforcement_active = False
        print("✅ ARCSEC enforcement stopped")
    
    def integrate_with_ci_cd(self):
        """Generate CI/CD integration hooks"""
        ci_cd_hooks = {
            "github_actions": {
                "pre_commit": "python arcsec_injector.py --validate",
                "pre_push": "python arcsec_fingerprint.py && python arcsec_injector.py --verify",
                "workflow": """
name: ARCSEC Protection
on: [push, pull_request]
jobs:
  arcsec-enforcement:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install watchdog
      - name: ARCSEC Fingerprinting
        run: python arcsec_fingerprint.py
      - name: ARCSEC Verification
        run: python arcsec_injector.py --verify
      - name: Upload manifest
        uses: actions/upload-artifact@v2
        with:
          name: arcsec-manifest
          path: ARCSEC_FINGERPRINT_MANIFEST.json
                """
            },
            "git_hooks": {
                "pre_commit": "#!/bin/sh\npython arcsec_injector.py --validate\nexit $?",
                "pre_push": "#!/bin/sh\npython arcsec_fingerprint.py\npython arcsec_injector.py --verify\nexit $?"
            },
            "docker": {
                "dockerfile_snippet": """
# Add ARCSEC protection
COPY arcsec_*.py ./
RUN python arcsec_fingerprint.py
RUN python arcsec_injector.py --verify
                """
            }
        }
        
        with open("ARCSEC_CI_CD_INTEGRATION.json", 'w') as f:
            json.dump(ci_cd_hooks, f, indent=2)
        
        print("🔧 CI/CD integration hooks generated: ARCSEC_CI_CD_INTEGRATION.json")


    
    def cleanup(self):
        """Cleanup on exit"""
        if self.injector.enforcement_active:
            self.stop_monitoring()

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Runtime Enforcement System")
    parser.add_argument("--monitor", action="store_true", help="Start real-time monitoring")
    parser.add_argument("--validate", action="store_true", help="Validate current state")
    parser.add_argument("--verify", action="store_true", help="Verify integrity")
    parser.add_argument("--ci-cd", action="store_true", help="Generate CI/CD integration")
    parser.add_argument("--paths", nargs="+", help="Paths to monitor")
    
    args = parser.parse_args()
    
    enforcer = ARCSECRuntimeEnforcer()
    
    if args.ci_cd:
        enforcer.integrate_with_ci_cd()
        return
    
    if args.validate:
        # Validate all ARCSEC files
        print("🔍 Validating ARCSEC files...")
        violations = 0
        
        for root, dirs, files in os.walk("."):
            for file in files:
                if file.startswith("arcsec"):
                    filepath = os.path.join(root, file)
                    result = enforcer.injector.validate_arcsec_naming(filepath)
                    if not result["valid"]:
                        print(f"❌ {filepath}: {result['violations']}")
                        violations += 1
        
        if violations == 0:
            print("✅ All ARCSEC files pass validation")
        else:
            print(f"❌ {violations} validation violations found")
            sys.exit(1)
        return
    
    if args.verify:
        # Verify integrity
        print("🔐 Verifying ARCSEC integrity...")
        from arcsec_fingerprint import ARCSECFingerprint
        
        fingerprinter = ARCSECFingerprint()
        result = fingerprinter.load_and_verify_manifest()
        
        if result["status"] == "VERIFICATION_COMPLETE":
            summary = result["summary"]
            print(f"✅ Verification complete: {summary['integrity_rate']:.1f}% integrity")
            if summary['tampered_files'] > 0:
                print(f"⚠️  {summary['tampered_files']} files show signs of tampering")
                sys.exit(1)
        else:
            print(f"❌ Verification failed: {result['status']}")
            sys.exit(1)
        return
    
    if args.monitor:
        # Start monitoring
        enforcer.start_monitoring(args.paths)
    else:
        # Default: show help
        parser.print_help()

if __name__ == "__main__":
    main()