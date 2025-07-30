#!/usr/bin/env python3
"""
ARCSEC Packager v3.0X
Advanced project packaging, compression, and distribution system
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import json
import tarfile
import zipfile
import gzip
import bz2
import lzma
import hashlib
import shutil
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import subprocess
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

class CompressionType:
    NONE = "none"
    GZIP = "gzip"
    BZIP2 = "bzip2"
    LZMA = "lzma"

class EncryptionType:
    NONE = "none"
    FERNET = "fernet"
    AES256 = "aes256"

class PackageFormat:
    TAR = "tar"
    TAR_GZ = "tar.gz"
    TAR_BZ2 = "tar.bz2"
    TAR_XZ = "tar.xz"
    ZIP = "zip"

class ARCSECPackager:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.last_updated = "2025-07-30T20:00:00Z"
        self.protection_level = "WAR_MODE_MAXIMUM"
        self.packaging_time = datetime.now(timezone.utc)
        
        # Default exclusions
        self.default_exclusions = [
            "node_modules/",
            ".git/",
            "__pycache__/",
            "*.pyc",
            ".DS_Store",
            "Thumbs.db",
            "*.log",
            "*.tmp",
            ".env",
            ".env.local",
            "dist/",
            "build/",
            ".cache/",
            "coverage/",
            ".arcsec_backups/"
        ]
        
        print(f"📦 ARCSEC Packager v{self.version} - INITIALIZING")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print("⚡ Project Packaging & Distribution: ACTIVE")
    
    def generate_encryption_key(self, password: str, salt: Optional[bytes] = None) -> bytes:
        """Generate encryption key from password"""
        if salt is None:
            salt = os.urandom(16)
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        return base64.urlsafe_b64encode(kdf.derive(password.encode()))
    
    def encrypt_data(self, data: bytes, password: str) -> Dict[str, Any]:
        """Encrypt data using Fernet encryption"""
        salt = os.urandom(16)
        key = self.generate_encryption_key(password, salt)
        
        fernet = Fernet(key)
        encrypted_data = fernet.encrypt(data)
        
        return {
            "encrypted_data": encrypted_data,
            "salt": salt,
            "encryption_type": EncryptionType.FERNET
        }
    
    def decrypt_data(self, encrypted_data: bytes, password: str, salt: bytes) -> bytes:
        """Decrypt data using Fernet encryption"""
        key = self.generate_encryption_key(password, salt)
        fernet = Fernet(key)
        return fernet.decrypt(encrypted_data)
    
    def calculate_checksums(self, filepath: str) -> Dict[str, str]:
        """Calculate multiple checksums for a file"""
        checksums = {}
        
        with open(filepath, 'rb') as f:
            content = f.read()
        
        checksums['md5'] = hashlib.md5(content).hexdigest()
        checksums['sha1'] = hashlib.sha1(content).hexdigest()
        checksums['sha256'] = hashlib.sha256(content).hexdigest()
        checksums['sha512'] = hashlib.sha512(content).hexdigest()
        
        return checksums
    
    def scan_project(self, root_path: str, exclusions: Optional[List[str]] = None) -> Dict[str, Any]:
        """Scan project directory and collect file information"""
        if exclusions is None:
            exclusions = self.default_exclusions
        
        project_info = {
            "root_path": os.path.abspath(root_path),
            "scanned": datetime.now(timezone.utc).isoformat(),
            "files": [],
            "directories": [],
            "statistics": {
                "total_files": 0,
                "total_size": 0,
                "arcsec_files": 0,
                "file_types": {}
            }
        }
        
        def should_exclude(path: str) -> bool:
            rel_path = os.path.relpath(path, root_path)
            for exclusion in exclusions:
                if exclusion.endswith("/") and rel_path.startswith(exclusion):
                    return True
                elif "*" in exclusion:
                    import fnmatch
                    if fnmatch.fnmatch(rel_path, exclusion):
                        return True
                elif rel_path == exclusion or os.path.basename(path) == exclusion:
                    return True
            return False
        
        for root, dirs, files in os.walk(root_path):
            # Filter directories
            dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d))]
            
            # Add directory info
            if root != root_path and not should_exclude(root):
                rel_dir = os.path.relpath(root, root_path)
                project_info["directories"].append({
                    "path": rel_dir,
                    "absolute_path": root,
                    "file_count": len(files)
                })
            
            # Process files
            for file in files:
                filepath = os.path.join(root, file)
                
                if should_exclude(filepath):
                    continue
                
                try:
                    stat = os.stat(filepath)
                    rel_path = os.path.relpath(filepath, root_path)
                    
                    file_info = {
                        "path": rel_path,
                        "absolute_path": filepath,
                        "size": stat.st_size,
                        "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                        "extension": Path(file).suffix.lower(),
                        "is_arcsec": "arcsec" in file.lower(),
                        "mime_type": self.get_mime_type(filepath)
                    }
                    
                    project_info["files"].append(file_info)
                    project_info["statistics"]["total_files"] += 1
                    project_info["statistics"]["total_size"] += stat.st_size
                    
                    if file_info["is_arcsec"]:
                        project_info["statistics"]["arcsec_files"] += 1
                    
                    # Track file types
                    ext = file_info["extension"]
                    if ext not in project_info["statistics"]["file_types"]:
                        project_info["statistics"]["file_types"][ext] = 0
                    project_info["statistics"]["file_types"][ext] += 1
                    
                except (OSError, IOError) as e:
                    print(f"⚠️  Warning: Could not access {filepath}: {e}")
        
        return project_info
    
    def get_mime_type(self, filepath: str) -> str:
        """Get MIME type for a file"""
        import mimetypes
        mime_type, _ = mimetypes.guess_type(filepath)
        return mime_type or "application/octet-stream"
    
    def create_package(self, root_path: str, output_path: str, 
                      package_format: str = PackageFormat.TAR_GZ,
                      compression: str = CompressionType.GZIP,
                      encryption_password: Optional[str] = None,
                      exclusions: Optional[List[str]] = None,
                      include_manifest: bool = True) -> Dict[str, Any]:
        """Create a package from project directory"""
        
        print(f"📦 Creating package: {output_path}")
        print(f"📁 Source: {root_path}")
        print(f"🗜️  Format: {package_format}")
        
        if exclusions is None:
            exclusions = self.default_exclusions
        
        # Scan project
        print("🔍 Scanning project structure...")
        project_info = self.scan_project(root_path, exclusions)
        
        # Create temporary directory for staging
        with tempfile.TemporaryDirectory() as temp_dir:
            staging_dir = os.path.join(temp_dir, "staging")
            os.makedirs(staging_dir)
            
            # Copy files to staging
            print("📋 Copying files to staging area...")
            self.copy_project_files(root_path, staging_dir, project_info["files"])
            
            # Generate package manifest
            if include_manifest:
                manifest = self.generate_package_manifest(project_info, package_format, compression)
                manifest_path = os.path.join(staging_dir, "ARCSEC_PACKAGE_MANIFEST.json")
                with open(manifest_path, 'w') as f:
                    json.dump(manifest, f, indent=2)
                print("📋 Generated package manifest")
            
            # Create archive
            print(f"🗜️  Creating {package_format} archive...")
            archive_path = self.create_archive(staging_dir, output_path, package_format)
            
            # Encrypt if requested
            if encryption_password:
                print("🔐 Encrypting package...")
                archive_path = self.encrypt_package(archive_path, encryption_password)
            
            # Calculate final checksums
            print("🔍 Calculating checksums...")
            checksums = self.calculate_checksums(archive_path)
            
            # Get final package info
            package_info = {
                "package_path": archive_path,
                "format": package_format,
                "compression": compression,
                "encrypted": encryption_password is not None,
                "size": os.path.getsize(archive_path),
                "checksums": checksums,
                "created": datetime.now(timezone.utc).isoformat(),
                "source_info": project_info,
                "arcsec_metadata": {
                    "creator": self.creator,
                    "version": self.version,
                    "digital_signature": self.digital_signature
                }
            }
            
            print(f"✅ Package created successfully!")
            print(f"📦 Package: {archive_path}")
            print(f"📏 Size: {self.format_size(package_info['size'])}")
            print(f"📊 Files: {project_info['statistics']['total_files']}")
            print(f"🛡️  ARCSEC Files: {project_info['statistics']['arcsec_files']}")
            
            return package_info
    
    def copy_project_files(self, source_root: str, dest_root: str, file_list: List[Dict[str, Any]]):
        """Copy project files to staging directory"""
        for file_info in file_list:
            source_path = file_info["absolute_path"]
            dest_path = os.path.join(dest_root, file_info["path"])
            
            # Create destination directory
            dest_dir = os.path.dirname(dest_path)
            os.makedirs(dest_dir, exist_ok=True)
            
            # Copy file
            shutil.copy2(source_path, dest_path)
    
    def create_archive(self, source_dir: str, output_path: str, package_format: str) -> str:
        """Create archive in specified format"""
        
        if package_format == PackageFormat.ZIP:
            return self.create_zip_archive(source_dir, output_path)
        elif package_format.startswith("tar"):
            return self.create_tar_archive(source_dir, output_path, package_format)
        else:
            raise ValueError(f"Unsupported package format: {package_format}")
    
    def create_zip_archive(self, source_dir: str, output_path: str) -> str:
        """Create ZIP archive"""
        if not output_path.endswith('.zip'):
            output_path += '.zip'
        
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zipf:
            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    arc_path = os.path.relpath(file_path, source_dir)
                    zipf.write(file_path, arc_path)
        
        return output_path
    
    def create_tar_archive(self, source_dir: str, output_path: str, package_format: str) -> str:
        """Create TAR archive with optional compression"""
        
        mode_map = {
            PackageFormat.TAR: "w",
            PackageFormat.TAR_GZ: "w:gz",
            PackageFormat.TAR_BZ2: "w:bz2",
            PackageFormat.TAR_XZ: "w:xz"
        }
        
        extension_map = {
            PackageFormat.TAR: ".tar",
            PackageFormat.TAR_GZ: ".tar.gz",
            PackageFormat.TAR_BZ2: ".tar.bz2",
            PackageFormat.TAR_XZ: ".tar.xz"
        }
        
        mode = mode_map.get(package_format, "w:gz")
        extension = extension_map.get(package_format, ".tar.gz")
        
        if not output_path.endswith(extension):
            output_path += extension
        
        with tarfile.open(output_path, mode) as tar:
            tar.add(source_dir, arcname=".", recursive=True)
        
        return output_path
    
    def encrypt_package(self, package_path: str, password: str) -> str:
        """Encrypt package file"""
        # Read package file
        with open(package_path, 'rb') as f:
            package_data = f.read()
        
        # Encrypt data
        encryption_result = self.encrypt_data(package_data, password)
        
        # Create encrypted package
        encrypted_path = package_path + ".encrypted"
        
        encryption_metadata = {
            "version": self.version,
            "creator": self.creator,
            "digital_signature": self.digital_signature,
            "encrypted": datetime.now(timezone.utc).isoformat(),
            "original_size": len(package_data),
            "encryption_type": encryption_result["encryption_type"],
            "salt": base64.b64encode(encryption_result["salt"]).decode('utf-8')
        }
        
        # Save encrypted package with metadata
        with open(encrypted_path, 'wb') as f:
            # Write metadata length and metadata
            metadata_json = json.dumps(encryption_metadata).encode('utf-8')
            f.write(len(metadata_json).to_bytes(4, 'big'))
            f.write(metadata_json)
            # Write encrypted data
            f.write(encryption_result["encrypted_data"])
        
        # Remove unencrypted package
        os.remove(package_path)
        
        return encrypted_path
    
    def decrypt_package(self, encrypted_package_path: str, password: str, output_path: str) -> Dict[str, Any]:
        """Decrypt package file"""
        print(f"🔓 Decrypting package: {encrypted_package_path}")
        
        try:
            with open(encrypted_package_path, 'rb') as f:
                # Read metadata
                metadata_length = int.from_bytes(f.read(4), 'big')
                metadata_json = f.read(metadata_length).decode('utf-8')
                metadata = json.loads(metadata_json)
                
                # Read encrypted data
                encrypted_data = f.read()
            
            # Verify ARCSEC signature
            if metadata.get("digital_signature") != self.digital_signature:
                raise ValueError("Invalid ARCSEC package - signature mismatch")
            
            # Decrypt data
            salt = base64.b64decode(metadata["salt"])
            decrypted_data = self.decrypt_data(encrypted_data, password, salt)
            
            # Write decrypted package
            with open(output_path, 'wb') as f:
                f.write(decrypted_data)
            
            print(f"✅ Package decrypted successfully!")
            print(f"📦 Decrypted: {output_path}")
            print(f"📏 Size: {self.format_size(len(decrypted_data))}")
            
            return {
                "success": True,
                "decrypted_path": output_path,
                "original_size": metadata["original_size"],
                "metadata": metadata
            }
            
        except Exception as e:
            print(f"❌ Decryption failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def extract_package(self, package_path: str, output_dir: str) -> Dict[str, Any]:
        """Extract package to directory"""
        print(f"📤 Extracting package: {package_path}")
        print(f"📁 Output directory: {output_dir}")
        
        os.makedirs(output_dir, exist_ok=True)
        
        try:
            # Determine package type
            if package_path.endswith('.zip'):
                return self.extract_zip_package(package_path, output_dir)
            elif '.tar' in package_path:
                return self.extract_tar_package(package_path, output_dir)
            else:
                raise ValueError(f"Unsupported package format: {package_path}")
                
        except Exception as e:
            print(f"❌ Extraction failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def extract_zip_package(self, package_path: str, output_dir: str) -> Dict[str, Any]:
        """Extract ZIP package"""
        with zipfile.ZipFile(package_path, 'r') as zipf:
            zipf.extractall(output_dir)
            file_count = len(zipf.namelist())
        
        print(f"✅ ZIP package extracted successfully!")
        print(f"📊 Files extracted: {file_count}")
        
        return {"success": True, "extracted_files": file_count}
    
    def extract_tar_package(self, package_path: str, output_dir: str) -> Dict[str, Any]:
        """Extract TAR package"""
        with tarfile.open(package_path, 'r:*') as tar:
            tar.extractall(output_dir)
            file_count = len(tar.getnames())
        
        print(f"✅ TAR package extracted successfully!")
        print(f"📊 Files extracted: {file_count}")
        
        return {"success": True, "extracted_files": file_count}
    
    def generate_package_manifest(self, project_info: Dict[str, Any], 
                                 package_format: str, compression: str) -> Dict[str, Any]:
        """Generate package manifest"""
        return {
            "arcsec_package_manifest": {
                "version": self.version,
                "creator": self.creator,
                "digital_signature": self.digital_signature,
                "created": datetime.now(timezone.utc).isoformat(),
                "package_format": package_format,
                "compression": compression
            },
            "project_info": project_info,
            "packaging_metadata": {
                "total_files": project_info["statistics"]["total_files"],
                "total_size": project_info["statistics"]["total_size"],
                "arcsec_files": project_info["statistics"]["arcsec_files"],
                "file_types": project_info["statistics"]["file_types"]
            }
        }
    
    def validate_package(self, package_path: str) -> Dict[str, Any]:
        """Validate package integrity"""
        print(f"🔍 Validating package: {package_path}")
        
        validation_result = {
            "valid": False,
            "checksums": {},
            "manifest_found": False,
            "arcsec_signature": False,
            "issues": []
        }
        
        try:
            # Calculate checksums
            validation_result["checksums"] = self.calculate_checksums(package_path)
            
            # Try to extract and check manifest
            with tempfile.TemporaryDirectory() as temp_dir:
                extract_result = self.extract_package(package_path, temp_dir)
                
                if extract_result["success"]:
                    manifest_path = os.path.join(temp_dir, "ARCSEC_PACKAGE_MANIFEST.json")
                    
                    if os.path.exists(manifest_path):
                        validation_result["manifest_found"] = True
                        
                        with open(manifest_path, 'r') as f:
                            manifest = json.load(f)
                        
                        # Check ARCSEC signature
                        if manifest.get("arcsec_package_manifest", {}).get("digital_signature") == self.digital_signature:
                            validation_result["arcsec_signature"] = True
                        else:
                            validation_result["issues"].append("Invalid ARCSEC digital signature")
                    else:
                        validation_result["issues"].append("Package manifest not found")
                else:
                    validation_result["issues"].append(f"Failed to extract package: {extract_result.get('error')}")
            
            # Overall validation
            validation_result["valid"] = (
                validation_result["manifest_found"] and 
                validation_result["arcsec_signature"] and 
                len(validation_result["issues"]) == 0
            )
            
            if validation_result["valid"]:
                print("✅ Package validation passed!")
            else:
                print("❌ Package validation failed!")
                for issue in validation_result["issues"]:
                    print(f"   - {issue}")
            
        except Exception as e:
            validation_result["issues"].append(f"Validation error: {str(e)}")
            print(f"❌ Validation error: {str(e)}")
        
        return validation_result
    
    def format_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} PB"

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Package Manager")
    parser.add_argument("--create", help="Create package from directory")
    parser.add_argument("--extract", help="Extract package to directory")
    parser.add_argument("--decrypt", help="Decrypt encrypted package")
    parser.add_argument("--validate", help="Validate package integrity")
    parser.add_argument("--output", help="Output path/directory")
    parser.add_argument("--format", choices=[PackageFormat.TAR, PackageFormat.TAR_GZ, PackageFormat.TAR_BZ2, PackageFormat.TAR_XZ, PackageFormat.ZIP], 
                       default=PackageFormat.TAR_GZ, help="Package format")
    parser.add_argument("--encrypt", action="store_true", help="Encrypt package")
    parser.add_argument("--password", help="Encryption password")
    parser.add_argument("--exclude", nargs="+", help="Additional exclusion patterns")
    
    args = parser.parse_args()
    
    packager = ARCSECPackager()
    
    if args.create:
        # Create package
        if not args.output:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            args.output = f"arcsec_package_{timestamp}"
        
        exclusions = packager.default_exclusions.copy()
        if args.exclude:
            exclusions.extend(args.exclude)
        
        encryption_password = None
        if args.encrypt:
            if args.password:
                encryption_password = args.password
            else:
                import getpass
                encryption_password = getpass.getpass("Enter encryption password: ")
        
        package_info = packager.create_package(
            root_path=args.create,
            output_path=args.output,
            package_format=args.format,
            encryption_password=encryption_password,
            exclusions=exclusions
        )
        
        # Save package info
        info_path = args.output + ".info.json"
        with open(info_path, 'w') as f:
            json.dump(package_info, f, indent=2)
        print(f"📋 Package info saved: {info_path}")
    
    elif args.extract:
        # Extract package
        if not args.output:
            args.output = "extracted"
        
        packager.extract_package(args.extract, args.output)
    
    elif args.decrypt:
        # Decrypt package
        if not args.output:
            args.output = args.decrypt.replace(".encrypted", "")
        
        if not args.password:
            import getpass
            args.password = getpass.getpass("Enter decryption password: ")
        
        packager.decrypt_package(args.decrypt, args.password, args.output)
    
    elif args.validate:
        # Validate package
        packager.validate_package(args.validate)
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()