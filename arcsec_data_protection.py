#!/usr/bin/env python3
"""
ARCSEC Data Protection v3.0X
Advanced data encryption, anonymization, and privacy protection system
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import sys
import json
import hashlib
import hmac
import secrets
import base64
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.backends import default_backend
import re

class DataClassification:
    PUBLIC = "PUBLIC"
    INTERNAL = "INTERNAL"
    CONFIDENTIAL = "CONFIDENTIAL"
    SECRET = "SECRET"
    TOP_SECRET = "TOP_SECRET"

class EncryptionLevel:
    BASIC = "AES-128"
    STANDARD = "AES-256"
    ADVANCED = "RSA-2048"
    MAXIMUM = "RSA-4096"

class ARCSECDataProtection:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.last_updated = "2025-07-30T20:00:00Z"
        self.protection_level = "WAR_MODE_MAXIMUM"
        
        # Encryption keys storage
        self.master_key = self._generate_master_key()
        self.data_keys: Dict[str, bytes] = {}
        self.rsa_keys = self._generate_rsa_keypair()
        
        # Data classification rules
        self.classification_rules = {
            "personal_data": DataClassification.CONFIDENTIAL,
            "financial_data": DataClassification.SECRET,
            "authentication": DataClassification.SECRET,
            "api_keys": DataClassification.TOP_SECRET,
            "system_config": DataClassification.CONFIDENTIAL,
            "logs": DataClassification.INTERNAL,
            "public_assets": DataClassification.PUBLIC
        }
        
        # Privacy patterns for detection
        self.privacy_patterns = {
            "email": r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            "phone": r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
            "ssn": r'\b\d{3}-?\d{2}-?\d{4}\b',
            "credit_card": r'\b(?:\d{4}[-\s]?){3}\d{4}\b',
            "ip_address": r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b',
            "api_key": r'\b[A-Za-z0-9]{32,}\b',
            "password": r'(?i)password\s*[:=]\s*["\']?([^"\'\s]+)["\']?'
        }
        
        print(f"🔒 ARCSEC Data Protection v{self.version} - INITIALIZING")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print("🔐 Data Protection: MAXIMUM ENCRYPTION ACTIVE")
    
    def _generate_master_key(self) -> bytes:
        """Generate master encryption key"""
        password = f"ARCSEC_{self.digital_signature}_{self.creator}".encode()
        salt = hashlib.sha256(f"{self.version}_{self.last_updated}".encode()).digest()[:16]
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        
        return base64.urlsafe_b64encode(kdf.derive(password))
    
    def _generate_rsa_keypair(self) -> Dict[str, Any]:
        """Generate RSA keypair for asymmetric encryption"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=4096,
            backend=default_backend()
        )
        
        public_key = private_key.public_key()
        
        return {
            "private_key": private_key,
            "public_key": public_key,
            "private_pem": private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.PKCS8,
                encryption_algorithm=serialization.NoEncryption()
            ),
            "public_pem": public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            )
        }
    
    def classify_data(self, data: Union[str, Dict, List], data_type: str = "unknown") -> str:
        """Classify data based on content and type"""
        classification = DataClassification.INTERNAL  # Default
        
        if data_type in self.classification_rules:
            classification = self.classification_rules[data_type]
        else:
            # Content-based classification
            data_str = str(data).lower()
            
            # Check for high-sensitivity patterns
            if any(pattern in data_str for pattern in ["password", "secret", "private_key", "api_key"]):
                classification = DataClassification.TOP_SECRET
            elif any(pattern in data_str for pattern in ["personal", "credit_card", "ssn", "financial"]):
                classification = DataClassification.SECRET
            elif any(pattern in data_str for pattern in ["confidential", "internal", "restricted"]):
                classification = DataClassification.CONFIDENTIAL
            elif any(pattern in data_str for pattern in ["public", "open", "general"]):
                classification = DataClassification.PUBLIC
        
        return classification
    
    def encrypt_data(self, data: Union[str, bytes, Dict, List], 
                    classification: str = None, encryption_level: str = None) -> Dict[str, Any]:
        """Encrypt data based on classification level"""
        # Determine classification if not provided
        if classification is None:
            classification = self.classify_data(data)
        
        # Determine encryption level based on classification
        if encryption_level is None:
            encryption_level = self._get_encryption_level(classification)
        
        # Serialize data if needed
        if isinstance(data, (dict, list)):
            data_bytes = json.dumps(data).encode()
        elif isinstance(data, str):
            data_bytes = data.encode()
        else:
            data_bytes = data
        
        # Encrypt based on level
        if encryption_level in [EncryptionLevel.BASIC, EncryptionLevel.STANDARD]:
            encrypted_data = self._encrypt_symmetric(data_bytes, encryption_level)
        else:
            encrypted_data = self._encrypt_asymmetric(data_bytes)
        
        return {
            "encrypted_data": encrypted_data,
            "classification": classification,
            "encryption_level": encryption_level,
            "encrypted_at": datetime.now(timezone.utc).isoformat(),
            "data_hash": hashlib.sha256(data_bytes).hexdigest(),
            "creator": self.creator,
            "digital_signature": self.digital_signature
        }
    
    def decrypt_data(self, encrypted_package: Dict[str, Any]) -> Union[str, bytes, Dict, List]:
        """Decrypt data package"""
        try:
            encryption_level = encrypted_package["encryption_level"]
            encrypted_data = encrypted_package["encrypted_data"]
            
            if encryption_level in [EncryptionLevel.BASIC, EncryptionLevel.STANDARD]:
                decrypted_bytes = self._decrypt_symmetric(encrypted_data)
            else:
                decrypted_bytes = self._decrypt_asymmetric(encrypted_data)
            
            # Verify integrity
            data_hash = hashlib.sha256(decrypted_bytes).hexdigest()
            if data_hash != encrypted_package.get("data_hash"):
                raise ValueError("Data integrity check failed")
            
            # Try to parse as JSON, fallback to string
            try:
                decrypted_str = decrypted_bytes.decode()
                return json.loads(decrypted_str)
            except (json.JSONDecodeError, UnicodeDecodeError):
                try:
                    return decrypted_bytes.decode()
                except UnicodeDecodeError:
                    return decrypted_bytes
        
        except Exception as e:
            raise ValueError(f"Decryption failed: {e}")
    
    def _get_encryption_level(self, classification: str) -> str:
        """Get encryption level based on data classification"""
        encryption_mapping = {
            DataClassification.PUBLIC: EncryptionLevel.BASIC,
            DataClassification.INTERNAL: EncryptionLevel.STANDARD,
            DataClassification.CONFIDENTIAL: EncryptionLevel.STANDARD,
            DataClassification.SECRET: EncryptionLevel.ADVANCED,
            DataClassification.TOP_SECRET: EncryptionLevel.MAXIMUM
        }
        
        return encryption_mapping.get(classification, EncryptionLevel.STANDARD)
    
    def _encrypt_symmetric(self, data: bytes, encryption_level: str) -> str:
        """Encrypt data using symmetric encryption"""
        fernet = Fernet(self.master_key)
        encrypted = fernet.encrypt(data)
        return base64.urlsafe_b64encode(encrypted).decode()
    
    def _decrypt_symmetric(self, encrypted_data: str) -> bytes:
        """Decrypt data using symmetric encryption"""
        fernet = Fernet(self.master_key)
        encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
        return fernet.decrypt(encrypted_bytes)
    
    def _encrypt_asymmetric(self, data: bytes) -> str:
        """Encrypt data using asymmetric encryption"""
        # For large data, use hybrid encryption (RSA + AES)
        if len(data) > 190:  # RSA 2048 max payload is ~245 bytes with padding
            # Generate random AES key
            aes_key = Fernet.generate_key()
            fernet = Fernet(aes_key)
            
            # Encrypt data with AES
            encrypted_data = fernet.encrypt(data)
            
            # Encrypt AES key with RSA
            encrypted_key = self.rsa_keys["public_key"].encrypt(
                aes_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Combine encrypted key and data
            combined = base64.urlsafe_b64encode(encrypted_key).decode() + ":" + base64.urlsafe_b64encode(encrypted_data).decode()
            return combined
        else:
            # Direct RSA encryption for small data
            encrypted = self.rsa_keys["public_key"].encrypt(
                data,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            return base64.urlsafe_b64encode(encrypted).decode()
    
    def _decrypt_asymmetric(self, encrypted_data: str) -> bytes:
        """Decrypt data using asymmetric encryption"""
        if ":" in encrypted_data:
            # Hybrid encryption
            encrypted_key_b64, encrypted_data_b64 = encrypted_data.split(":", 1)
            
            # Decrypt AES key
            encrypted_key = base64.urlsafe_b64decode(encrypted_key_b64.encode())
            aes_key = self.rsa_keys["private_key"].decrypt(
                encrypted_key,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
            
            # Decrypt data with AES
            fernet = Fernet(aes_key)
            encrypted_data_bytes = base64.urlsafe_b64decode(encrypted_data_b64.encode())
            return fernet.decrypt(encrypted_data_bytes)
        else:
            # Direct RSA decryption
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
            return self.rsa_keys["private_key"].decrypt(
                encrypted_bytes,
                padding.OAEP(
                    mgf=padding.MGF1(algorithm=hashes.SHA256()),
                    algorithm=hashes.SHA256(),
                    label=None
                )
            )
    
    def anonymize_data(self, data: Union[str, Dict], preserve_format: bool = True) -> Dict[str, Any]:
        """Anonymize sensitive data while preserving utility"""
        original_data = str(data) if not isinstance(data, str) else data
        anonymized_data = original_data
        anonymization_map = {}
        
        for data_type, pattern in self.privacy_patterns.items():
            matches = re.findall(pattern, anonymized_data, re.IGNORECASE)
            
            for match in matches:
                if preserve_format:
                    if data_type == "email":
                        anonymized = self._anonymize_email(match)
                    elif data_type == "phone":
                        anonymized = self._anonymize_phone(match)
                    elif data_type == "ssn":
                        anonymized = "XXX-XX-" + match[-4:]
                    elif data_type == "credit_card":
                        anonymized = "**** **** **** " + match[-4:]
                    elif data_type == "ip_address":
                        anonymized = self._anonymize_ip(match)
                    else:
                        anonymized = "*" * len(match)
                else:
                    anonymized = f"[REDACTED_{data_type.upper()}]"
                
                anonymization_map[match] = anonymized
                anonymized_data = anonymized_data.replace(match, anonymized)
        
        return {
            "anonymized_data": anonymized_data,
            "anonymization_map": anonymization_map,
            "original_hash": hashlib.sha256(original_data.encode()).hexdigest(),
            "anonymized_at": datetime.now(timezone.utc).isoformat(),
            "creator": self.creator,
            "digital_signature": self.digital_signature
        }
    
    def _anonymize_email(self, email: str) -> str:
        """Anonymize email while preserving format"""
        if "@" in email:
            local, domain = email.split("@", 1)
            anonymized_local = local[0] + "*" * (len(local) - 2) + local[-1] if len(local) > 2 else "*" * len(local)
            return f"{anonymized_local}@{domain}"
        return "*" * len(email)
    
    def _anonymize_phone(self, phone: str) -> str:
        """Anonymize phone number while preserving format"""
        digits_only = re.sub(r'\D', '', phone)
        if len(digits_only) >= 4:
            anonymized_digits = "*" * (len(digits_only) - 4) + digits_only[-4:]
            # Preserve original format
            result = phone
            for i, digit in enumerate(digits_only):
                if i < len(digits_only) - 4:
                    result = result.replace(digit, "*", 1)
            return result
        return "*" * len(phone)
    
    def _anonymize_ip(self, ip: str) -> str:
        """Anonymize IP address while preserving network information"""
        parts = ip.split(".")
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.XXX.XXX"
        return "*" * len(ip)
    
    def secure_delete(self, file_path: str, passes: int = 3) -> bool:
        """Securely delete file with multiple overwrite passes"""
        try:
            if not os.path.exists(file_path):
                return False
            
            file_size = os.path.getsize(file_path)
            
            with open(file_path, "r+b") as file:
                for pass_num in range(passes):
                    file.seek(0)
                    
                    if pass_num == 0:
                        # First pass: write zeros
                        file.write(b'\x00' * file_size)
                    elif pass_num == 1:
                        # Second pass: write ones
                        file.write(b'\xFF' * file_size)
                    else:
                        # Final pass: write random data
                        file.write(secrets.token_bytes(file_size))
                    
                    file.flush()
                    os.fsync(file.fileno())
            
            # Remove the file
            os.remove(file_path)
            
            print(f"🔥 Securely deleted: {file_path} ({passes} passes)")
            return True
            
        except Exception as e:
            print(f"⚠️  Secure deletion failed for {file_path}: {e}")
            return False
    
    def protect_file(self, file_path: str, output_path: str = None) -> Dict[str, Any]:
        """Encrypt and protect a file"""
        try:
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Read file content
            with open(file_path, 'rb') as f:
                file_content = f.read()
            
            # Classify based on file extension and content
            file_extension = Path(file_path).suffix.lower()
            data_type = self._classify_file_type(file_extension, file_content)
            
            # Encrypt the file content
            encrypted_package = self.encrypt_data(file_content, data_type)
            
            # Add file metadata
            encrypted_package.update({
                "original_filename": os.path.basename(file_path),
                "original_size": len(file_content),
                "file_type": file_extension,
                "protected_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Save encrypted file
            if output_path is None:
                output_path = file_path + ".arcsec"
            
            with open(output_path, 'w') as f:
                json.dump(encrypted_package, f, indent=2)
            
            print(f"🔒 File protected: {file_path} → {output_path}")
            return encrypted_package
            
        except Exception as e:
            print(f"⚠️  File protection failed: {e}")
            raise
    
    def unprotect_file(self, protected_file_path: str, output_path: str = None) -> str:
        """Decrypt and restore a protected file"""
        try:
            # Load encrypted package
            with open(protected_file_path, 'r') as f:
                encrypted_package = json.load(f)
            
            # Decrypt file content
            decrypted_content = self.decrypt_data(encrypted_package)
            
            # Determine output path
            if output_path is None:
                original_filename = encrypted_package.get("original_filename", "decrypted_file")
                output_path = os.path.join(os.path.dirname(protected_file_path), original_filename)
            
            # Write decrypted content
            if isinstance(decrypted_content, bytes):
                with open(output_path, 'wb') as f:
                    f.write(decrypted_content)
            else:
                with open(output_path, 'w') as f:
                    f.write(str(decrypted_content))
            
            print(f"🔓 File unprotected: {protected_file_path} → {output_path}")
            return output_path
            
        except Exception as e:
            print(f"⚠️  File unprotection failed: {e}")
            raise
    
    def _classify_file_type(self, extension: str, content: bytes) -> str:
        """Classify file type for encryption level determination"""
        sensitive_extensions = [".key", ".pem", ".p12", ".pfx", ".env"]
        config_extensions = [".json", ".yaml", ".yml", ".toml", ".ini"]
        
        if extension in sensitive_extensions:
            return "api_keys"
        elif extension in config_extensions:
            return "system_config"
        elif b"password" in content.lower() or b"secret" in content.lower():
            return "authentication"
        else:
            return "internal"
    
    def scan_for_sensitive_data(self, directory: str = ".") -> Dict[str, List[Dict[str, Any]]]:
        """Scan directory for sensitive data patterns"""
        findings = {
            "files_with_sensitive_data": [],
            "summary": {}
        }
        
        try:
            for root, dirs, files in os.walk(directory):
                # Skip hidden directories and common exclusions
                dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['node_modules', '__pycache__']]
                
                for file in files:
                    if file.startswith('.'):
                        continue
                    
                    file_path = os.path.join(root, file)
                    
                    try:
                        # Only scan text files
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        
                        file_findings = []
                        for data_type, pattern in self.privacy_patterns.items():
                            matches = re.findall(pattern, content, re.IGNORECASE)
                            if matches:
                                file_findings.append({
                                    "type": data_type,
                                    "matches": len(matches),
                                    "examples": matches[:3]  # First 3 examples
                                })
                        
                        if file_findings:
                            findings["files_with_sensitive_data"].append({
                                "file_path": file_path,
                                "findings": file_findings,
                                "classification": self.classify_data(content)
                            })
                    
                    except (UnicodeDecodeError, PermissionError, IsADirectoryError):
                        continue
            
            # Generate summary
            all_types = {}
            for file_data in findings["files_with_sensitive_data"]:
                for finding in file_data["findings"]:
                    data_type = finding["type"]
                    all_types[data_type] = all_types.get(data_type, 0) + finding["matches"]
            
            findings["summary"] = {
                "total_files_scanned": len(findings["files_with_sensitive_data"]),
                "sensitive_data_types": all_types,
                "scan_completed": datetime.now(timezone.utc).isoformat()
            }
            
            print(f"🔍 Sensitive data scan completed: {len(findings['files_with_sensitive_data'])} files with findings")
            
        except Exception as e:
            print(f"⚠️  Sensitive data scan error: {e}")
        
        return findings

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Data Protection System")
    parser.add_argument("--encrypt", help="Encrypt file")
    parser.add_argument("--decrypt", help="Decrypt file")
    parser.add_argument("--protect", help="Protect file with encryption")
    parser.add_argument("--unprotect", help="Unprotect encrypted file")
    parser.add_argument("--anonymize", help="Anonymize text data")
    parser.add_argument("--scan", help="Scan directory for sensitive data")
    parser.add_argument("--secure-delete", help="Securely delete file")
    parser.add_argument("--output", help="Output file path")
    
    args = parser.parse_args()
    
    data_protection = ARCSECDataProtection()
    
    if args.encrypt:
        with open(args.encrypt, 'r') as f:
            data = f.read()
        
        encrypted = data_protection.encrypt_data(data)
        output_file = args.output or (args.encrypt + ".encrypted")
        
        with open(output_file, 'w') as f:
            json.dump(encrypted, f, indent=2)
        
        print(f"✅ File encrypted: {output_file}")
    
    elif args.decrypt:
        with open(args.decrypt, 'r') as f:
            encrypted_package = json.load(f)
        
        decrypted = data_protection.decrypt_data(encrypted_package)
        output_file = args.output or (args.decrypt + ".decrypted")
        
        with open(output_file, 'w') as f:
            f.write(str(decrypted))
        
        print(f"✅ File decrypted: {output_file}")
    
    elif args.protect:
        data_protection.protect_file(args.protect, args.output)
    
    elif args.unprotect:
        data_protection.unprotect_file(args.unprotect, args.output)
    
    elif args.anonymize:
        anonymized = data_protection.anonymize_data(args.anonymize)
        print(f"Original: {args.anonymize}")
        print(f"Anonymized: {anonymized['anonymized_data']}")
    
    elif args.scan:
        findings = data_protection.scan_for_sensitive_data(args.scan)
        
        output_file = args.output or "ARCSEC_SENSITIVE_DATA_SCAN.json"
        with open(output_file, 'w') as f:
            json.dump(findings, f, indent=2)
        
        print(f"📊 Scan results saved: {output_file}")
    
    elif args.secure_delete:
        success = data_protection.secure_delete(args.secure_delete)
        if success:
            print(f"✅ File securely deleted: {args.secure_delete}")
        else:
            print(f"❌ Failed to securely delete: {args.secure_delete}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()