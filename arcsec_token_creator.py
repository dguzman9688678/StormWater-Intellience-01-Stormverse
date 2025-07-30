#!/usr/bin/env python3
"""
ARCSEC Token Creator v3.0X
Advanced token generation, management, and validation system
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import json
import jwt
import secrets
import hashlib
import hmac
import base64
import time
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional, Tuple
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import uuid

class TokenType:
    ACCESS = "access"
    REFRESH = "refresh"
    API_KEY = "api_key"
    SESSION = "session"
    WEBHOOK = "webhook"
    ARCSEC = "arcsec"
    TEMPORARY = "temporary"

class TokenScope:
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"
    SYSTEM = "system"
    SECURITY = "security"
    MONITORING = "monitoring"

class ARCSECTokenCreator:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        self.last_updated = "2025-07-30T20:00:00Z"
        self.protection_level = "WAR_MODE_MAXIMUM"
        
        # Token storage
        self.tokens: Dict[str, Dict[str, Any]] = {}
        self.revoked_tokens: set = set()
        
        # Cryptographic keys
        self.secret_key = self.generate_secret_key()
        self.private_key, self.public_key = self.generate_rsa_keys()
        
        # Default token configurations
        self.token_configs = {
            TokenType.ACCESS: {"expiry_minutes": 15, "algorithm": "HS256"},
            TokenType.REFRESH: {"expiry_minutes": 10080, "algorithm": "HS256"},  # 7 days
            TokenType.API_KEY: {"expiry_minutes": 525600, "algorithm": "RS256"},  # 1 year
            TokenType.SESSION: {"expiry_minutes": 480, "algorithm": "HS256"},  # 8 hours
            TokenType.WEBHOOK: {"expiry_minutes": 43200, "algorithm": "HS256"},  # 30 days
            TokenType.ARCSEC: {"expiry_minutes": 1440, "algorithm": "RS256"},  # 24 hours
            TokenType.TEMPORARY: {"expiry_minutes": 5, "algorithm": "HS256"}  # 5 minutes
        }
        
        print(f"🎫 ARCSEC Token Creator v{self.version} - INITIALIZING")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print("⚡ Token Generation & Management: ACTIVE")
    
    def generate_secret_key(self) -> str:
        """Generate cryptographically secure secret key"""
        return base64.urlsafe_b64encode(os.urandom(64)).decode('utf-8')
    
    def generate_rsa_keys(self) -> Tuple[bytes, bytes]:
        """Generate RSA key pair for asymmetric operations"""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        
        private_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        public_key = private_key.public_key()
        public_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        
        return private_pem, public_pem
    
    def create_token(self, token_type: str, subject: str, scopes: List[str],
                    metadata: Optional[Dict[str, Any]] = None,
                    custom_expiry: Optional[int] = None) -> Dict[str, Any]:
        """Create a new token with specified parameters"""
        
        if token_type not in self.token_configs:
            raise ValueError(f"Unsupported token type: {token_type}")
        
        if metadata is None:
            metadata = {}
        
        # Get token configuration
        config = self.token_configs[token_type]
        expiry_minutes = custom_expiry or config["expiry_minutes"]
        algorithm = config["algorithm"]
        
        # Generate token ID and creation time
        token_id = str(uuid.uuid4())
        issued_at = datetime.now(timezone.utc)
        expires_at = issued_at + timedelta(minutes=expiry_minutes)
        
        # Create JWT payload
        payload = {
            "jti": token_id,  # JWT ID
            "sub": subject,  # Subject
            "iss": f"ARCSEC_v{self.version}",  # Issuer
            "aud": "ARCSEC_ECOSYSTEM",  # Audience
            "iat": int(issued_at.timestamp()),  # Issued at
            "exp": int(expires_at.timestamp()),  # Expires at
            "nbf": int(issued_at.timestamp()),  # Not before
            "scopes": scopes,
            "token_type": token_type,
            "metadata": metadata,
            "arcsec": {
                "version": self.version,
                "creator": self.creator,
                "digital_signature": self.digital_signature,
                "protection_level": "MAXIMUM"
            }
        }
        
        # Select appropriate key based on algorithm
        if algorithm.startswith("HS"):
            key = self.secret_key
        elif algorithm.startswith("RS"):
            key = self.private_key
        else:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        # Generate JWT token
        token = jwt.encode(payload, key, algorithm=algorithm)
        
        # Store token metadata
        token_info = {
            "token_id": token_id,
            "token_type": token_type,
            "subject": subject,
            "scopes": scopes,
            "algorithm": algorithm,
            "issued_at": issued_at.isoformat(),
            "expires_at": expires_at.isoformat(),
            "metadata": metadata,
            "revoked": False,
            "access_count": 0,
            "last_accessed": None
        }
        
        self.tokens[token_id] = token_info
        
        print(f"🎫 Created {token_type} token for {subject}")
        print(f"   Token ID: {token_id}")
        print(f"   Scopes: {', '.join(scopes)}")
        print(f"   Expires: {expires_at.isoformat()}")
        
        return {
            "token": token,
            "token_id": token_id,
            "token_type": token_type,
            "subject": subject,
            "scopes": scopes,
            "issued_at": issued_at.isoformat(),
            "expires_at": expires_at.isoformat(),
            "algorithm": algorithm
        }
    
    def validate_token(self, token: str, required_scopes: Optional[List[str]] = None) -> Dict[str, Any]:
        """Validate and decode a token"""
        
        try:
            # Try to decode with different algorithms
            payload = None
            algorithm_used = None
            
            for algorithm in ["HS256", "RS256"]:
                try:
                    if algorithm.startswith("HS"):
                        key = self.secret_key
                    else:
                        key = self.public_key
                    
                    payload = jwt.decode(
                        token,
                        key,
                        algorithms=[algorithm],
                        audience="ARCSEC_ECOSYSTEM"
                    )
                    algorithm_used = algorithm
                    break
                    
                except jwt.InvalidTokenError:
                    continue
            
            if payload is None:
                return {
                    "valid": False,
                    "error": "Invalid token signature or format"
                }
            
            token_id = payload.get("jti")
            
            # Check if token exists in our records
            if token_id not in self.tokens:
                return {
                    "valid": False,
                    "error": "Token not found in registry"
                }
            
            token_info = self.tokens[token_id]
            
            # Check if token is revoked
            if token_info["revoked"] or token_id in self.revoked_tokens:
                return {
                    "valid": False,
                    "error": "Token has been revoked"
                }
            
            # Check expiration
            expires_at = datetime.fromisoformat(token_info["expires_at"])
            if datetime.now(timezone.utc) > expires_at:
                return {
                    "valid": False,
                    "error": "Token has expired"
                }
            
            # Check required scopes
            token_scopes = payload.get("scopes", [])
            if required_scopes:
                missing_scopes = set(required_scopes) - set(token_scopes)
                if missing_scopes:
                    return {
                        "valid": False,
                        "error": f"Missing required scopes: {', '.join(missing_scopes)}"
                    }
            
            # Update access tracking
            token_info["access_count"] += 1
            token_info["last_accessed"] = datetime.now(timezone.utc).isoformat()
            
            return {
                "valid": True,
                "payload": payload,
                "token_info": token_info,
                "algorithm": algorithm_used
            }
            
        except jwt.ExpiredSignatureError:
            return {
                "valid": False,
                "error": "Token has expired"
            }
        except jwt.InvalidTokenError as e:
            return {
                "valid": False,
                "error": f"Invalid token: {str(e)}"
            }
        except Exception as e:
            return {
                "valid": False,
                "error": f"Token validation error: {str(e)}"
            }
    
    def revoke_token(self, token_id: str, reason: str = "Manual revocation") -> Dict[str, Any]:
        """Revoke a token"""
        
        if token_id not in self.tokens:
            return {
                "success": False,
                "error": "Token not found"
            }
        
        token_info = self.tokens[token_id]
        
        if token_info["revoked"]:
            return {
                "success": False,
                "error": "Token already revoked"
            }
        
        # Mark as revoked
        token_info["revoked"] = True
        token_info["revoked_at"] = datetime.now(timezone.utc).isoformat()
        token_info["revocation_reason"] = reason
        
        # Add to revoked set for fast lookup
        self.revoked_tokens.add(token_id)
        
        print(f"🚫 Revoked token: {token_id}")
        print(f"   Reason: {reason}")
        
        return {
            "success": True,
            "token_id": token_id,
            "revoked_at": token_info["revoked_at"],
            "reason": reason
        }
    
    def refresh_token(self, refresh_token: str) -> Dict[str, Any]:
        """Create new access token using refresh token"""
        
        validation = self.validate_token(refresh_token)
        
        if not validation["valid"]:
            return {
                "success": False,
                "error": f"Invalid refresh token: {validation['error']}"
            }
        
        payload = validation["payload"]
        
        # Verify this is a refresh token
        if payload.get("token_type") != TokenType.REFRESH:
            return {
                "success": False,
                "error": "Token is not a refresh token"
            }
        
        # Create new access token
        new_token = self.create_token(
            token_type=TokenType.ACCESS,
            subject=payload["sub"],
            scopes=payload["scopes"],
            metadata=payload.get("metadata", {})
        )
        
        return {
            "success": True,
            "access_token": new_token["token"],
            "token_info": new_token
        }
    
    def create_api_key(self, name: str, scopes: List[str], 
                      expiry_days: Optional[int] = None) -> Dict[str, Any]:
        """Create a long-lived API key"""
        
        if expiry_days:
            custom_expiry = expiry_days * 24 * 60  # Convert to minutes
        else:
            custom_expiry = None
        
        # Generate API key format: arcsec_ak_[random]
        api_key_suffix = secrets.token_urlsafe(32)
        api_key = f"arcsec_ak_{api_key_suffix}"
        
        # Create token
        token_result = self.create_token(
            token_type=TokenType.API_KEY,
            subject=name,
            scopes=scopes,
            metadata={"api_key_name": name, "key_format": "api_key"},
            custom_expiry=custom_expiry
        )
        
        # Store API key mapping
        api_key_info = {
            "api_key": api_key,
            "token": token_result["token"],
            "token_id": token_result["token_id"],
            "name": name,
            "scopes": scopes,
            "created": datetime.now(timezone.utc).isoformat()
        }
        
        return api_key_info
    
    def validate_api_key(self, api_key: str, required_scopes: Optional[List[str]] = None) -> Dict[str, Any]:
        """Validate API key format and extract token"""
        
        if not api_key.startswith("arcsec_ak_"):
            return {
                "valid": False,
                "error": "Invalid API key format"
            }
        
        # Find corresponding token
        for token_info in self.tokens.values():
            metadata = token_info.get("metadata", {})
            if metadata.get("key_format") == "api_key":
                # This is an API key token, validate it
                # In a real implementation, you'd store the API key -> token mapping
                pass
        
        return {
            "valid": False,
            "error": "API key validation not fully implemented in this demo"
        }
    
    def create_webhook_token(self, webhook_url: str, events: List[str]) -> Dict[str, Any]:
        """Create webhook-specific token"""
        
        webhook_secret = secrets.token_urlsafe(32)
        
        token_result = self.create_token(
            token_type=TokenType.WEBHOOK,
            subject=webhook_url,
            scopes=[TokenScope.WRITE],
            metadata={
                "webhook_url": webhook_url,
                "events": events,
                "secret": webhook_secret
            }
        )
        
        return {
            "webhook_token": token_result["token"],
            "webhook_secret": webhook_secret,
            "webhook_url": webhook_url,
            "events": events,
            "token_id": token_result["token_id"]
        }
    
    def generate_arcsec_system_token(self, system_name: str, permissions: List[str]) -> Dict[str, Any]:
        """Generate system-level ARCSEC token"""
        
        system_token = self.create_token(
            token_type=TokenType.ARCSEC,
            subject=f"ARCSEC_SYSTEM_{system_name}",
            scopes=[TokenScope.SYSTEM, TokenScope.SECURITY] + permissions,
            metadata={
                "system_name": system_name,
                "protection_level": "MAXIMUM",
                "war_mode_authorized": True,
                "digital_signature": self.digital_signature
            }
        )
        
        return system_token
    
    def generate_temporary_access(self, resource: str, action: str, duration_minutes: int = 5) -> Dict[str, Any]:
        """Generate temporary access token"""
        
        temp_token = self.create_token(
            token_type=TokenType.TEMPORARY,
            subject=f"TEMP_ACCESS_{resource}",
            scopes=[action],
            metadata={
                "resource": resource,
                "action": action,
                "temporary": True
            },
            custom_expiry=duration_minutes
        )
        
        return temp_token
    
    def list_tokens(self, filter_by: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """List tokens with optional filtering"""
        
        tokens_list = []
        
        for token_id, token_info in self.tokens.items():
            # Apply filters
            if filter_by:
                skip = False
                for key, value in filter_by.items():
                    if key in token_info and token_info[key] != value:
                        skip = True
                        break
                if skip:
                    continue
            
            # Create safe copy without sensitive data
            safe_token_info = {
                "token_id": token_id,
                "token_type": token_info["token_type"],
                "subject": token_info["subject"],
                "scopes": token_info["scopes"],
                "issued_at": token_info["issued_at"],
                "expires_at": token_info["expires_at"],
                "revoked": token_info["revoked"],
                "access_count": token_info["access_count"],
                "last_accessed": token_info.get("last_accessed")
            }
            
            tokens_list.append(safe_token_info)
        
        return tokens_list
    
    def cleanup_expired_tokens(self) -> Dict[str, Any]:
        """Remove expired tokens from storage"""
        
        now = datetime.now(timezone.utc)
        expired_tokens = []
        
        for token_id, token_info in list(self.tokens.items()):
            expires_at = datetime.fromisoformat(token_info["expires_at"])
            
            if now > expires_at:
                expired_tokens.append(token_id)
                del self.tokens[token_id]
                self.revoked_tokens.discard(token_id)
        
        return {
            "cleaned_up": len(expired_tokens),
            "expired_token_ids": expired_tokens,
            "remaining_tokens": len(self.tokens)
        }
    
    def get_token_statistics(self) -> Dict[str, Any]:
        """Get token usage statistics"""
        
        stats = {
            "total_tokens": len(self.tokens),
            "by_type": {},
            "by_status": {"active": 0, "revoked": 0, "expired": 0},
            "total_accesses": 0,
            "most_accessed": None,
            "recent_activity": []
        }
        
        now = datetime.now(timezone.utc)
        most_accessed_count = 0
        
        for token_info in self.tokens.values():
            # Count by type
            token_type = token_info["token_type"]
            stats["by_type"][token_type] = stats["by_type"].get(token_type, 0) + 1
            
            # Count by status
            if token_info["revoked"]:
                stats["by_status"]["revoked"] += 1
            else:
                expires_at = datetime.fromisoformat(token_info["expires_at"])
                if now > expires_at:
                    stats["by_status"]["expired"] += 1
                else:
                    stats["by_status"]["active"] += 1
            
            # Track accesses
            access_count = token_info["access_count"]
            stats["total_accesses"] += access_count
            
            if access_count > most_accessed_count:
                most_accessed_count = access_count
                stats["most_accessed"] = {
                    "token_id": token_info.get("token_id"),
                    "subject": token_info["subject"],
                    "access_count": access_count
                }
            
            # Recent activity
            if token_info.get("last_accessed"):
                last_accessed = datetime.fromisoformat(token_info["last_accessed"])
                if (now - last_accessed).days < 7:  # Last 7 days
                    stats["recent_activity"].append({
                        "token_id": token_info.get("token_id"),
                        "subject": token_info["subject"],
                        "last_accessed": token_info["last_accessed"]
                    })
        
        return stats
    
    def export_tokens(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Export token configuration and metadata"""
        
        export_data = {
            "export_metadata": {
                "exported_at": datetime.now(timezone.utc).isoformat(),
                "creator": self.creator,
                "version": self.version,
                "digital_signature": self.digital_signature,
                "include_sensitive": include_sensitive
            },
            "token_statistics": self.get_token_statistics(),
            "token_configurations": self.token_configs,
            "tokens": []
        }
        
        for token_id, token_info in self.tokens.items():
            token_export = {
                "token_id": token_id,
                "token_type": token_info["token_type"],
                "subject": token_info["subject"],
                "scopes": token_info["scopes"],
                "issued_at": token_info["issued_at"],
                "expires_at": token_info["expires_at"],
                "revoked": token_info["revoked"],
                "metadata": token_info.get("metadata", {})
            }
            
            if include_sensitive:
                # Include additional sensitive information if requested
                token_export.update({
                    "access_count": token_info["access_count"],
                    "last_accessed": token_info.get("last_accessed"),
                    "algorithm": token_info["algorithm"]
                })
            
            export_data["tokens"].append(token_export)
        
        return export_data

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Token Creator")
    parser.add_argument("--create", help="Create token: type:subject:scopes")
    parser.add_argument("--validate", help="Validate token")
    parser.add_argument("--revoke", help="Revoke token by ID")
    parser.add_argument("--list", action="store_true", help="List all tokens")
    parser.add_argument("--cleanup", action="store_true", help="Clean up expired tokens")
    parser.add_argument("--stats", action="store_true", help="Show token statistics")
    parser.add_argument("--api-key", help="Create API key: name:scopes")
    parser.add_argument("--system-token", help="Create system token: name:permissions")
    
    args = parser.parse_args()
    
    token_creator = ARCSECTokenCreator()
    
    if args.create:
        # Create token
        try:
            parts = args.create.split(":")
            if len(parts) < 3:
                print("❌ Format: type:subject:scope1,scope2,...")
                return
            
            token_type, subject = parts[0], parts[1]
            scopes = parts[2].split(",") if len(parts) > 2 else []
            
            result = token_creator.create_token(token_type, subject, scopes)
            
            print(f"\n🎫 Token Created Successfully:")
            print(f"   Token: {result['token']}")
            print(f"   ID: {result['token_id']}")
            print(f"   Expires: {result['expires_at']}")
            
        except Exception as e:
            print(f"❌ Failed to create token: {e}")
    
    elif args.validate:
        # Validate token
        result = token_creator.validate_token(args.validate)
        
        if result["valid"]:
            payload = result["payload"]
            print(f"✅ Token Valid:")
            print(f"   Subject: {payload['sub']}")
            print(f"   Scopes: {', '.join(payload['scopes'])}")
            print(f"   Expires: {datetime.fromtimestamp(payload['exp']).isoformat()}")
        else:
            print(f"❌ Token Invalid: {result['error']}")
    
    elif args.revoke:
        # Revoke token
        result = token_creator.revoke_token(args.revoke)
        
        if result["success"]:
            print(f"🚫 Token revoked: {args.revoke}")
        else:
            print(f"❌ Failed to revoke token: {result['error']}")
    
    elif args.list:
        # List tokens
        tokens = token_creator.list_tokens()
        
        if tokens:
            print("📋 Active Tokens:")
            for token in tokens:
                status = "🚫 REVOKED" if token["revoked"] else "✅ ACTIVE"
                print(f"   {status} {token['token_type']} - {token['subject']}")
                print(f"     ID: {token['token_id']}")
                print(f"     Scopes: {', '.join(token['scopes'])}")
                print(f"     Expires: {token['expires_at']}")
                print()
        else:
            print("No tokens found")
    
    elif args.cleanup:
        # Cleanup expired tokens
        result = token_creator.cleanup_expired_tokens()
        print(f"🧹 Cleanup complete: {result['cleaned_up']} expired tokens removed")
        print(f"📊 Remaining tokens: {result['remaining_tokens']}")
    
    elif args.stats:
        # Show statistics
        stats = token_creator.get_token_statistics()
        
        print("📊 Token Statistics:")
        print(f"   Total Tokens: {stats['total_tokens']}")
        print(f"   Active: {stats['by_status']['active']}")
        print(f"   Revoked: {stats['by_status']['revoked']}")
        print(f"   Expired: {stats['by_status']['expired']}")
        print(f"   Total Accesses: {stats['total_accesses']}")
        
        if stats['most_accessed']:
            ma = stats['most_accessed']
            print(f"   Most Accessed: {ma['subject']} ({ma['access_count']} times)")
    
    elif args.api_key:
        # Create API key
        try:
            parts = args.api_key.split(":")
            if len(parts) < 2:
                print("❌ Format: name:scope1,scope2,...")
                return
            
            name = parts[0]
            scopes = parts[1].split(",")
            
            result = token_creator.create_api_key(name, scopes)
            
            print(f"🔑 API Key Created:")
            print(f"   Key: {result['api_key']}")
            print(f"   Name: {result['name']}")
            print(f"   Scopes: {', '.join(result['scopes'])}")
            
        except Exception as e:
            print(f"❌ Failed to create API key: {e}")
    
    elif args.system_token:
        # Create system token
        try:
            parts = args.system_token.split(":")
            if len(parts) < 2:
                print("❌ Format: name:permission1,permission2,...")
                return
            
            name = parts[0]
            permissions = parts[1].split(",")
            
            result = token_creator.generate_arcsec_system_token(name, permissions)
            
            print(f"🔒 System Token Created:")
            print(f"   Token: {result['token']}")
            print(f"   System: {name}")
            print(f"   Permissions: {', '.join(permissions)}")
            
        except Exception as e:
            print(f"❌ Failed to create system token: {e}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()