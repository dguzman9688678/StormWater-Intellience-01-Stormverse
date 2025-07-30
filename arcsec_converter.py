#!/usr/bin/env python3
"""
ARCSEC Converter v3.0X
Advanced file format conversion and transformation system
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

import os
import json
import yaml
import csv
import xml.etree.ElementTree as ET
import base64
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import subprocess
import tempfile

class ARCSECConverter:
    def __init__(self):
        self.digital_signature = "a6672edf248c5eeef3054ecca057075c938af653"
        self.creator = "Daniel Guzman"
        self.version = "3.0X"
        
        # Supported conversions
        self.conversions = {
            'json_to_yaml': self.json_to_yaml,
            'yaml_to_json': self.yaml_to_json,
            'csv_to_json': self.csv_to_json,
            'json_to_csv': self.json_to_csv,
            'xml_to_json': self.xml_to_json,
            'json_to_xml': self.json_to_xml,
            'legacy_to_arcsec': self.legacy_to_arcsec,
            'arcsec_to_standard': self.arcsec_to_standard,
            'base64_encode': self.base64_encode,
            'base64_decode': self.base64_decode,
            'binary_to_hex': self.binary_to_hex,
            'hex_to_binary': self.hex_to_binary
        }
        
        print(f"🔄 ARCSEC Converter v{self.version} - INITIALIZING")
        print(f"🛡️  Digital Signature: {self.digital_signature}")
        print(f"👨‍💻 Creator: {self.creator}")
        print("⚡ Format Conversion & Transformation: ACTIVE")
    
    def convert_file(self, input_path: str, output_path: str, conversion_type: str,
                    options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Convert file from one format to another"""
        if options is None:
            options = {}
        
        print(f"🔄 Converting: {input_path} -> {output_path}")
        print(f"📋 Conversion type: {conversion_type}")
        
        try:
            if conversion_type not in self.conversions:
                return {
                    "success": False,
                    "error": f"Unsupported conversion type: {conversion_type}"
                }
            
            # Read input file
            input_data = self.read_input_file(input_path, conversion_type)
            
            # Perform conversion
            converter_func = self.conversions[conversion_type]
            converted_data = converter_func(input_data, options)
            
            # Write output file
            self.write_output_file(output_path, converted_data, conversion_type)
            
            # Calculate checksums
            input_checksum = self.calculate_file_checksum(input_path)
            output_checksum = self.calculate_file_checksum(output_path)
            
            result = {
                "success": True,
                "input_path": input_path,
                "output_path": output_path,
                "conversion_type": conversion_type,
                "input_size": os.path.getsize(input_path),
                "output_size": os.path.getsize(output_path),
                "input_checksum": input_checksum,
                "output_checksum": output_checksum,
                "conversion_metadata": {
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "converter_version": self.version,
                    "digital_signature": self.digital_signature
                }
            }
            
            print(f"✅ Conversion completed successfully!")
            print(f"📏 Input size: {self.format_size(result['input_size'])}")
            print(f"📏 Output size: {self.format_size(result['output_size'])}")
            
            return result
            
        except Exception as e:
            error_result = {
                "success": False,
                "error": str(e),
                "input_path": input_path,
                "conversion_type": conversion_type
            }
            print(f"❌ Conversion failed: {str(e)}")
            return error_result
    
    def read_input_file(self, filepath: str, conversion_type: str) -> Any:
        """Read input file based on conversion type"""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Input file not found: {filepath}")
        
        if conversion_type.startswith('json_'):
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        elif conversion_type.startswith('yaml_'):
            with open(filepath, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        
        elif conversion_type.startswith('csv_'):
            with open(filepath, 'r', encoding='utf-8') as f:
                return list(csv.DictReader(f))
        
        elif conversion_type.startswith('xml_'):
            return ET.parse(filepath).getroot()
        
        elif conversion_type in ['base64_encode', 'binary_to_hex']:
            with open(filepath, 'rb') as f:
                return f.read()
        
        else:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
    
    def write_output_file(self, filepath: str, data: Any, conversion_type: str):
        """Write output file based on conversion type"""
        output_dir = os.path.dirname(filepath)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
        
        if conversion_type.endswith('_to_json') or conversion_type == 'legacy_to_arcsec':
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        
        elif conversion_type.endswith('_to_yaml'):
            with open(filepath, 'w', encoding='utf-8') as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
        
        elif conversion_type.endswith('_to_csv'):
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                if isinstance(data, list) and data:
                    writer = csv.DictWriter(f, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)
        
        elif conversion_type.endswith('_to_xml'):
            tree = ET.ElementTree(data)
            tree.write(filepath, encoding='utf-8', xml_declaration=True)
        
        elif conversion_type in ['base64_decode', 'hex_to_binary']:
            with open(filepath, 'wb') as f:
                f.write(data)
        
        else:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(str(data))
    
    # Conversion functions
    def json_to_yaml(self, data: Dict[str, Any], options: Dict[str, Any]) -> str:
        """Convert JSON to YAML"""
        return yaml.dump(data, default_flow_style=False, allow_unicode=True)
    
    def yaml_to_json(self, data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
        """Convert YAML to JSON"""
        return data
    
    def csv_to_json(self, data: List[Dict[str, Any]], options: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert CSV to JSON"""
        return data
    
    def json_to_csv(self, data: Union[List[Dict], Dict], options: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Convert JSON to CSV format"""
        if isinstance(data, dict):
            # If single object, wrap in list
            return [data]
        elif isinstance(data, list):
            return data
        else:
            raise ValueError("JSON data must be a dictionary or list of dictionaries for CSV conversion")
    
    def xml_to_json(self, root: ET.Element, options: Dict[str, Any]) -> Dict[str, Any]:
        """Convert XML to JSON"""
        def xml_element_to_dict(element):
            result = {}
            
            # Add attributes
            if element.attrib:
                result['@attributes'] = element.attrib
            
            # Add text content
            if element.text and element.text.strip():
                if len(element) == 0:  # No children, just text
                    return element.text
                else:
                    result['#text'] = element.text.strip()
            
            # Add children
            for child in element:
                child_data = xml_element_to_dict(child)
                
                if child.tag in result:
                    # Multiple children with same tag - convert to list
                    if not isinstance(result[child.tag], list):
                        result[child.tag] = [result[child.tag]]
                    result[child.tag].append(child_data)
                else:
                    result[child.tag] = child_data
            
            return result
        
        return {root.tag: xml_element_to_dict(root)}
    
    def json_to_xml(self, data: Dict[str, Any], options: Dict[str, Any]) -> ET.Element:
        """Convert JSON to XML"""
        def dict_to_xml_element(tag, value):
            element = ET.Element(tag)
            
            if isinstance(value, dict):
                # Handle attributes
                if '@attributes' in value:
                    element.attrib.update(value['@attributes'])
                
                # Handle text content
                if '#text' in value:
                    element.text = str(value['#text'])
                
                # Handle child elements
                for key, val in value.items():
                    if key not in ['@attributes', '#text']:
                        if isinstance(val, list):
                            for item in val:
                                child = dict_to_xml_element(key, item)
                                element.append(child)
                        else:
                            child = dict_to_xml_element(key, val)
                            element.append(child)
            
            elif isinstance(value, list):
                # Multiple values for same tag
                for item in value:
                    child = dict_to_xml_element('item', item)
                    element.append(child)
            
            else:
                # Simple value
                element.text = str(value)
            
            return element
        
        # Get root element
        if len(data) == 1:
            root_tag, root_value = next(iter(data.items()))
            return dict_to_xml_element(root_tag, root_value)
        else:
            # Multiple root elements - wrap in container
            root = ET.Element('root')
            for key, value in data.items():
                child = dict_to_xml_element(key, value)
                root.append(child)
            return root
    
    def legacy_to_arcsec(self, data: Any, options: Dict[str, Any]) -> Dict[str, Any]:
        """Convert legacy format to ARCSEC-compliant format"""
        if isinstance(data, str):
            try:
                data = json.loads(data)
            except json.JSONDecodeError:
                # Treat as plain text
                data = {"content": data}
        
        # Add ARCSEC metadata
        arcsec_data = {
            "_arcsec_metadata": {
                "version": self.version,
                "creator": self.creator,
                "copyright": f"© 2025 {self.creator} - All Rights Reserved",
                "digital_signature": self.digital_signature,
                "converted": datetime.now(timezone.utc).isoformat(),
                "protection_level": "ARCSEC_PROTECTED",
                "conversion_source": "legacy_format"
            }
        }
        
        if isinstance(data, dict):
            arcsec_data.update(data)
        else:
            arcsec_data["data"] = data
        
        return arcsec_data
    
    def arcsec_to_standard(self, data: Dict[str, Any], options: Dict[str, Any]) -> Any:
        """Convert ARCSEC format to standard format"""
        if isinstance(data, dict) and "_arcsec_metadata" in data:
            # Remove ARCSEC metadata
            standard_data = {k: v for k, v in data.items() if k != "_arcsec_metadata"}
            
            # If only "data" key remains, return its value
            if len(standard_data) == 1 and "data" in standard_data:
                return standard_data["data"]
            
            return standard_data
        
        return data
    
    def base64_encode(self, data: bytes, options: Dict[str, Any]) -> str:
        """Encode binary data to base64"""
        return base64.b64encode(data).decode('utf-8')
    
    def base64_decode(self, data: str, options: Dict[str, Any]) -> bytes:
        """Decode base64 to binary data"""
        return base64.b64decode(data.strip())
    
    def binary_to_hex(self, data: bytes, options: Dict[str, Any]) -> str:
        """Convert binary data to hexadecimal"""
        return data.hex()
    
    def hex_to_binary(self, data: str, options: Dict[str, Any]) -> bytes:
        """Convert hexadecimal to binary data"""
        return bytes.fromhex(data.strip())
    
    def batch_convert(self, input_pattern: str, output_pattern: str, 
                     conversion_type: str, options: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Batch convert multiple files"""
        import glob
        
        if options is None:
            options = {}
        
        input_files = glob.glob(input_pattern)
        results = {
            "total_files": len(input_files),
            "successful": 0,
            "failed": 0,
            "conversions": [],
            "errors": []
        }
        
        print(f"📦 Batch converting {len(input_files)} files...")
        print(f"🔄 Conversion type: {conversion_type}")
        
        for i, input_file in enumerate(input_files, 1):
            print(f"\n📝 Processing [{i}/{len(input_files)}]: {input_file}")
            
            # Generate output filename
            input_path = Path(input_file)
            if '*' in output_pattern:
                output_file = output_pattern.replace('*', input_path.stem)
            else:
                output_file = f"{output_pattern}/{input_path.stem}_converted{self.get_output_extension(conversion_type)}"
            
            # Perform conversion
            result = self.convert_file(input_file, output_file, conversion_type, options)
            
            if result["success"]:
                results["successful"] += 1
                results["conversions"].append(result)
                print(f"   ✅ Success: {output_file}")
            else:
                results["failed"] += 1
                results["errors"].append({
                    "input_file": input_file,
                    "error": result["error"]
                })
                print(f"   ❌ Failed: {result['error']}")
        
        print(f"\n📊 Batch conversion complete:")
        print(f"   ✅ Successful: {results['successful']}")
        print(f"   ❌ Failed: {results['failed']}")
        print(f"   📈 Success rate: {(results['successful'] / results['total_files'] * 100):.1f}%")
        
        return results
    
    def get_output_extension(self, conversion_type: str) -> str:
        """Get appropriate file extension for conversion type"""
        extension_map = {
            'json_to_yaml': '.yml',
            'yaml_to_json': '.json',
            'csv_to_json': '.json',
            'json_to_csv': '.csv',
            'xml_to_json': '.json',
            'json_to_xml': '.xml',
            'legacy_to_arcsec': '.json',
            'arcsec_to_standard': '.json',
            'base64_encode': '.b64',
            'base64_decode': '.bin',
            'binary_to_hex': '.hex',
            'hex_to_binary': '.bin'
        }
        
        return extension_map.get(conversion_type, '.converted')
    
    def validate_conversion(self, original_path: str, converted_path: str, 
                          conversion_type: str) -> Dict[str, Any]:
        """Validate conversion integrity"""
        validation_result = {
            "valid": False,
            "checks": {},
            "issues": []
        }
        
        try:
            # Check file existence
            validation_result["checks"]["files_exist"] = (
                os.path.exists(original_path) and os.path.exists(converted_path)
            )
            
            if not validation_result["checks"]["files_exist"]:
                validation_result["issues"].append("One or more files do not exist")
                return validation_result
            
            # Check file sizes
            original_size = os.path.getsize(original_path)
            converted_size = os.path.getsize(converted_path)
            
            validation_result["checks"]["size_reasonable"] = (
                converted_size > 0 and converted_size < original_size * 10
            )
            
            # Check round-trip conversion for certain types
            if conversion_type in ['json_to_yaml', 'yaml_to_json']:
                validation_result["checks"]["round_trip"] = self.validate_round_trip(
                    original_path, converted_path, conversion_type
                )
            
            # Check ARCSEC metadata for ARCSEC conversions
            if 'arcsec' in conversion_type:
                validation_result["checks"]["arcsec_metadata"] = self.validate_arcsec_metadata(
                    converted_path
                )
            
            # Overall validation
            validation_result["valid"] = all(validation_result["checks"].values())
            
            if not validation_result["valid"]:
                validation_result["issues"].append("One or more validation checks failed")
            
        except Exception as e:
            validation_result["issues"].append(f"Validation error: {str(e)}")
        
        return validation_result
    
    def validate_round_trip(self, original_path: str, converted_path: str, 
                           conversion_type: str) -> bool:
        """Validate by performing round-trip conversion"""
        try:
            with tempfile.NamedTemporaryFile(suffix='.tmp', delete=False) as temp_file:
                temp_path = temp_file.name
            
            # Determine reverse conversion
            reverse_conversions = {
                'json_to_yaml': 'yaml_to_json',
                'yaml_to_json': 'json_to_yaml'
            }
            
            reverse_type = reverse_conversions.get(conversion_type)
            if not reverse_type:
                return True  # Can't validate round-trip
            
            # Perform reverse conversion
            self.convert_file(converted_path, temp_path, reverse_type)
            
            # Compare original and round-trip result
            with open(original_path, 'r') as f1, open(temp_path, 'r') as f2:
                original_data = json.load(f1) if original_path.endswith('.json') else yaml.safe_load(f1)
                roundtrip_data = json.load(f2) if temp_path.endswith('.json') else yaml.safe_load(f2)
            
            # Clean up
            os.unlink(temp_path)
            
            return original_data == roundtrip_data
            
        except Exception:
            return False
    
    def validate_arcsec_metadata(self, filepath: str) -> bool:
        """Validate ARCSEC metadata in converted file"""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            if not isinstance(data, dict) or "_arcsec_metadata" not in data:
                return False
            
            metadata = data["_arcsec_metadata"]
            required_fields = ["version", "creator", "digital_signature"]
            
            return all(field in metadata for field in required_fields)
            
        except Exception:
            return False
    
    def calculate_file_checksum(self, filepath: str) -> str:
        """Calculate SHA256 checksum of file"""
        sha256_hash = hashlib.sha256()
        with open(filepath, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256_hash.update(chunk)
        return sha256_hash.hexdigest()
    
    def format_size(self, size_bytes: int) -> str:
        """Format file size in human readable format"""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} TB"
    
    def get_supported_conversions(self) -> Dict[str, str]:
        """Get list of supported conversions"""
        descriptions = {
            'json_to_yaml': 'Convert JSON to YAML format',
            'yaml_to_json': 'Convert YAML to JSON format',
            'csv_to_json': 'Convert CSV to JSON format',
            'json_to_csv': 'Convert JSON to CSV format',
            'xml_to_json': 'Convert XML to JSON format',
            'json_to_xml': 'Convert JSON to XML format',
            'legacy_to_arcsec': 'Convert legacy format to ARCSEC-compliant format',
            'arcsec_to_standard': 'Convert ARCSEC format to standard format',
            'base64_encode': 'Encode binary data to base64',
            'base64_decode': 'Decode base64 to binary data',
            'binary_to_hex': 'Convert binary data to hexadecimal',
            'hex_to_binary': 'Convert hexadecimal to binary data'
        }
        
        return descriptions

def main():
    """Main execution function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="ARCSEC Format Converter")
    parser.add_argument("--convert", help="Single file conversion: input_file")
    parser.add_argument("--batch", help="Batch conversion: input_pattern")
    parser.add_argument("--output", help="Output file or pattern")
    parser.add_argument("--type", choices=list(ARCSECConverter().conversions.keys()), 
                       help="Conversion type")
    parser.add_argument("--validate", help="Validate conversion result")
    parser.add_argument("--list", action="store_true", help="List supported conversions")
    
    args = parser.parse_args()
    
    converter = ARCSECConverter()
    
    if args.list:
        # List supported conversions
        conversions = converter.get_supported_conversions()
        print("📋 Supported Conversions:")
        for conv_type, description in conversions.items():
            print(f"   {conv_type}: {description}")
        return
    
    if not args.type:
        print("❌ Conversion type is required")
        parser.print_help()
        return
    
    if args.convert:
        # Single file conversion
        if not args.output:
            input_path = Path(args.convert)
            output_ext = converter.get_output_extension(args.type)
            args.output = f"{input_path.stem}_converted{output_ext}"
        
        result = converter.convert_file(args.convert, args.output, args.type)
        
        if result["success"]:
            print(f"\n📋 Conversion Summary:")
            print(f"   Input: {result['input_path']}")
            print(f"   Output: {result['output_path']}")
            print(f"   Type: {result['conversion_type']}")
            print(f"   Input size: {converter.format_size(result['input_size'])}")
            print(f"   Output size: {converter.format_size(result['output_size'])}")
        
    elif args.batch:
        # Batch conversion
        if not args.output:
            args.output = "converted_*"
        
        results = converter.batch_convert(args.batch, args.output, args.type)
        
        # Save batch results
        with open("ARCSEC_BATCH_CONVERSION_RESULTS.json", 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"📋 Detailed results saved: ARCSEC_BATCH_CONVERSION_RESULTS.json")
    
    elif args.validate:
        # Validate conversion
        if not args.output:
            print("❌ Output file is required for validation")
            return
        
        validation = converter.validate_conversion(args.validate, args.output, args.type)
        
        print(f"🔍 Conversion Validation:")
        print(f"   Valid: {validation['valid']}")
        
        for check, result in validation["checks"].items():
            status = "✅" if result else "❌"
            print(f"   {status} {check.replace('_', ' ').title()}: {result}")
        
        if validation["issues"]:
            print(f"   Issues:")
            for issue in validation["issues"]:
                print(f"     - {issue}")
    
    else:
        parser.print_help()

if __name__ == "__main__":
    main()