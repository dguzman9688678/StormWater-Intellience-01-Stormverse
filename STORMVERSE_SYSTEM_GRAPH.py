#!/usr/bin/env python3
"""
StormVerse Environmental Intelligence Platform - Full System Graph
© 2025 Daniel Guzman - All Rights Reserved
Digital Signature: a6672edf248c5eeef3054ecca057075c938af653
"""

from graphviz import Digraph
import os

def create_stormverse_graph():
    """Create comprehensive StormVerse system architecture graph"""
    
    dot = Digraph(comment='StormVerse Environmental Intelligence Platform - Complete System Architecture')
    dot.attr(rankdir='TB', size='16,12', dpi='300')
    dot.attr('node', shape='box', style='rounded,filled', fontname='Arial')
    dot.attr('edge', fontname='Arial', fontsize='10')

    # Color scheme for different layers
    ui_color = '#00ffff'      # Cyberpunk cyan
    agent_color = '#ff6b6b'   # Agent red
    service_color = '#4ecdc4' # Service teal
    data_color = '#ffe66d'    # Data yellow
    security_color = '#a8e6cf' # Security green

    # User Interface Layer
    with dot.subgraph(name='cluster_ui') as ui:
        ui.attr(label='User Interface Layer', style='filled', color='lightgrey')
        ui.node('UI', 'React Frontend\n(CesiumJS 3D Globe)', fillcolor=ui_color)
        ui.node('AdminUI', 'Admin Control Panel\n(System Management)', fillcolor=ui_color)
        ui.node('Dashboard', 'Real-time Dashboard\n(Metrics + Status)', fillcolor=ui_color)
        ui.node('Map3D', '3D Earth Visualization\n(Orbital Agents)', fillcolor=ui_color)

    # AI Agent Network (8 Agents)
    with dot.subgraph(name='cluster_agents') as agents:
        agents.attr(label='AI Agent Network (8 Agents)', style='filled', color='lightcoral')
        agents.node('JARVIS', 'JARVIS\n(Command Router\n& Coordinator)', fillcolor=agent_color)
        agents.node('MITO', 'MITO\n(DevOps Builder\n& Automation)', fillcolor=agent_color)
        agents.node('PHOENIX', 'PHOENIX\n(Historical Archive\n& Memory)', fillcolor=agent_color)
        agents.node('ULTRON', 'ULTRON\n(Validation\n& Metadata)', fillcolor=agent_color)
        agents.node('VADER', 'VADER\n(Surveillance\n& Network Monitor)', fillcolor=agent_color)
        agents.node('ODIN', 'ODIN\n(ARCSEC Enforcement\n& Security)', fillcolor=agent_color)
        agents.node('ECHO', 'ECHO\n(Audio Interface\n& NLP)', fillcolor=agent_color)
        agents.node('STORM', 'STORM\n(Environmental Core\n& Weather AI)', fillcolor=agent_color)

    # Backend Services
    with dot.subgraph(name='cluster_services') as services:
        services.attr(label='Backend Services', style='filled', color='lightblue')
        services.node('MasterController', 'ARCSEC Master Controller\n(Centralized Command)', fillcolor=security_color)
        services.node('API', 'Express.js API Layer\n(100+ Endpoints)', fillcolor=service_color)
        services.node('WebSocket', 'WebSocket Service\n(Real-time Streams)', fillcolor=service_color)
        services.node('MLEngine', 'Machine Learning Engine\n(AI Processing)', fillcolor=service_color)
        services.node('QuantumEngine', 'Quantum Analysis Engine\n(4.25 qubits, 19D)', fillcolor=service_color)

    # Data Processing Layer
    with dot.subgraph(name='cluster_data') as data:
        data.attr(label='Data Processing & External APIs', style='filled', color='lightyellow')
        data.node('NOAA', 'NOAA Weather API\n(Live Data)', fillcolor=data_color)
        data.node('KMZ', 'KMZ/GeoJSON Processor\n(Spatial Data)', fillcolor=data_color)
        data.node('TripleStore', 'Triple Store Service\n(Semantic Data)', fillcolor=data_color)
        data.node('DB', 'PostgreSQL Database\n(7 Tables + Drizzle ORM)', fillcolor=data_color)

    # Security & Compliance
    with dot.subgraph(name='cluster_security') as security:
        security.attr(label='ARCSEC v3.0X WAR MODE Security', style='filled', color='lightgreen')
        security.node('ARCSEC', 'ARCSEC Universal Handler\n(Digital Signatures)', fillcolor=security_color)
        security.node('Monitor', 'System Monitor\n(30s Integrity Checks)', fillcolor=security_color)
        security.node('Compliance', 'Compliance Engine\n(EPA/FEMA)', fillcolor=security_color)

    # Output & Export
    with dot.subgraph(name='cluster_output') as output:
        output.attr(label='Output & Visualization', style='filled', color='lightsteelblue')
        output.node('Export', 'Export Engine\n(PDF/JSON/Reports)', fillcolor=ui_color)
        output.node('Visualization', 'Weather Visualization\n(Storm Cones, Hurricanes)', fillcolor=ui_color)
        output.node('Diagnostics', 'Diagnostics Panel\n(Loop Detection)', fillcolor=ui_color)

    # Main data flow connections
    dot.edges([
        # User Interface to Router
        ('UI', 'JARVIS'),
        ('AdminUI', 'MasterController'),
        ('Dashboard', 'API'),
        
        # JARVIS coordinates all agents
        ('JARVIS', 'MITO'),
        ('JARVIS', 'PHOENIX'),
        ('JARVIS', 'ULTRON'),
        ('JARVIS', 'VADER'),
        ('JARVIS', 'ODIN'),
        ('JARVIS', 'ECHO'),
        ('JARVIS', 'STORM'),
        
        # Master Controller oversight
        ('MasterController', 'JARVIS'),
        ('MasterController', 'API'),
        ('MasterController', 'ARCSEC'),
        ('MasterController', 'Monitor'),
        
        # API Layer connections
        ('API', 'MLEngine'),
        ('API', 'QuantumEngine'),
        ('API', 'WebSocket'),
        ('API', 'DB'),
        
        # Agent specializations
        ('STORM', 'NOAA'),
        ('STORM', 'QuantumEngine'),
        ('ULTRON', 'KMZ'),
        ('PHOENIX', 'TripleStore'),
        ('ODIN', 'ARCSEC'),
        ('VADER', 'Monitor'),
        
        # Data processing
        ('NOAA', 'DB'),
        ('KMZ', 'DB'),
        ('TripleStore', 'DB'),
        
        # Security layer
        ('ARCSEC', 'DB'),
        ('Monitor', 'Compliance'),
        ('Compliance', 'Export'),
        
        # Visualization pipeline
        ('QuantumEngine', 'Visualization'),
        ('DB', 'Export'),
        ('WebSocket', 'Dashboard'),
        ('Monitor', 'Diagnostics'),
        
        # Output to UI
        ('Export', 'UI'),
        ('Visualization', 'Map3D'),
        ('Diagnostics', 'Dashboard'),
        ('Map3D', 'UI')
    ])

    # Add system metrics as labels
    dot.node('Metrics', '''System Metrics:
• 8 AI Agents Active
• 13 Protected Files  
• WAR MODE Security
• < 15ms API Response
• 4x Quantum Speedup
• 99.9% Uptime Target''', shape='note', fillcolor='white', style='filled')

    return dot

def main():
    """Generate and save the StormVerse system graph"""
    try:
        # Create the graph
        graph = create_stormverse_graph()
        
        # Save as PNG
        output_path = 'stormverse_complete_architecture'
        graph.render(output_path, format='png', cleanup=True)
        
        # Also save the DOT source
        with open(f'{output_path}.dot', 'w') as f:
            f.write(graph.source)
        
        print(f"✅ StormVerse system graph generated successfully!")
        print(f"📊 PNG: {output_path}.png")
        print(f"📄 DOT: {output_path}.dot")
        
        return True
        
    except Exception as e:
        print(f"❌ Error generating graph: {str(e)}")
        return False

if __name__ == "__main__":
    main()