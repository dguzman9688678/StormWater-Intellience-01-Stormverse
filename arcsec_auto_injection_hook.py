#!/usr/bin/env python3
"""
ARCSEC Auto Injection Hook v3.0X
Automatic file naming enforcement and real-time injection system
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import sys
import json
import time
import threading
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileCreatedEvent, FileModifiedEvent
import tempfile
import shutil

class ARCSECAutoInjectionHook:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.last_updated = "2025-07-30T20:00:00Z"
        self.protection_level = "WAR_MODE_MAXIMUM"
        self.active = False
        self.observer = None
        self.lock = threading.Lock()
        
        # Auto-injection rules
        self.injection_rules = {
            "services": {
                "directory": "server/services",
                "prefix": "arcsec-",
                "extensions": [".ts", ".js"],
                "template": "service_template"
            },
            "utilities": {
                "directory": ".",
                "prefix": "arcsec_",
                "extensions": [".py"],
                "template": "utility_template"
            },
            "configs": {
                "directory": ".",
                "prefix": "ARCSEC_",
                "extensions": [".json", ".yml", ".yaml"],
                "template": "config_template"
            }
        }
        
        print(f"🔄 ARCSEC Auto Injection Hook v{self.version} - INITIALIZING")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print("⚡ Automatic Naming Enforcement: READY")
    
    def should_auto_inject(self, filepath: str) -> Dict[str, Any]:
        """Determine if file should be auto-injected with ARCSEC naming"""
        path = Path(filepath)
        filename = path.name
        directory = str(path.parent)
        extension = path.suffix.lower()
        
        # Skip if already has arcsec naming
        if "arcsec" in filename.lower():
            return {"inject": False, "reason": "Already has ARCSEC naming"}
        
        # Skip hidden files and temporary files
        if filename.startswith('.') or filename.endswith('.tmp'):
            return {"inject": False, "reason": "Hidden or temporary file"}
        
        # Check injection rules
        for rule_name, rule in self.injection_rules.items():
            if (directory.endswith(rule["directory"]) or rule["directory"] == ".") and extension in rule["extensions"]:
                return {
                    "inject": True,
                    "rule": rule_name,
                    "new_prefix": rule["prefix"],
                    "template": rule["template"],
                    "reason": f"Matches {rule_name} injection rule"
                }
        
        # Check if it's in ARCSEC-related directories
        if any(part in directory.lower() for part in ["arcsec", "security", "service"]):
            return {
                "inject": True,
                "rule": "directory_based",
                "new_prefix": "arcsec-" if extension in [".ts", ".js"] else "arcsec_",
                "template": "generic_template",
                "reason": "In ARCSEC-related directory"
            }
        
        return {"inject": False, "reason": "No injection rule matches"}
    
    def generate_arcsec_filename(self, original_path: str, injection_info: Dict[str, Any]) -> str:
        """Generate new ARCSEC-compliant filename"""
        path = Path(original_path)
        original_name = path.stem
        extension = path.suffix
        directory = path.parent
        
        # Remove common prefixes that shouldn't be duplicated
        clean_name = original_name
        for prefix in ["service", "util", "helper", "manager", "controller"]:
            if clean_name.lower().startswith(prefix):
                clean_name = clean_name[len(prefix):].lstrip("-_")
        
        # Generate new filename
        new_prefix = injection_info["new_prefix"]
        new_filename = f"{new_prefix}{clean_name.lower().replace('_', '-').replace(' ', '-')}{extension}"
        
        return str(directory / new_filename)
    
    def inject_arcsec_header(self, filepath: str, injection_info: Dict[str, Any]) -> bool:
        """Inject ARCSEC header into file content"""
        try:
            # Read original content
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Skip if already has ARCSEC signature
            if self.digital_signature in content:
                return True
            
            # Generate header based on file type
            header = self.generate_file_header(filepath, injection_info)
            
            if header:
                # Insert header at the beginning
                new_content = f"{header}\n\n{content}"
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                return True
            
        except Exception as e:
            print(f"⚠️  Failed to inject header into {filepath}: {e}")
        
        return False
    
    def generate_file_header(self, filepath: str, injection_info: Dict[str, Any]) -> str:
        """Generate appropriate header for file type"""
        path = Path(filepath)
        filename = path.name
        extension = path.suffix.lower()
        
        description = self.generate_file_description(filename, injection_info)
        
        if extension in ['.ts', '.tsx', '.js', '.jsx']:
            return f'''/**
 * {filename}
 * {description}
 * © 2025 {self.creator} - All Rights Reserved
 * Digital Signature: {self.digital_signature}
 */'''
        
        elif extension == '.py':
            return f'''#!/usr/bin/env python3
"""
{filename}
{description}
© 2025 {self.creator} - All Rights Reserved
Digital Signature: {self.digital_signature}
"""'''
        
        elif extension in ['.json']:
            # For JSON, we'll add metadata object
            return None  # Handle separately in inject method
        
        elif extension in ['.yml', '.yaml']:
            return f'''# {filename}
# {description}
# © 2025 {self.creator} - All Rights Reserved
# Digital Signature: {self.digital_signature}'''
        
        elif extension == '.md':
            return f'''<!--
{filename}
{description}
© 2025 {self.creator} - All Rights Reserved
Digital Signature: {self.digital_signature}
-->'''
        
        return ""
    
    def generate_file_description(self, filename: str, injection_info: Dict[str, Any]) -> str:
        """Generate description based on filename and injection rule"""
        rule_descriptions = {
            "services": "ARCSEC service component for system integration",
            "utilities": "ARCSEC utility script for system management",
            "configs": "ARCSEC configuration file",
            "directory_based": "ARCSEC system component",
            "generic_template": "ARCSEC protected file"
        }
        
        base_desc = rule_descriptions.get(injection_info.get("rule"), "ARCSEC component")
        
        # Add specific description based on filename
        if "controller" in filename.lower():
            return f"{base_desc} - Control and coordination system"
        elif "service" in filename.lower():
            return f"{base_desc} - Service implementation"
        elif "processor" in filename.lower():
            return f"{base_desc} - Data processing system"
        elif "engine" in filename.lower():
            return f"{base_desc} - Processing engine"
        elif "handler" in filename.lower():
            return f"{base_desc} - Event handling system"
        elif "monitor" in filename.lower():
            return f"{base_desc} - Monitoring and diagnostics"
        elif "security" in filename.lower():
            return f"{base_desc} - Security and protection system"
        else:
            return base_desc
    
    def perform_auto_injection(self, original_path: str) -> Dict[str, Any]:
        """Perform automatic ARCSEC injection on a file"""
        result = {
            "success": False,
            "original_path": original_path,
            "new_path": None,
            "actions": [],
            "errors": []
        }
        
        try:
            # Check if injection is needed
            injection_info = self.should_auto_inject(original_path)
            
            if not injection_info["inject"]:
                result["errors"].append(injection_info["reason"])
                return result
            
            # Generate new filename
            new_path = self.generate_arcsec_filename(original_path, injection_info)
            
            # Create backup of original file
            backup_path = f"{original_path}.backup.{int(time.time())}"
            shutil.copy2(original_path, backup_path)
            result["actions"].append(f"Created backup: {backup_path}")
            
            # Rename file if needed
            if new_path != original_path and not os.path.exists(new_path):
                shutil.move(original_path, new_path)
                result["new_path"] = new_path
                result["actions"].append(f"Renamed: {original_path} -> {new_path}")
                current_path = new_path
            else:
                current_path = original_path
            
            # Inject ARCSEC header
            if self.inject_arcsec_header(current_path, injection_info):
                result["actions"].append("Injected ARCSEC header")
            
            # Log injection
            self.log_injection(original_path, current_path, injection_info, result["actions"])
            
            result["success"] = True
            
        except Exception as e:
            result["errors"].append(str(e))
        
        return result
    
    def log_injection(self, original_path: str, new_path: str, injection_info: Dict[str, Any], actions: List[str]):
        """Log auto-injection activity"""
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "original_path": original_path,
            "new_path": new_path,
            "injection_rule": injection_info["rule"],
            "actions": actions,
            "digital_signature": self.digital_signature
        }
        
        with open("ARCSEC_AUTO_INJECTION.log", "a") as f:
            f.write(json.dumps(log_entry) + "\n")

class ARCSECFileEventHandler(FileSystemEventHandler):
    """File system event handler for auto-injection"""
    
    def __init__(self, injection_hook: ARCSECAutoInjectionHook):
        self.injection_hook = injection_hook
        super().__init__()
    
    def on_created(self, event):
        if event.is_directory:
            return
        
        # Wait a moment for file to be fully written
        time.sleep(0.5)
        
        filepath = event.src_path
        print(f"📝 New file detected: {filepath}")
        
        # Perform auto-injection
        result = self.injection_hook.perform_auto_injection(filepath)
        
        if result["success"]:
            print(f"✅ Auto-injection successful:")
            for action in result["actions"]:
                print(f"   - {action}")
            if result["new_path"]:
                print(f"   - Final path: {result['new_path']}")
        else:
            print(f"⏭️  Auto-injection skipped: {', '.join(result['errors'])}")
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        filepath = event.src_path
        
        # Only process if file doesn't have ARCSEC naming
        if "arcsec" not in Path(filepath).name.lower():
            injection_info = self.injection_hook.should_auto_inject(filepath)
            
            if injection_info["inject"]:
                print(f"📝 Modified file without ARCSEC naming: {filepath}")
                
                # Check if header injection is needed
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if self.injection_hook.digital_signature not in content:
                        print(f"🔄 Injecting ARCSEC header into modified file...")
                        if self.injection_hook.inject_arcsec_header(filepath, injection_info):
                            print(f"   ✅ Header injected successfully")
                        else:
                            print(f"   ❌ Header injection failed")
                
                except Exception as e:
                    print(f"   ⚠️  Error checking file: {e}")

class ARCSECGitHook:
    """Git hook integration for auto-injection"""
    
    def __init__(self, injection_hook: ARCSECAutoInjectionHook):
        self.injection_hook = injection_hook
        self.git_hooks_dir = ".git/hooks"
    
    def install_git_hooks(self) -> bool:
        """Install git hooks for auto-injection"""
        if not os.path.exists(self.git_hooks_dir):
            print("⚠️  Git repository not found - skipping git hook installation")
            return False
        
        try:
            # Pre-commit hook
            pre_commit_hook = f"""#!/bin/sh
