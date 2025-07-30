#!/usr/bin/env python3
"""
ARCSEC Shell v3.0X
Interactive command shell for ARCSEC system management
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import sys
import cmd
import json
import subprocess
import shlex
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional
import readline
import atexit

class ARCSECShell(cmd.Cmd):
    """Interactive ARCSEC management shell"""
    
    intro = """
🔒 ARCSEC Shell v3.0X - Interactive Management Console
🛡️  Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
👨‍💻 Creator: Daniel Guzman
⚡ WAR MODE: ACTIVE - MAXIMUM PROTECTION ENABLED

Type 'help' or '?' to list commands.
Type 'help <command>' for command-specific help.
Type 'exit' or 'quit' to exit the shell.
"""
    
    prompt = "ARCSEC> "
    
    def __init__(self):
        super().__init__()
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        
        # Shell state
        self.current_directory = os.getcwd()
        self.command_history = []
        self.aliases = {
            "ls": "list",
            "ll": "list -l",
            "pwd": "cwd",
            "clear": "cls",
            "exit": "quit"
        }
        
        # Setup history file
        self.history_file = ".arcsec_history"
        self.load_history()
        atexit.register(self.save_history)
    
    def load_history(self):
        """Load command history"""
        try:
            if os.path.exists(self.history_file):
                readline.read_history_file(self.history_file)
        except Exception:
            pass
    
    def save_history(self):
        """Save command history"""
        try:
            readline.write_history_file(self.history_file)
        except Exception:
            pass
    
    def parseline(self, line):
        """Parse command line with alias support"""
        cmd, arg, line = super().parseline(line)
        
        if cmd in self.aliases:
            # Replace alias with actual command
            alias_cmd = self.aliases[cmd]
            if ' ' in alias_cmd:
                parts = alias_cmd.split(' ', 1)
                cmd = parts[0]
                arg = f"{parts[1]} {arg}".strip()
            else:
                cmd = alias_cmd
        
        return cmd, arg, line
    
    def precmd(self, line):
        """Pre-process command"""
        if line.strip():
            self.command_history.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "command": line.strip()
            })
        return line
    
    def do_status(self, arg):
        """Show ARCSEC system status"""
        try:
            print("🔍 ARCSEC System Status:")
            print(f"   Version: {self.version}")
            print(f"   Creator: {self.creator}")
            print(f"   Current Directory: {os.getcwd()}")
            print(f"   Protection Status: WAR MODE ACTIVE")
            print(f"   Digital Signature: {self.digital_signature}")
            
            # Check for ARCSEC files in current directory
            arcsec_files = [f for f in os.listdir('.') if 'arcsec' in f.lower()]
            print(f"   ARCSEC Files: {len(arcsec_files)}")
            
            # Check for manifest
            if os.path.exists("ARCSEC_FINGERPRINT_MANIFEST.json"):
                print("   ✅ Fingerprint manifest found")
            else:
                print("   ⚠️  No fingerprint manifest")
            
        except Exception as e:
            print(f"❌ Error getting status: {e}")
    
    def do_list(self, arg):
        """List files and directories with ARCSEC highlighting
        Usage: list [-l] [path]
        """
        try:
            args = shlex.split(arg) if arg else []
            long_format = '-l' in args
            path = next((a for a in args if not a.startswith('-')), '.')
            
            if not os.path.exists(path):
                print(f"❌ Path not found: {path}")
                return
            
            items = sorted(os.listdir(path))
            
            print(f"📁 Contents of {os.path.abspath(path)}:")
            
            for item in items:
                item_path = os.path.join(path, item)
                
                if os.path.isdir(item_path):
                    icon = "📁"
                    item_name = f"{item}/"
                elif 'arcsec' in item.lower():
                    icon = "🛡️ "
                    item_name = item
                elif item.endswith(('.json', '.yml', '.yaml')):
                    icon = "📄"
                    item_name = item
                elif item.endswith(('.py', '.ts', '.js')):
                    icon = "📝"
                    item_name = item
                else:
                    icon = "📄"
                    item_name = item
                
                if long_format and os.path.exists(item_path):
                    try:
                        stat = os.stat(item_path)
                        size = stat.st_size
                        modified = datetime.fromtimestamp(stat.st_mtime).strftime("%Y-%m-%d %H:%M")
                        print(f"   {icon} {item_name:<30} {size:>8} bytes  {modified}")
                    except Exception:
                        print(f"   {icon} {item_name}")
                else:
                    print(f"   {icon} {item_name}")
                    
        except Exception as e:
            print(f"❌ Error listing files: {e}")
    
    def do_cd(self, arg):
        """Change directory
        Usage: cd <path>
        """
        try:
            if not arg:
                arg = os.path.expanduser("~")
            
            new_path = os.path.abspath(arg)
            
            if os.path.exists(new_path) and os.path.isdir(new_path):
                os.chdir(new_path)
                self.current_directory = new_path
                print(f"📁 Changed to: {new_path}")
            else:
                print(f"❌ Directory not found: {arg}")
                
        except Exception as e:
            print(f"❌ Error changing directory: {e}")
    
    def do_cwd(self, arg):
        """Show current working directory"""
        print(f"📁 Current directory: {os.getcwd()}")
    
    def do_fingerprint(self, arg):
        """Generate ARCSEC fingerprints
        Usage: fingerprint [scan|verify]
        """
        try:
            action = arg.strip() or "scan"
            
            if action == "scan":
                print("🔍 Generating ARCSEC fingerprints...")
                result = subprocess.run([sys.executable, "arcsec_fingerprint.py"], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Fingerprinting completed successfully")
                    if result.stdout:
                        print(result.stdout)
                else:
                    print("❌ Fingerprinting failed")
                    if result.stderr:
                        print(result.stderr)
            
            elif action == "verify":
                print("🔐 Verifying ARCSEC fingerprints...")
                result = subprocess.run([sys.executable, "arcsec_injector.py", "--verify"], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Verification completed")
                    if result.stdout:
                        print(result.stdout)
                else:
                    print("❌ Verification failed")
                    if result.stderr:
                        print(result.stderr)
            
            else:
                print(f"❌ Unknown action: {action}")
                print("Available actions: scan, verify")
                
        except Exception as e:
            print(f"❌ Error running fingerprint: {e}")
    
    def do_manifest(self, arg):
        """Generate project manifest
        Usage: manifest [generate|view]
        """
        try:
            action = arg.strip() or "generate"
            
            if action == "generate":
                print("📋 Generating project manifest...")
                result = subprocess.run([sys.executable, "arcsec_manifest_generator.py"], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Manifest generated successfully")
                else:
                    print("❌ Manifest generation failed")
                    if result.stderr:
                        print(result.stderr)
            
            elif action == "view":
                manifest_file = "ARCSEC_PROJECT_MANIFEST.json"
                if os.path.exists(manifest_file):
                    with open(manifest_file, 'r') as f:
                        data = json.load(f)
                    
                    print("📋 Project Manifest Summary:")
                    metadata = data.get("arcsec_manifest_metadata", {})
                    print(f"   Generated: {metadata.get('generated')}")
                    print(f"   Creator: {metadata.get('creator')}")
                    
                    structure = data.get("project_structure", {})
                    print(f"   Total Files: {structure.get('total_files', 0)}")
                    print(f"   Total Directories: {structure.get('total_directories', 0)}")
                    
                    ecosystem = data.get("arcsec_ecosystem", {})
                    summary = ecosystem.get("summary", {})
                    print(f"   ARCSEC Files: {summary.get('total_arcsec_files', 0)}")
                else:
                    print("❌ No manifest file found. Run 'manifest generate' first.")
            
            else:
                print(f"❌ Unknown action: {action}")
                print("Available actions: generate, view")
                
        except Exception as e:
            print(f"❌ Error with manifest: {e}")
    
    def do_inject(self, arg):
        """ARCSEC auto-injection operations
        Usage: inject [monitor|process <file>|validate]
        """
        try:
            args = shlex.split(arg) if arg else []
            action = args[0] if args else "validate"
            
            if action == "monitor":
                print("👁️  Starting ARCSEC auto-injection monitoring...")
                print("Press Ctrl+C to stop monitoring")
                subprocess.run([sys.executable, "arcsec_auto_injection_hook.py", "--monitor"])
            
            elif action == "process" and len(args) > 1:
                file_path = args[1]
                print(f"🔄 Processing file: {file_path}")
                result = subprocess.run([sys.executable, "arcsec_auto_injection_hook.py", "--process", file_path], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ File processed successfully")
                    if result.stdout:
                        print(result.stdout)
                else:
                    print("❌ File processing failed")
                    if result.stderr:
                        print(result.stderr)
            
            elif action == "validate":
                print("🔍 Validating ARCSEC naming compliance...")
                result = subprocess.run([sys.executable, "arcsec_injector.py", "--validate"], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Validation passed")
                else:
                    print("❌ Validation failed")
                    
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            else:
                print("Available actions:")
                print("   monitor - Start file monitoring")
                print("   process <file> - Process specific file")
                print("   validate - Validate naming compliance")
                
        except KeyboardInterrupt:
            print("\n⏹️  Monitoring stopped")
        except Exception as e:
            print(f"❌ Error with injection: {e}")
    
    def do_sign(self, arg):
        """Sign files with ARCSEC signatures
        Usage: sign [scan|verify|file <path>]
        """
        try:
            args = shlex.split(arg) if arg else []
            action = args[0] if args else "scan"
            
            if action == "scan":
                print("📝 Scanning and signing ARCSEC files...")
                result = subprocess.run([sys.executable, "arcsec_signature_imprinter.py", "--scan"], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Signing completed")
                else:
                    print("❌ Signing failed")
                    
                if result.stdout:
                    print(result.stdout)
            
            elif action == "verify":
                print("🔍 Verifying ARCSEC signatures...")
                result = subprocess.run([sys.executable, "arcsec_signature_imprinter.py", "--verify"], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Verification completed")
                else:
                    print("❌ Verification failed")
                    
                if result.stdout:
                    print(result.stdout)
            
            elif action == "file" and len(args) > 1:
                file_path = args[1]
                print(f"📝 Signing file: {file_path}")
                result = subprocess.run([sys.executable, "arcsec_signature_imprinter.py", "--file", file_path], 
                                      capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ File signed successfully")
                else:
                    print("❌ File signing failed")
                    
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            else:
                print("Available actions:")
                print("   scan - Scan and sign all ARCSEC files")
                print("   verify - Verify existing signatures")
                print("   file <path> - Sign specific file")
                
        except Exception as e:
            print(f"❌ Error with signing: {e}")
    
    def do_convert(self, arg):
        """File format conversion
        Usage: convert <input> <output> <type>
        """
        try:
            args = shlex.split(arg)
            
            if len(args) < 3:
                print("Usage: convert <input> <output> <type>")
                print("Available types: json_to_yaml, yaml_to_json, csv_to_json, etc.")
                return
            
            input_file, output_file, conv_type = args[0], args[1], args[2]
            
            print(f"🔄 Converting {input_file} -> {output_file} ({conv_type})")
            result = subprocess.run([
                sys.executable, "arcsec_converter.py", 
                "--convert", input_file,
                "--output", output_file,
                "--type", conv_type
            ], capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✅ Conversion completed")
            else:
                print("❌ Conversion failed")
                
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print(result.stderr)
                
        except Exception as e:
            print(f"❌ Error with conversion: {e}")
    
    def do_token(self, arg):
        """Token management
        Usage: token [create|validate|list|revoke] [options]
        """
        try:
            args = shlex.split(arg) if arg else []
            action = args[0] if args else "list"
            
            if action == "create" and len(args) >= 4:
                token_type, subject, scopes = args[1], args[2], args[3]
                result = subprocess.run([
                    sys.executable, "arcsec_token_creator.py",
                    "--create", f"{token_type}:{subject}:{scopes}"
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Token created")
                else:
                    print("❌ Token creation failed")
                    
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            elif action == "list":
                result = subprocess.run([sys.executable, "arcsec_token_creator.py", "--list"], 
                                      capture_output=True, text=True)
                
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            elif action == "validate" and len(args) > 1:
                token = args[1]
                result = subprocess.run([sys.executable, "arcsec_token_creator.py", "--validate", token], 
                                      capture_output=True, text=True)
                
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            else:
                print("Available actions:")
                print("   create <type> <subject> <scopes> - Create new token")
                print("   validate <token> - Validate token")
                print("   list - List all tokens")
                print("   revoke <token_id> - Revoke token")
                
        except Exception as e:
            print(f"❌ Error with token: {e}")
    
    def do_pack(self, arg):
        """Package management
        Usage: pack [create|extract|validate] [options]
        """
        try:
            args = shlex.split(arg) if arg else []
            action = args[0] if args else "create"
            
            if action == "create":
                source = args[1] if len(args) > 1 else "."
                output = args[2] if len(args) > 2 else "arcsec_package.tar.gz"
                
                print(f"📦 Creating package: {source} -> {output}")
                result = subprocess.run([
                    sys.executable, "arcsec_packager.py",
                    "--create", source,
                    "--output", output
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Package created")
                else:
                    print("❌ Package creation failed")
                    
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            elif action == "extract" and len(args) > 1:
                package = args[1]
                output_dir = args[2] if len(args) > 2 else "extracted"
                
                print(f"📤 Extracting package: {package} -> {output_dir}")
                result = subprocess.run([
                    sys.executable, "arcsec_packager.py",
                    "--extract", package,
                    "--output", output_dir
                ], capture_output=True, text=True)
                
                if result.returncode == 0:
                    print("✅ Package extracted")
                else:
                    print("❌ Package extraction failed")
                    
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            elif action == "validate" and len(args) > 1:
                package = args[1]
                result = subprocess.run([sys.executable, "arcsec_packager.py", "--validate", package], 
                                      capture_output=True, text=True)
                
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(result.stderr)
            
            else:
                print("Available actions:")
                print("   create [source] [output] - Create package")
                print("   extract <package> [output_dir] - Extract package")
                print("   validate <package> - Validate package")
                
        except Exception as e:
            print(f"❌ Error with packaging: {e}")
    
    def do_history(self, arg):
        """Show command history"""
        print("📜 Command History:")
        for i, entry in enumerate(self.command_history[-20:], 1):  # Last 20 commands
            timestamp = entry["timestamp"][:19]  # Remove microseconds
            print(f"   {i:2d}. [{timestamp}] {entry['command']}")
    
    def do_alias(self, arg):
        """Manage command aliases
        Usage: alias [name=command] or alias [name] or alias
        """
        if not arg:
            # Show all aliases
            print("📋 Current Aliases:")
            for alias, command in self.aliases.items():
                print(f"   {alias} = {command}")
        elif '=' in arg:
            # Set alias
            name, command = arg.split('=', 1)
            name = name.strip()
            command = command.strip()
            self.aliases[name] = command
            print(f"✅ Alias set: {name} = {command}")
        else:
            # Show specific alias
            name = arg.strip()
            if name in self.aliases:
                print(f"{name} = {self.aliases[name]}")
            else:
                print(f"❌ Alias not found: {name}")
    
    def do_cls(self, arg):
        """Clear the screen"""
        os.system('clear' if os.name == 'posix' else 'cls')
    
    def do_exec(self, arg):
        """Execute system command
        Usage: exec <command>
        """
        if not arg:
            print("Usage: exec <command>")
            return
        
        try:
            print(f"⚡ Executing: {arg}")
            result = subprocess.run(arg, shell=True, capture_output=True, text=True)
            
            if result.stdout:
                print(result.stdout)
            if result.stderr:
                print(result.stderr)
                
            if result.returncode != 0:
                print(f"❌ Command failed with exit code {result.returncode}")
            else:
                print("✅ Command completed successfully")
                
        except Exception as e:
            print(f"❌ Error executing command: {e}")
    
    def do_version(self, arg):
        """Show ARCSEC version information"""
        print(f"🔒 ARCSEC System v{self.version}")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print(f"📅 Session started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🐍 Python: {sys.version.split()[0]}")
        print(f"💻 Platform: {sys.platform}")
    
    def do_quit(self, arg):
        """Exit the ARCSEC shell"""
        print("🔒 ARCSEC Shell session ended")
        print("🛡️  WAR MODE remains active")
        return True
    
    def do_exit(self, arg):
        """Exit the ARCSEC shell"""
        return self.do_quit(arg)
    
    def do_EOF(self, arg):
        """Handle Ctrl+D"""
        print("\n")
        return self.do_quit(arg)
    
    def emptyline(self):
        """Handle empty line input"""
        pass
    
    def default(self, line):
        """Handle unknown commands"""
        cmd = line.split()[0] if line.split() else ""
        print(f"❌ Unknown command: {cmd}")
        print("Type 'help' for available commands")

def main():
    """Main function to start the ARCSEC shell"""
    try:
        shell = ARCSECShell()
        shell.cmdloop()
    except KeyboardInterrupt:
        print("\n🔒 ARCSEC Shell session interrupted")
    except Exception as e:
        print(f"❌ Shell error: {e}")

if __name__ == "__main__":
    main()