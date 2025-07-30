#!/usr/bin/env python3
"""
ARCSEC Signature Imprinter v3.0X
Digital authorship metadata embedding and verification system
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import re
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple

class ARCSECSignatureImprinter:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.copyright_year = "2025"
        
        # Signature templates for different file types
        self.signature_templates = {
            'typescript': self.get_typescript_signature,
            'javascript': self.get_javascript_signature,
            'python': self.get_python_signature,
            'json': self.get_json_signature,
            'markdown': self.get_markdown_signature,
            'yaml': self.get_yaml_signature,
            'shell': self.get_shell_signature,
            'sql': self.get_sql_signature
        }
        
    def get_file_type(self, filepath: str) -> str:
        """Determine file type based on extension"""
        ext = Path(filepath).suffix.lower()
        
        type_map = {
            '.ts': 'typescript',
            '.tsx': 'typescript',
            '.js': 'javascript',
            '.jsx': 'javascript',
            '.py': 'python',
            '.json': 'json',
            '.md': 'markdown',
            '.yml': 'yaml',
            '.yaml': 'yaml',
            '.sh': 'shell',
            '.bash': 'shell',
            '.sql': 'sql'
        }
        
        return type_map.get(ext, 'unknown')
    
    def get_typescript_signature(self, filename: str, description: str = "") -> str:
        """Generate TypeScript/JavaScript signature header"""
        return f'''/**
 * {filename}
 * {description}
 * © {self.copyright_year} {self.creator} - All Rights Reserved
 * Digital Signature: {self.digital_signature}
 */'''
    
    def get_javascript_signature(self, filename: str, description: str = "") -> str:
        """Generate JavaScript signature header"""
        return self.get_typescript_signature(filename, description)
    
    def get_python_signature(self, filename: str, description: str = "") -> str:
        """Generate Python signature header"""
        return f'''#!/usr/bin/env python3
"""
{filename}
{description}
© {self.copyright_year} {self.creator} - All Rights Reserved
Digital Signature: {self.digital_signature}
"""'''
    
    def get_json_signature(self, filename: str, description: str = "") -> Dict[str, Any]:
        """Generate JSON signature metadata"""
        return {
            "_arcsec_metadata": {
                "filename": filename,
                "description": description,
                "creator": self.creator,
                "copyright": f"© {self.copyright_year} {self.creator} - All Rights Reserved",
                "digital_signature": self.digital_signature,
                "version": self.version,
                "created": datetime.now(timezone.utc).isoformat(),
                "protection_level": "ARCSEC_PROTECTED"
            }
        }
    
    def get_markdown_signature(self, filename: str, description: str = "") -> str:
        """Generate Markdown signature header"""
        return f'''<!--
{filename}
{description}
© {self.copyright_year} {self.creator} - All Rights Reserved
Digital Signature: {self.digital_signature}
-->'''
    
    def get_yaml_signature(self, filename: str, description: str = "") -> str:
        """Generate YAML signature header"""
        return f'''# {filename}
# {description}
# © {self.copyright_year} {self.creator} - All Rights Reserved
# Digital Signature: {self.digital_signature}'''
    
    def get_shell_signature(self, filename: str, description: str = "") -> str:
        """Generate Shell script signature header"""
        return f'''#!/bin/bash
# {filename}
# {description}
# © {self.copyright_year} {self.creator} - All Rights Reserved
# Digital Signature: {self.digital_signature}'''
    
    def get_sql_signature(self, filename: str, description: str = "") -> str:
        """Generate SQL signature header"""
        return f'''-- {filename}
-- {description}
-- © {self.copyright_year} {self.creator} - All Rights Reserved
-- Digital Signature: {self.digital_signature}'''
    
    def has_existing_signature(self, content: str, file_type: str) -> bool:
        """Check if file already has ARCSEC signature"""
        signature_patterns = {
            'typescript': r'/\*\*.*Digital Signature:.*\*/',
            'javascript': r'/\*\*.*Digital Signature:.*\*/',
            'python': r'""".*Digital Signature:.*"""',
            'json': r'"digital_signature"',
            'markdown': r'<!--.*Digital Signature:.*-->',
            'yaml': r'# Digital Signature:',
            'shell': r'# Digital Signature:',
            'sql': r'-- Digital Signature:'
        }
        
        pattern = signature_patterns.get(file_type)
        if pattern:
            return bool(re.search(pattern, content, re.DOTALL))
        
        return False
    
    def extract_file_description(self, filename: str, content: str) -> str:
        """Extract or generate appropriate file description"""
        # Try to extract existing description from comments
        descriptions = {
            'arcsec-universal-handler': 'Universal ARCSEC protection and coordination system',
            'arcsec-master-controller': 'ARCSEC master control and orchestration engine',
            'arcsec-security': 'Advanced security monitoring and threat detection',
            'arcsec-safety': 'Safety monitoring, compliance, and risk management system',
            'arcsec-store': 'Advanced data storage with partitions and caching',
            'arcsec-bus': 'Message routing and event system with channels',
            'arcsec-api-management': 'API gateway with rate limiting and monitoring',
            'arcsec-health-monitor': 'System health monitoring and diagnostics',
            'arcsec-search-engine': 'Advanced search and knowledge discovery system',
            'arcsec-memory-recall': 'Knowledge management and context preservation',
            'arcsec-dev': 'Development environment management and deployment automation',
            'arcsec_fingerprint': 'Cryptographic file verification and tamper detection system',
            'arcsec_injector': 'Runtime enforcement and tamper prevention system',
            'arcsec_manifest_generator': 'Advanced file mapping, hash generation, and metadata collection system'
        }
        
        # Check for known ARCSEC components
        for component, desc in descriptions.items():
            if component in filename.lower():
                return desc
        
        # Generate based on file type and name
        if 'service' in filename.lower():
            return 'ARCSEC service component'
        elif 'controller' in filename.lower():
            return 'ARCSEC control system component'
        elif 'processor' in filename.lower():
            return 'ARCSEC data processing component'
        elif 'engine' in filename.lower():
            return 'ARCSEC processing engine component'
        else:
            return 'ARCSEC system component'
    
    def imprint_signature(self, filepath: str, force: bool = False) -> Dict[str, Any]:
        """Imprint ARCSEC signature on a file"""
        try:
            if not os.path.exists(filepath):
                return {"success": False, "error": "File not found"}
            
            file_type = self.get_file_type(filepath)
            if file_type == 'unknown':
                return {"success": False, "error": f"Unsupported file type: {Path(filepath).suffix}"}
            
            # Read existing content
            with open(filepath, 'r', encoding='utf-8') as f:
                original_content = f.read()
            
            # Check if signature already exists
            if self.has_existing_signature(original_content, file_type) and not force:
                return {"success": False, "error": "Signature already exists (use force=True to overwrite)"}
            
            filename = Path(filepath).name
            description = self.extract_file_description(filename, original_content)
            
            # Generate signature
            if file_type == 'json':
                result = self.imprint_json_signature(filepath, original_content, description)
            else:
                result = self.imprint_text_signature(filepath, original_content, file_type, filename, description)
            
            return result
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def imprint_text_signature(self, filepath: str, content: str, file_type: str, filename: str, description: str) -> Dict[str, Any]:
        """Imprint signature on text-based files"""
        try:
            # Generate signature
            signature_generator = self.signature_templates.get(file_type)
            if not signature_generator:
                return {"success": False, "error": f"No signature template for {file_type}"}
            
            signature = signature_generator(filename, description)
            
            # Remove existing signature if present
            if self.has_existing_signature(content, file_type):
                content = self.remove_existing_signature(content, file_type)
            
            # Add new signature at the beginning
            if file_type in ['python', 'shell'] and content.startswith('#!'):
                # Preserve shebang line
                lines = content.split('\n')
                shebang = lines[0]
                rest_content = '\n'.join(lines[1:])
                new_content = f"{shebang}\n{signature}\n\n{rest_content.lstrip()}"
            else:
                new_content = f"{signature}\n\n{content.lstrip()}"
            
            # Write updated content
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            return {
                "success": True,
                "filepath": filepath,
                "file_type": file_type,
                "signature_added": True,
                "content_length": len(new_content)
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def imprint_json_signature(self, filepath: str, content: str, description: str) -> Dict[str, Any]:
        """Imprint signature on JSON files"""
        try:
            # Parse JSON
            data = json.loads(content)
            
            # Add signature metadata
            filename = Path(filepath).name
            signature_metadata = self.get_json_signature(filename, description)
            
            # If it's already a dict, add metadata at the top
            if isinstance(data, dict):
                # Create new dict with metadata first
                new_data = {}
                new_data.update(signature_metadata)
                new_data.update(data)
                data = new_data
            else:
                # Wrap in object with metadata
                data = {
                    **signature_metadata,
                    "data": data
                }
            
            # Write updated JSON
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            return {
                "success": True,
                "filepath": filepath,
                "file_type": "json",
                "signature_added": True,
                "metadata_added": True
            }
            
        except json.JSONDecodeError as e:
            return {"success": False, "error": f"Invalid JSON: {str(e)}"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def remove_existing_signature(self, content: str, file_type: str) -> str:
        """Remove existing ARCSEC signature from content"""
        patterns = {
            'typescript': r'/\*\*[\s\S]*?Digital Signature:[\s\S]*?\*/',
            'javascript': r'/\*\*[\s\S]*?Digital Signature:[\s\S]*?\*/',
            'python': r'"""[\s\S]*?Digital Signature:[\s\S]*?"""',
            'markdown': r'<!--[\s\S]*?Digital Signature:[\s\S]*?-->',
            'yaml': r'#[^\n]*Digital Signature:[^\n]*\n',
            'shell': r'#[^\n]*Digital Signature:[^\n]*\n',
            'sql': r'--[^\n]*Digital Signature:[^\n]*\n'
        }
        
        pattern = patterns.get(file_type)
        if pattern:
            content = re.sub(pattern, '', content, flags=re.MULTILINE)
        
        return content.strip()
    
    def scan_and_imprint(self, root_path: str = ".", pattern: str = "*arcsec*", force: bool = False) -> Dict[str, Any]:
        """Scan directory and imprint signatures on matching files"""
        results = {
            "processed": [],
            "skipped": [],
            "errors": [],
            "summary": {
                "total_files": 0,
                "signatures_added": 0,
                "already_signed": 0,
                "errors": 0
            }
        }
        
        print(f"🔐 ARCSEC Signature Imprinter v{self.version}")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print(f"📝 Scanning for files matching: {pattern}")
        print()
        
        # Find all matching files
        matching_files = []
        for root, dirs, files in os.walk(root_path):
            # Skip hidden and build directories
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'dist', '__pycache__']]
            
            for file in files:
                if "arcsec" in file.lower() and not file.startswith('.'):
                    filepath = os.path.join(root, file)
                    matching_files.append(filepath)
        
        results["summary"]["total_files"] = len(matching_files)
        
        # Process each file
        for i, filepath in enumerate(matching_files, 1):
            rel_path = os.path.relpath(filepath, root_path)
            print(f"📝 Processing [{i}/{len(matching_files)}]: {rel_path}")
            
            result = self.imprint_signature(filepath, force=force)
            
            if result["success"]:
                results["processed"].append({
                    "filepath": rel_path,
                    "file_type": result.get("file_type"),
                    "signature_added": result.get("signature_added", False)
                })
                results["summary"]["signatures_added"] += 1
                print(f"   ✅ Signature imprinted")
            else:
                if "already exists" in result["error"]:
                    results["skipped"].append({
                        "filepath": rel_path,
                        "reason": result["error"]
                    })
                    results["summary"]["already_signed"] += 1
                    print(f"   ⏭️  Skipped: {result['error']}")
                else:
                    results["errors"].append({
                        "filepath": rel_path,
                        "error": result["error"]
                    })
                    results["summary"]["errors"] += 1
                    print(f"   ❌ Error: {result['error']}")
        
        return results
    
    def verify_signatures(self, root_path: str = ".") -> Dict[str, Any]:
        """Verify ARCSEC signatures in all files"""
        verification_results = {
            "verified": [],
            "missing": [],
            "invalid": [],
            "summary": {
                "total_arcsec_files": 0,
                "properly_signed": 0,
                "missing_signatures": 0,
                "invalid_signatures": 0,
                "coverage_percentage": 0
            }
        }
        
        print(f"🔍 Verifying ARCSEC signatures...")
        
        # Find all ARCSEC files
        arcsec_files = []
        for root, dirs, files in os.walk(root_path):
            dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', 'dist', '__pycache__']]
            
            for file in files:
                if "arcsec" in file.lower() and not file.startswith('.'):
                    filepath = os.path.join(root, file)
                    arcsec_files.append(filepath)
        
        verification_results["summary"]["total_arcsec_files"] = len(arcsec_files)
        
        # Verify each file
        for filepath in arcsec_files:
            rel_path = os.path.relpath(filepath, root_path)
            file_type = self.get_file_type(filepath)
            
            if file_type == 'unknown':
                continue
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if self.has_existing_signature(content, file_type):
                    # Verify signature is correct
                    if self.digital_signature in content:
                        verification_results["verified"].append({
                            "filepath": rel_path,
                            "file_type": file_type,
                            "signature_valid": True
                        })
                        verification_results["summary"]["properly_signed"] += 1
                    else:
                        verification_results["invalid"].append({
                            "filepath": rel_path,
                            "file_type": file_type,
                            "reason": "Invalid or corrupted signature"
                        })
                        verification_results["summary"]["invalid_signatures"] += 1
                else:
                    verification_results["missing"].append({
                        "filepath": rel_path,
                        "file_type": file_type,
                        "reason": "No ARCSEC signature found"
                    })
                    verification_results["summary"]["missing_signatures"] += 1
                    
            except Exception as e:
                verification_results["invalid"].append({
                    "filepath": rel_path,
                    "file_type": file_type,
                    "reason": f"Read error: {str(e)}"
                })
                verification_results["summary"]["invalid_signatures"] += 1
        
        # Calculate coverage
        total = verification_results["summary"]["total_arcsec_files"]
        if total > 0:
            verification_results["summary"]["coverage_percentage"] = (
                verification_results["summary"]["properly_signed"] / total * 100
            )
        
        return verification_results
    
    def generate_signature_report(self, results: Dict[str, Any]) -> str:
        """Generate a detailed signature report"""
        report = []
        report.append("🔐 ARCSEC SIGNATURE IMPRINTING REPORT")
        report.append("=" * 50)
        report.append(f"Generated: {datetime.now(timezone.utc).isoformat()}")
        report.append(f"Creator: {self.creator}")
        report.append(f"Digital Signature: {self.digital_signature}")
        report.append("")
        
        summary = results["summary"]
        report.append("📊 SUMMARY")
        report.append(f"   Total Files Processed: {summary['total_files']}")
        report.append(f"   Signatures Added: {summary['signatures_added']}")
        report.append(f"   Already Signed: {summary['already_signed']}")
        report.append(f"   Errors: {summary['errors']}")
        report.append("")
        
        if results["processed"]:
            report.append("✅ SUCCESSFULLY PROCESSED")
            for item in results["processed"]:
                report.append(f"   {item['filepath']} ({item['file_type']})")
            report.append("")
        
        if results["skipped"]:
            report.append("⏭️  SKIPPED FILES")
            for item in results["skipped"]:
                report.append(f"   {item['filepath']}: {item['reason']}")
            report.append("")
        
        if results["errors"]:
            report.append("❌ ERRORS")
            for item in results["errors"]:
                report.append(f"   {item['filepath']}: {item['error']}")
            report.append("")
        
        return "\n".join(report)

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Signature Imprinter")
    parser.add_argument("--scan", action="store_true", help="Scan and imprint signatures")
    parser.add_argument("--verify", action="store_true", help="Verify existing signatures")
    parser.add_argument("--file", help="Imprint signature on specific file")
    parser.add_argument("--force", action="store_true", help="Overwrite existing signatures")
    parser.add_argument("--path", default=".", help="Root path to scan")
    
    args = parser.parse_args()
    
    imprinter = ARCSECSignatureImprinter()
    
    if args.file:
        # Imprint single file
        result = imprinter.imprint_signature(args.file, force=args.force)
        if result["success"]:
            print(f"✅ Signature imprinted on {args.file}")
        else:
            print(f"❌ Failed to imprint signature: {result['error']}")
    
    elif args.verify:
        # Verify signatures
        results = imprinter.verify_signatures(args.path)
        summary = results["summary"]
        
        print(f"🔍 Signature Verification Complete")
        print(f"📊 Total ARCSEC Files: {summary['total_arcsec_files']}")
        print(f"✅ Properly Signed: {summary['properly_signed']}")
        print(f"❌ Missing Signatures: {summary['missing_signatures']}")
        print(f"⚠️  Invalid Signatures: {summary['invalid_signatures']}")
        print(f"📈 Coverage: {summary['coverage_percentage']:.1f}%")
        
        # Save detailed report
        with open("ARCSEC_SIGNATURE_VERIFICATION.json", 'w') as f:
            json.dump(results, f, indent=2)
        print(f"📋 Detailed report saved: ARCSEC_SIGNATURE_VERIFICATION.json")
    
    elif args.scan:
        # Scan and imprint
        results = imprinter.scan_and_imprint(args.path, force=args.force)
        
        print(f"\n🔐 Signature Imprinting Complete")
        print(f"📊 Total Files: {results['summary']['total_files']}")
        print(f"✅ Signatures Added: {results['summary']['signatures_added']}")
        print(f"⏭️  Already Signed: {results['summary']['already_signed']}")
        print(f"❌ Errors: {results['summary']['errors']}")
        
        # Generate and save report
        report = imprinter.generate_signature_report(results)
        with open("ARCSEC_SIGNATURE_REPORT.txt", 'w') as f:
            f.write(report)
        print(f"📋 Report saved: ARCSEC_SIGNATURE_REPORT.txt")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()