# ARCSEC Auto-Injection Pre-commit Hook
# © 2025 {self.injection_hook.creator} - All Rights Reserved

echo "🔄 ARCSEC Auto-Injection: Checking staged files..."

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=A)

for file in $STAGED_FILES; do
    if [ -f "$file" ]; then
        python3 arcsec_auto_injection_hook.py --process "$file"
        
        # Add processed file back to staging
        git add "$file"
    fi
done

echo "✅ ARCSEC Auto-Injection: Pre-commit processing complete"
"""
            
            pre_commit_path = os.path.join(self.git_hooks_dir, "pre-commit")
            with open(pre_commit_path, 'w') as f:
                f.write(pre_commit_hook)
            
            os.chmod(pre_commit_path, 0o755)
            
            print(f"✅ Git pre-commit hook installed: {pre_commit_path}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to install git hooks: {e}")
            return False

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Auto-Injection Hook")
    parser.add_argument("--monitor", action="store_true", help="Start file system monitoring")
    parser.add_argument("--process", help="Process specific file")
    parser.add_argument("--install-git-hooks", action="store_true", help="Install git hooks")
    parser.add_argument("--paths", nargs="+", default=[".", "server/services"], help="Paths to monitor")
    
    args = parser.parse_args()
    
    injection_hook = ARCSECAutoInjectionHook()
    
    if args.install_git_hooks:
        # Install git hooks
        git_hook = ARCSECGitHook(injection_hook)
        git_hook.install_git_hooks()
        return
    
    if args.process:
        # Process single file
        result = injection_hook.perform_auto_injection(args.process)
        
        if result["success"]:
            print(f"✅ Auto-injection completed:")
            for action in result["actions"]:
                print(f"   - {action}")
            if result["new_path"]:
                print(f"   - Final path: {result['new_path']}")
        else:
            print(f"❌ Auto-injection failed: {', '.join(result['errors'])}")
        
        return
    
    if args.monitor:
        # Start file system monitoring
        print("👁️  Starting ARCSEC Auto-Injection monitoring...")
        print(f"📁 Monitoring paths: {', '.join(args.paths)}")
        
        event_handler = ARCSECFileEventHandler(injection_hook)
        observer = Observer()
        
        for path in args.paths:
            if os.path.exists(path):
                observer.schedule(event_handler, path, recursive=True)
                print(f"   - {path}")
        
        injection_hook.observer = observer
        injection_hook.active = True
        
        observer.start()
        print("🔄 Auto-injection monitoring active!")
        print("📝 New files will be automatically processed")
        print("Press Ctrl+C to stop...")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping auto-injection monitoring...")
            observer.stop()
            injection_hook.active = False
        
        observer.join()
        print("✅ Auto-injection monitoring stopped")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()