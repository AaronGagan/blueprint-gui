import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import ReactFlow, { Background, Controls, Handle, MarkerType, Position, useNodesState, BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import 'reactflow/dist/style.css';
import './App.css';

const BoxNode = ({ data, id, isConnectable }) => {
  const isGroup = data?.isGroup;
  const isSeparator = data?.isSeparator;
  const isLabel = data?.isLabel;

  if (isSeparator) {
    // Invisible anchor node used only to draw separator edges; keep handles hidden but present
    return (
      <div style={{ width: data.width || 2, height: data.height || 2, pointerEvents: 'none' }}>
        <Handle type="source" position={Position.Right} className="node-handle" id="right" isConnectable={isConnectable} style={{ opacity: 0 }} />
        <Handle type="target" position={Position.Left} className="node-handle" id="left" isConnectable={isConnectable} style={{ opacity: 0 }} />
      </div>
    );
  }

  if (isLabel) {
    // Label node with gray text, no background, no handles
    return (
      <div style={{ 
        cursor: 'default', 
        userSelect: 'none',
        color: '#888',
        fontSize: '12px',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        padding: '4px 8px',
        transform: 'translateX(-50%)'
      }}>
        {data.label}
      </div>
    );
  }

  const containerStyle = isGroup
    ? {
        width: data.width,
        height: data.height,
        background: 'rgba(97, 218, 251, 0.1)',
        border: '2px solid #61dafb',
        borderRadius: '8px',
        cursor: 'default'
      }
    : {};

  const renderHandles = () => {
    if (isGroup) {
      if (data.side === 'left') {
        return (
          <>
            <Handle type="target" position={Position.Right} className="node-handle" id="right" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Right} className="node-handle" id="right" isConnectable={isConnectable} />
          </>
        );
      }
      if (data.side === 'right') {
        return (
          <>
            <Handle type="target" position={Position.Left} className="node-handle" id="left" isConnectable={isConnectable} />
            <Handle type="source" position={Position.Left} className="node-handle" id="left" isConnectable={isConnectable} />
          </>
        );
      }
      return null;
    }

    return (
      <>
        <Handle type="target" position={Position.Top} className="node-handle" id="top" isConnectable={isConnectable} />
        <Handle type="source" position={Position.Top} className="node-handle" id="top" isConnectable={isConnectable} />
        <Handle type="target" position={Position.Left} className="node-handle" id="left" isConnectable={isConnectable} />
        <Handle type="source" position={Position.Left} className="node-handle" id="left" isConnectable={isConnectable} />
        <Handle type="target" position={Position.Right} className="node-handle" id="right" isConnectable={isConnectable} />
        <Handle type="source" position={Position.Right} className="node-handle" id="right" isConnectable={isConnectable} />
        <Handle type="target" position={Position.Bottom} className="node-handle" id="bottom" isConnectable={isConnectable} />
        <Handle type="source" position={Position.Bottom} className="node-handle" id="bottom" isConnectable={isConnectable} />
      </>
    );
  };

  return (
    <div className="box-node" style={{ cursor: 'pointer', userSelect: 'none', ...containerStyle }}>
      {renderHandles()}
      {!isGroup && <span>{data.label}</span>}
    </div>
  );
};

// Custom edge with hover tooltip for data objects
const DataFlowEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, markerStart, data }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={style}
      />
      {/* SVG background and text label rendered on top of the edge */}
      <rect
        x={labelX - 35}
        y={labelY - 8}
        width="70"
        height="16"
        fill="rgba(97, 218, 251, 0.3)"
        rx="4"
        ry="4"
        style={{ pointerEvents: 'none' }}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#61dafb"
        fontSize="10"
        fontWeight="500"
        style={{
          pointerEvents: 'auto',
          cursor: 'pointer',
          textShadow: '0 0 3px rgba(0, 0, 0, 0.8)',
          filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
          zIndex: 5000
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {data?.dataObjects?.length || 0} data object(s)
      </text>
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            zIndex: 100,
          }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {showTooltip && data?.dataObjects && data.dataObjects.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginTop: '8px',
              background: '#1a1f2e',
              border: '2px solid #61dafb',
              borderRadius: '8px',
              padding: '12px',
              minWidth: '250px',
              maxWidth: '500px',
              zIndex: 10000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}>
              <div style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '12px', fontSize: '12px' }}>
                Data Flow:
              </div>
              {data.dataObjects.map((obj, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '10px',
                  padding: '8px',
                  background: 'rgba(97, 218, 251, 0.05)',
                  borderRadius: '6px',
                  borderLeft: '3px solid #61dafb',
                }}>
                  <div style={{ 
                    color: '#4caf50', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    marginBottom: '4px'
                  }}>
                    {obj.from}
                  </div>
                  <div style={{
                    color: '#ff9800',
                    fontSize: '11px',
                    margin: '4px 0',
                    paddingLeft: '8px'
                  }}>
                    → {obj.name}
                  </div>
                  <div style={{ 
                    color: '#4caf50', 
                    fontSize: '10px', 
                    fontWeight: 'bold',
                    marginTop: '4px'
                  }}>
                    {obj.to}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Comprehensive relationship data from CSV
const relationshipData = {
  'Interfacing Capability': [
    { element1: 'Capability Pillar Bravo', element2: 'Capability Pillar Alpha' },
    { element1: 'Capability Pillar Alpha', element2: 'Capability Pillar Bravo' },
  ],
  'Realises Capability': [
    { element1: 'Capability Pillar Alpha', element2: 'A - ASR - Initial Analysis' },
    { element1: 'Capability Pillar Alpha', element2: 'A - SFR - Solution Selection' },
    { element1: 'Capability Pillar Alpha', element2: 'A - SRR - Requirements Development' },
    { element1: 'Capability Pillar Bravo', element2: 'B - ASR - Create Management Plan' },
    { element1: 'Capability Pillar Bravo', element2: 'B - SFR - Detailed Analysis' },
    { element1: 'Capability Pillar Bravo', element2: 'B - SFR - Develop External Geometry' },
    { element1: 'Capability Pillar Bravo', element2: 'B - SFR - Develop Internal Geometry' },
    { element1: 'Capability Pillar Bravo', element2: 'B - SRR - Architecture Definition' },
  ],
  'Functional Flow': [
    { element1: 'A - SRR - Requirements Development', element2: 'A - ASR - Initial Analysis' },
    { element1: 'A - SFR - Solution Selection', element2: 'A - SRR - Requirements Development' },
    { element1: 'B - SRR - Architecture Definition', element2: 'A - SRR - Requirements Development' },
    { element1: 'A - SFR - Solution Selection', element2: 'B - SFR - Detailed Analysis' },
    { element1: 'B - SFR - Develop Internal Geometry', element2: 'B - SFR - Develop External Geometry' },
    { element1: 'B - SFR - Develop External Geometry', element2: 'B - SFR - Develop Internal Geometry' },
    { element1: 'B - SFR - Detailed Analysis', element2: 'B - SRR - Architecture Definition' },
  ],
  'Read': [
    { element1: 'Customer Requirements, Customer, ASR, [FINAL]', element2: 'A - ASR - Initial Analysis' },
    { element1: 'Detailed Analysis Report, B, SFR, [FINAL]', element2: 'A - SFR - Solution Selection' },
    { element1: 'Requirements Set, A, SRR, [FINAL]', element2: 'A - SFR - Solution Selection' },
    { element1: 'Customer Requirements, Customer, ASR, [FINAL]', element2: 'A - SRR - Requirements Development' },
    { element1: 'Initial Analysis Dataset, A, ASR, [FINAL]', element2: 'A - SRR - Requirements Development' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'A - SRR - Requirements Development' },
    { element1: 'Customer Requirements, Customer, ASR, [FINAL]', element2: 'B - ASR - Create Management Plan' },
    { element1: 'Logical Architecture Model, B, SRR, [FINAL]', element2: 'B - SFR - Detailed Analysis' },
    { element1: 'Management Plan, B, ASR, [FINAL]', element2: 'B - SFR - Detailed Analysis' },
    { element1: 'Internal Geometry, B,  SFR, [FINAL]', element2: 'B - SFR - Develop External Geometry' },
    { element1: 'Design Requirements, B, SFR, [FINAL]', element2: 'B - SFR - Develop Internal Geometry' },
    { element1: 'External Geometry, B, SFR, [DRAFT]', element2: 'B - SFR - Develop Internal Geometry' },
    { element1: 'Management Plan, B, ASR, [FINAL]', element2: 'B - SRR - Architecture Definition' },
    { element1: 'Requirements Set, A, SRR, [FINAL]', element2: 'B - SRR - Architecture Definition' },
  ],
  'Write': [
    { element1: 'Initial Analysis Dataset, A, ASR, [FINAL]', element2: 'A - ASR - Initial Analysis' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'A - ASR - Initial Analysis' },
    { element1: 'Detailed Analysis Dataset, A, SFR, [FINAL]', element2: 'A - SFR - Solution Selection' },
    { element1: 'Solution Downselection, A, SFR [FINAL]', element2: 'A - SFR - Solution Selection' },
    { element1: 'Requirements Set, A, SRR, [FINAL]', element2: 'A - SRR - Requirements Development' },
    { element1: 'Management Plan, B, ASR, [FINAL]', element2: 'B - ASR - Create Management Plan' },
    { element1: 'Detailed Analysis Dataset, B, SFR, [FINAL]', element2: 'B - SFR - Detailed Analysis' },
    { element1: 'Detailed Analysis Report, B, SFR, [FINAL]', element2: 'B - SFR - Detailed Analysis' },
    { element1: 'Design Requirements, B, SFR, [FINAL]', element2: 'B - SFR - Develop External Geometry' },
    { element1: 'External Geometry, B, SFR, [DRAFT]', element2: 'B - SFR - Develop External Geometry' },
    { element1: 'Internal Geometry, B,  SFR, [FINAL]', element2: 'B - SFR - Develop Internal Geometry' },
    { element1: 'Logical Architecture Model, B, SRR, [FINAL]', element2: 'B - SRR - Architecture Definition' },
  ],
  'Associated Gate to Function': [
    { element1: 'A - ASR - Initial Analysis', element2: 'ASR  Gate' },
    { element1: 'B - ASR - Create Management Plan', element2: 'ASR  Gate' },
    { element1: 'A - SFR - Solution Selection', element2: 'SFR Gate' },
    { element1: 'B - SFR - Detailed Analysis', element2: 'SFR Gate' },
    { element1: 'B - SFR - Develop External Geometry', element2: 'SFR Gate' },
    { element1: 'B - SFR - Develop Internal Geometry', element2: 'SFR Gate' },
    { element1: 'A - SRR - Requirements Development', element2: 'SRR  Gate' },
    { element1: 'B - SRR - Architecture Definition', element2: 'SRR  Gate' },
  ],
  'Tool Services Function': [
    { element1: 'A - ASR - Initial Analysis', element2: 'Preliminary Analysis Tool' },
    { element1: 'A - ASR - Initial Analysis', element2: 'Product Lifecycle Management Tool' },
    { element1: 'A - ASR - Initial Analysis', element2: 'Requirements Management Tool' },
  ],
  'Requirement Realises Function': [
    { element1: 'Stakeholder Need 01 - Pillar A can to perform Preliminary Analysis', element2: 'A - ASR - Initial Analysis' },
    { element1: 'Stakeholder Need 04 - Pillar A can conduct solution downselection', element2: 'A - SFR - Solution Selection' },
    { element1: 'Stakeholder Need 02 - Pillar A can develop Requirements', element2: 'A - SRR - Requirements Development' },
    { element1: 'Stakeholder Need 03 - Pillar A can manage requirements', element2: 'A - SRR - Requirements Development' },
    { element1: 'Stakeholder Need 05 - Pillar B can develop external geometry', element2: 'B - SFR - Develop External Geometry' },
    { element1: 'Stakeholder 06 - Pillar B can manage requirements', element2: 'B - SRR - Architecture Definition' },
  ],
  'Instance Of': [
    { element1: 'Customer Requirements', element2: 'Customer Requirements, Customer, ASR, [FINAL]' },
    { element1: 'Design Requirements', element2: 'Design Requirements, B, SFR, [FINAL]' },
    { element1: 'Analysis Dataset', element2: 'Detailed Analysis Dataset, A, SFR, [FINAL]' },
    { element1: 'Analysis Dataset', element2: 'Detailed Analysis Dataset, B, SFR, [FINAL]' },
    { element1: 'Analysis Report', element2: 'Detailed Analysis Report, B, SFR, [FINAL]' },
    { element1: 'External Geometry', element2: 'External Geometry, B, SFR, [DRAFT]' },
    { element1: 'Analysis Dataset', element2: 'Initial Analysis Dataset, A, ASR, [FINAL]' },
    { element1: 'Analysis Report', element2: 'Initial Analysis Report, A, ASR, [FINAL]' },
    { element1: 'Internal Geometry', element2: 'Internal Geometry, B,  SFR, [FINAL]' },
    { element1: 'Logical Architecture Model', element2: 'Logical Architecture Model, B, SRR, [FINAL]' },
    { element1: 'Management Plan', element2: 'Management Plan, B, ASR, [FINAL]' },
    { element1: 'Requirements Set', element2: 'Requirements Set, A, SRR, [FINAL]' },
    { element1: 'Solution Downselection', element2: 'Solution Downselection, A, SFR [FINAL]' },
  ],
  'Associated Gate to Representation': [
    { element1: 'Customer Requirements, Customer, ASR, [FINAL]', element2: 'ASR  Gate' },
    { element1: 'Initial Analysis Dataset, A, ASR, [FINAL]', element2: 'ASR  Gate' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'ASR  Gate' },
    { element1: 'Management Plan, B, ASR, [FINAL]', element2: 'ASR  Gate' },
    { element1: 'Design Requirements, B, SFR, [FINAL]', element2: 'SFR Gate' },
    { element1: 'Detailed Analysis Dataset, A, SFR, [FINAL]', element2: 'SFR Gate' },
    { element1: 'Detailed Analysis Dataset, B, SFR, [FINAL]', element2: 'SFR Gate' },
    { element1: 'Detailed Analysis Report, B, SFR, [FINAL]', element2: 'SFR Gate' },
    { element1: 'External Geometry, B, SFR, [DRAFT]', element2: 'SFR Gate' },
    { element1: 'Internal Geometry, B,  SFR, [FINAL]', element2: 'SFR Gate' },
    { element1: 'Solution Downselection, A, SFR [FINAL]', element2: 'SFR Gate' },
    { element1: 'Logical Architecture Model, B, SRR, [FINAL]', element2: 'SRR  Gate' },
    { element1: 'Requirements Set, A, SRR, [FINAL]', element2: 'SRR  Gate' },
  ],
  'Associated Capability': [
    { element1: 'Detailed Analysis Dataset, A, SFR, [FINAL]', element2: 'Capability Pillar Alpha' },
    { element1: 'Initial Analysis Dataset, A, ASR, [FINAL]', element2: 'Capability Pillar Alpha' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'Capability Pillar Alpha' },
    { element1: 'Requirements Set, A, SRR, [FINAL]', element2: 'Capability Pillar Alpha' },
    { element1: 'Solution Downselection, A, SFR [FINAL]', element2: 'Capability Pillar Alpha' },
    { element1: 'Design Requirements, B, SFR, [FINAL]', element2: 'Capability Pillar Bravo' },
    { element1: 'Detailed Analysis Dataset, B, SFR, [FINAL]', element2: 'Capability Pillar Bravo' },
    { element1: 'Detailed Analysis Report, B, SFR, [FINAL]', element2: 'Capability Pillar Bravo' },
    { element1: 'External Geometry, B, SFR, [DRAFT]', element2: 'Capability Pillar Bravo' },
    { element1: 'Internal Geometry, B,  SFR, [FINAL]', element2: 'Capability Pillar Bravo' },
    { element1: 'Logical Architecture Model, B, SRR, [FINAL]', element2: 'Capability Pillar Bravo' },
    { element1: 'Management Plan, B, ASR, [FINAL]', element2: 'Capability Pillar Bravo' },
  ],
  'Uses Service': [
    { element1: 'Detailed Analysis Dataset, B, SFR, [FINAL]', element2: 'Bulk Analysis Data Management Service' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'Bulk Analysis Data Management Service' },
    { element1: 'Detailed Analysis Dataset, A, SFR, [FINAL]', element2: 'Detailed Analysis Service' },
    { element1: 'Detailed Analysis Dataset, B, SFR, [FINAL]', element2: 'Detailed Analysis Service' },
    { element1: 'Detailed Analysis Report, B, SFR, [FINAL]', element2: 'Detailed Analysis Service' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'Document Management Service' },
    { element1: 'Management Plan, B, ASR, [FINAL]', element2: 'Document Management Service' },
    { element1: 'Solution Downselection, A, SFR [FINAL]', element2: 'Document Management Service' },
  ],
  'Uses Component': [
    { element1: 'Logical Architecture Model, B, SRR, [FINAL]', element2: 'Architecture Development Tool' },
    { element1: 'External Geometry, B, SFR, [DRAFT]', element2: 'Computer Aided Design Tool' },
    { element1: 'Internal Geometry, B,  SFR, [FINAL]', element2: 'Computer Aided Design Tool' },
    { element1: 'Initial Analysis Dataset, A, ASR, [FINAL]', element2: 'Preliminary Analysis Tool' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'Preliminary Analysis Tool' },
    { element1: 'Customer Requirements, Customer, ASR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Design Requirements, B, SFR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Detailed Analysis Dataset, A, SFR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Detailed Analysis Dataset, B, SFR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Detailed Analysis Report, B, SFR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'External Geometry, B, SFR, [DRAFT]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Initial Analysis Dataset, A, ASR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Initial Analysis Report, A, ASR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Internal Geometry, B,  SFR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Logical Architecture Model, B, SRR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Management Plan, B, ASR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Requirements Set, A, SRR, [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Solution Downselection, A, SFR [FINAL]', element2: 'Product Lifecycle Management Tool' },
    { element1: 'Customer Requirements, Customer, ASR, [FINAL]', element2: 'Requirements Management Tool' },
    { element1: 'Design Requirements, B, SFR, [FINAL]', element2: 'Requirements Management Tool' },
    { element1: 'Requirements Set, A, SRR, [FINAL]', element2: 'Requirements Management Tool' },
  ],
};

// View generation functions for hierarchical navigation
const generateCapabilityView = (onNodeClick) => {
  const pillars = ['Capability Pillar Alpha', 'Capability Pillar Bravo'];
  const interfacingRels = relationshipData['Interfacing Capability'];
  
  const nodes = pillars.map((pillar, idx) => ({
    id: pillar,
    type: 'boxNode',
    position: { x: idx * 300, y: 150 },
    data: { label: pillar, id: pillar },
    selected: false
  }));

  // Check if bidirectional (both directions exist)
  const isBidirectional = interfacingRels.some(rel => 
    interfacingRels.some(other => other.element1 === rel.element2 && other.element2 === rel.element1)
  );

  let edges = [];
  if (isBidirectional) {
    // Only draw one arrow with bidirectional markers
    edges = [{
      id: 'e-0',
      source: 'Capability Pillar Alpha',
      target: 'Capability Pillar Bravo',
      sourceHandle: 'right',
      targetHandle: 'left',
      markerStart: { type: MarkerType.ArrowClosed, color: '#4caf50' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4caf50' },
      style: { stroke: '#4caf50', strokeWidth: 2 },
    }];
  } else {
    // Draw individual arrows
    edges = interfacingRels.map((rel, idx) => ({
      id: `e-${idx}`,
      source: rel.element1,
      target: rel.element2,
      sourceHandle: 'right',
      targetHandle: 'left',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4caf50' },
      style: { stroke: '#4caf50', strokeWidth: 2 },
    }));
  }

  return { nodes, edges };
};

const generateFunctionView = (selectedPillar, onNodeClick) => {
  const functions = relationshipData['Realises Capability']
    .filter(rel => rel.element1 === selectedPillar)
    .map(rel => rel.element2);

  const functionalFlowRels = relationshipData['Functional Flow']
    .filter(rel => functions.includes(rel.element1) && functions.includes(rel.element2));

  const nodes = functions.map((func, idx) => ({
    id: func,
    type: 'boxNode',
    position: { x: (idx % 3) * 350, y: Math.floor(idx / 3) * 150 },
    data: { label: func, id: func },
    selected: false
  }));

  const edges = functionalFlowRels.map((rel, idx) => ({
    id: `e-${idx}`,
    source: rel.element1,
    target: rel.element2,
    sourceHandle: 'right',
    targetHandle: 'left',
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' },
    style: { stroke: '#ff9800', strokeWidth: 2 },
  }));

  return { nodes, edges };
};

const generateFunctionDetailView = (selectedFunction, onNodeClick) => {
  const readRels = relationshipData['Read']
    .filter(rel => rel.element2 === selectedFunction);
  const writeRels = relationshipData['Write']
    .filter(rel => rel.element2 === selectedFunction);

  const nodes = [
    {
      id: selectedFunction,
      type: 'boxNode',
      position: { x: 500, y: 200 },
      data: { label: selectedFunction, id: selectedFunction },
      selected: false
    }
  ];

  // Calculate total height needed for each column
  const readHeight = readRels.length * 120;
  const writeHeight = writeRels.length * 120;
  
  // Calculate starting Y position to center vertically around the function (y=200)
  const readStartY = 200 - (readHeight / 2) + 60; // +60 to account for half of box height
  const writeStartY = 200 - (writeHeight / 2) + 60;

  let yPos = readStartY;
  readRels.forEach((rel, idx) => {
    nodes.push({
      id: `read-${rel.element1}`,
      type: 'boxNode',
      position: { x: 20, y: yPos },
      data: { label: rel.element1, id: rel.element1 },
      selected: false
    });
    yPos += 120;
  });

  yPos = writeStartY;
  writeRels.forEach((rel, idx) => {
    nodes.push({
      id: `write-${rel.element1}`,
      type: 'boxNode',
      position: { x: 980, y: yPos },
      data: { label: rel.element1, id: rel.element1 },
      selected: false
    });
    yPos += 120;
  });

  const edges = [];
  
  readRels.forEach((rel, idx) => {
    edges.push({
      id: `e-read-${idx}`,
      source: `read-${rel.element1}`,
      target: selectedFunction,
      sourceHandle: 'right',
      targetHandle: 'left',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' },
      style: { stroke: '#ff9800', strokeWidth: 2 }
    });
  });

  writeRels.forEach((rel, idx) => {
    edges.push({
      id: `e-write-${idx}`,
      source: selectedFunction,
      target: `write-${rel.element1}`,
      sourceHandle: 'right',
      targetHandle: 'left',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4caf50' },
      style: { stroke: '#4caf50', strokeWidth: 2 }
    });
  });

  // Collect tools used by read data objects
  const readTools = new Set();
  readRels.forEach(rel => {
    const dataObjName = rel.element1;
    if (relationshipData['Uses Component']) {
      relationshipData['Uses Component'].forEach(toolRel => {
        if (toolRel.element1 === dataObjName) {
          readTools.add(toolRel.element2);
        } else if (toolRel.element2 === dataObjName) {
          readTools.add(toolRel.element1);
        }
      });
    }
  });

  // Collect tools used by write data objects
  const writeTools = new Set();
  writeRels.forEach(rel => {
    const dataObjName = rel.element1;
    if (relationshipData['Uses Component']) {
      relationshipData['Uses Component'].forEach(toolRel => {
        if (toolRel.element1 === dataObjName) {
          writeTools.add(toolRel.element2);
        } else if (toolRel.element2 === dataObjName) {
          writeTools.add(toolRel.element1);
        }
      });
    }
  });

  const readToolsArray = Array.from(readTools);
  const writeToolsArray = Array.from(writeTools);

  // Position read tools below read data objects
  const toolYStart = 500; // Start below the data objects

  // Separator line anchors between data objects and tools
  const separatorY = 430;
  nodes.push({
    id: 'separator-left',
    type: 'boxNode',
    position: { x: 0, y: separatorY },
    data: { isSeparator: true, width: 0, height: 0 }
  });
  nodes.push({
    id: 'separator-right',
    type: 'boxNode',
    position: { x: 1320, y: separatorY },
    data: { isSeparator: true, width: 0, height: 0 }
  });

  // Add labels for the two sections
  nodes.push({
    id: 'label-function-data',
    type: 'boxNode',
    position: { x: 660, y: separatorY - 40 },
    data: { label: 'Function-Data Object View', id: 'label-function-data', isLabel: true },
    selected: false
  });
  
  nodes.push({
    id: 'label-toolchain',
    type: 'boxNode',
    position: { x: 660, y: separatorY + 30 },
    data: { label: 'Tool-chain View', id: 'label-toolchain', isLabel: true },
    selected: false
  });

  // Add large cyan boxes around tool groups (with handles on edges)
  if (readToolsArray.length > 0) {
    const readGroupHeight = readToolsArray.length * 100 + 40; // Tools height + padding
    nodes.push({
      id: 'read-tools-group',
      type: 'boxNode',
      position: { x: 10, y: toolYStart - 20 },
      data: { label: '', id: 'read-tools-group', isGroup: true, side: 'left', width: 320, height: readGroupHeight },
      selected: false
    });
  }

  if (writeToolsArray.length > 0) {
    const writeGroupHeight = writeToolsArray.length * 100 + 40; // Tools height + padding
    nodes.push({
      id: 'write-tools-group',
      type: 'boxNode',
      position: { x: 970, y: toolYStart - 20 },
      data: { label: '', id: 'write-tools-group', isGroup: true, side: 'right', width: 320, height: writeGroupHeight },
      selected: false
    });
  }

  readToolsArray.forEach((tool, idx) => {
    nodes.push({
      id: `read-tool-${tool}`,
      type: 'boxNode',
      position: { x: 20, y: toolYStart + (idx * 100) },
      data: { label: tool, id: tool },
      selected: false
    });
  });

  // Position write tools below write data objects
  writeToolsArray.forEach((tool, idx) => {
    nodes.push({
      id: `write-tool-${tool}`,
      type: 'boxNode',
      position: { x: 980, y: toolYStart + (idx * 100) },
      data: { label: tool, id: tool },
      selected: false
    });
  });

  // Draw lines between read tools
  for (let i = 0; i < readToolsArray.length - 1; i++) {
    edges.push({
      id: `e-read-tool-${i}`,
      source: `read-tool-${readToolsArray[i]}`,
      target: `read-tool-${readToolsArray[i + 1]}`,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      style: { stroke: '#61dafb', strokeWidth: 2 }
    });
  }

  // Draw lines between write tools
  for (let i = 0; i < writeToolsArray.length - 1; i++) {
    edges.push({
      id: `e-write-tool-${i}`,
      source: `write-tool-${writeToolsArray[i]}`,
      target: `write-tool-${writeToolsArray[i + 1]}`,
      sourceHandle: 'bottom',
      targetHandle: 'top',
      style: { stroke: '#61dafb', strokeWidth: 2 }
    });
  }

  // Draw dotted line between the two large cyan group boxes (if both exist)
  if (readToolsArray.length > 0 && writeToolsArray.length > 0) {
    edges.push({
      id: 'e-tool-groups',
      source: 'read-tools-group',
      target: 'write-tools-group',
      sourceHandle: 'right',
      targetHandle: 'left',
      type: 'straight',
      style: { stroke: '#888', strokeWidth: 2, strokeDasharray: '5,5' }
    });
  }

  // Solid separator line between data objects and toolsets
  edges.push({
    id: 'e-tools-separator',
    source: 'separator-left',
    target: 'separator-right',
    sourceHandle: 'right',
    targetHandle: 'left',
    type: 'straight',
    style: { stroke: '#ccc', strokeWidth: 2 }
  });

  return { nodes, edges };
};

// Generate view showing all functions with functional flows and data objects
const generateFunctionalFlowView = () => {
  // Get all unique functions from Realises Capability relationships
  const allFunctions = new Set();
  relationshipData['Realises Capability'].forEach(rel => {
    allFunctions.add(rel.element2);
  });
  
  const functionsArray = Array.from(allFunctions);
  
  // Group functions by gate type (ASR, SFR, SRR) extracted from function name
  const functionsByGate = {
    'ASR': [],
    'SFR': [],
    'SRR': []
  };
  
  functionsArray.forEach(func => {
    if (func.includes(' - ASR - ')) {
      functionsByGate['ASR'].push(func);
    } else if (func.includes(' - SFR - ')) {
      functionsByGate['SFR'].push(func);
    } else if (func.includes(' - SRR - ')) {
      functionsByGate['SRR'].push(func);
    }
  });
  
  // Create nodes organized in columns by gate type
  const nodes = [];
  const gateOrder = ['ASR', 'SRR', 'SFR'];
  const columnSpacing = 400;
  const rowSpacing = 150;
  const startX = 100;
  const startY = 100;
  
  gateOrder.forEach((gate, colIdx) => {
    functionsByGate[gate].forEach((func, rowIdx) => {
      nodes.push({
        id: func,
        type: 'boxNode',
        position: { 
          x: startX + colIdx * columnSpacing,
          y: startY + rowIdx * rowSpacing
        },
        data: { label: func, id: func },
        selected: false
      });
    });
  });
  
  // Create edges for Functional Flow relationships with data objects
  const edges = [];
  const functionalFlowRels = relationshipData['Functional Flow'];
  const readRels = relationshipData['Read'];
  const writeRels = relationshipData['Write'];
  
  // Track processed bidirectional pairs to avoid duplicates
  const processedPairs = new Set();
  
  // Create a map of node positions for handle calculation
  const nodePositions = {};
  nodes.forEach(node => {
    nodePositions[node.id] = node.position;
  });
  
  functionalFlowRels.forEach((flow, idx) => {
    // Check if this is a bidirectional relationship
    const reverseFlow = functionalFlowRels.find(f => 
      f.element1 === flow.element2 && f.element2 === flow.element1
    );
    
    // Create a sorted pair key to identify this relationship
    const pairKey = [flow.element1, flow.element2].sort().join('|||');
    
    // Skip if we've already processed this bidirectional pair
    if (processedPairs.has(pairKey)) {
      return;
    }
    processedPairs.add(pairKey);
    
    // Calculate correct handles based on node positions
    // Note: Functional Flow goes from element2 to element1
    const sourcePos = nodePositions[flow.element2];
    const targetPos = nodePositions[flow.element1];
    
    let sourceHandle = 'right';
    let targetHandle = 'left';
    
    if (sourcePos && targetPos) {
      const dx = Math.abs(targetPos.x - sourcePos.x);
      const dy = Math.abs(targetPos.y - sourcePos.y);
      
      if (dy > dx) {
        // Vertically aligned: use top/bottom
        if (targetPos.y > sourcePos.y) {
          sourceHandle = 'bottom';
          targetHandle = 'top';
        } else {
          sourceHandle = 'top';
          targetHandle = 'bottom';
        }
      } else {
        // Horizontally aligned: use left/right
        if (targetPos.x > sourcePos.x) {
          sourceHandle = 'right';
          targetHandle = 'left';
        } else {
          sourceHandle = 'left';
          targetHandle = 'right';
        }
      }
    }
    
    // Find data objects that flow between these two functions
    // Store them with direction information for the tooltip
    const dataObjects = [];
    
    // Check data flow in BOTH directions since Functional Flow relationship 
    // direction doesn't always match data flow direction
    
    // Direction 1: element2 writes -> element1 reads
    const writtenBySource = writeRels
      .filter(w => w.element2 === flow.element2)
      .map(w => w.element1);
    
    const readByTarget = readRels
      .filter(r => r.element2 === flow.element1)
      .map(r => r.element1);
    
    writtenBySource.forEach(dataObj => {
      if (readByTarget.includes(dataObj)) {
        dataObjects.push({
          name: dataObj,
          from: flow.element2,
          to: flow.element1
        });
      }
    });
    
    // Direction 2: element1 writes -> element2 reads (reverse data flow)
    const writtenByTarget = writeRels
      .filter(w => w.element2 === flow.element1)
      .map(w => w.element1);
    
    const readBySource = readRels
      .filter(r => r.element2 === flow.element2)
      .map(r => r.element1);
    
    writtenByTarget.forEach(dataObj => {
      if (readBySource.includes(dataObj) && !dataObjects.some(d => d.name === dataObj)) {
        dataObjects.push({
          name: dataObj,
          from: flow.element1,
          to: flow.element2
        });
      }
    });
    
    edges.push({
      id: `e-flow-${idx}`,
      source: flow.element2,  // Functional Flow goes from element2 to element1
      target: flow.element1,
      sourceHandle,
      targetHandle,
      type: 'dataFlow',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4caf50' },
      markerStart: reverseFlow ? { type: MarkerType.ArrowClosed, color: '#4caf50' } : undefined,
      style: { stroke: reverseFlow ? '#4caf50' : '#61dafb', strokeWidth: 2 },
      data: { dataObjects }
    });
  });
  
  return { nodes, edges };
};

function App() {
  const [currentView, setCurrentView] = useState('hierarchical'); // 'hierarchical' or 'functionalFlow'
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [attributePanelOpen, setAttributePanelOpen] = useState(false);
  const [attributeNode, setAttributeNode] = useState(null);
  const isHandlingClickRef = useRef(false);
  const reactFlowInstanceRef = useRef(null);

  // Auto-center view when switching between levels
  useEffect(() => {
    if (reactFlowInstanceRef.current) {
      const timer = setTimeout(() => {
        reactFlowInstanceRef.current.fitView({ padding: 0.2, duration: 300 });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentView, selectedPillar, selectedFunction]);

  const handleNodeClick = useCallback((nodeId) => {
    // Ignore clicks on data objects and tools
    if (nodeId.startsWith('read-') || nodeId.startsWith('write-')) {
      return;
    }

    console.log('Node clicked:', nodeId, 'currentView:', currentView, 'selectedPillar:', selectedPillar, 'selectedFunction:', selectedFunction);
    if (isHandlingClickRef.current) {
      console.log('Already handling a click, skipping.');
      return;
    }
    isHandlingClickRef.current = true;

    if (currentView === 'functionalFlow') {
      setSelectedFunction(nodeId);
    } else if (!selectedPillar) {
      // On Capability view, click Pillar to go to Functions view
      setSelectedPillar(nodeId);
    } else if (!selectedFunction) {
      // On Function view, click Function to go to Details view
      setSelectedFunction(nodeId);
    }

    // Reset the flag after a brief delay to allow state updates to complete
    setTimeout(() => {
      isHandlingClickRef.current = false;
    }, 50);
  }, [currentView, selectedPillar, selectedFunction]);

  const handleBack = () => {
    if (selectedFunction) {
      setSelectedFunction(null);
    } else if (selectedPillar) {
      setSelectedPillar(null);
    }
  };

  // Generate nodes and edges based on current view level
  let { nodes: generatedNodes, edges: generatedEdges } = useMemo(() => {
    // If a function is selected, show its detail view (works in both views)
    if (selectedFunction) {
      return generateFunctionDetailView(selectedFunction, handleNodeClick);
    }
    
    // Otherwise, show the appropriate high-level view
    if (currentView === 'functionalFlow') {
      return generateFunctionalFlowView();
    } else if (selectedPillar) {
      return generateFunctionView(selectedPillar, handleNodeClick);
    } else {
      return generateCapabilityView(handleNodeClick);
    }
  }, [currentView, selectedPillar, selectedFunction, handleNodeClick]);

  const [nodes, setNodes, onNodesChange] = useNodesState(generatedNodes);

  useEffect(() => {
    setNodes(generatedNodes);
  }, [generatedNodes, setNodes]);

  const handleSelectionChange = useCallback(({ nodes: selectedNodes }) => {
    // Ignore selection changes while we're handling a click
    if (isHandlingClickRef.current) {
      console.log('Ignoring selection change during click handling');
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      return;
    }
    
    if (selectedNodes.length > 0) {
      const selectedNode = selectedNodes[selectedNodes.length - 1];
      console.log('Node selected:', selectedNode.id);
      
      // Check if Ctrl key is pressed for attribute panel
      const isCtrlClick = window.event && (window.event.ctrlKey || window.event.metaKey);
      
      // Block regular clicks on data objects and tools (only allow Ctrl+click)
      const isDataObjectOrTool = selectedNode.id.startsWith('read-') || selectedNode.id.startsWith('write-');
      
      if (isDataObjectOrTool && !isCtrlClick) {
        // Ignore regular clicks on data objects and tools
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
        return;
      }
      
      if (isCtrlClick) {
        setAttributeNode(selectedNode.id);
        setAttributePanelOpen(true);
      } else {
        handleNodeClick(selectedNode.id);
      }
      
      // Immediately clear all selections to prevent cascading updates
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
    }
  }, [handleNodeClick, setNodes, isHandlingClickRef]);

  useEffect(() => {
    const handler = (e) => {
      if (e.message && e.message.includes('ResizeObserver')) {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  const edges = useMemo(() => generatedEdges, [generatedEdges]);
  const nodeTypes = useMemo(() => ({ boxNode: BoxNode }), []);
  const edgeTypes = useMemo(() => ({ dataFlow: DataFlowEdge }), []);
  
  // Get all relationships for the selected data object, categorized
  const getDataObjectRelationships = (nodeId) => {
    const categorized = {
      instanceOf: [],
      associatedGate: [],
      associatedCapability: [],
      usesService: [],
      usesTool: []
    };
    
    // Instance Of - from Instance Of relationship
    if (relationshipData['Instance Of']) {
      relationshipData['Instance Of'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.instanceOf.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.instanceOf.push(rel.element1);
        }
      });
    }
    
    // Associated Gate - from Associated Gate to Representation relationship
    if (relationshipData['Associated Gate to Representation']) {
      relationshipData['Associated Gate to Representation'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.associatedGate.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.associatedGate.push(rel.element1);
        }
      });
    }
    
    // Associated Capability - from Associated Capability relationship
    if (relationshipData['Associated Capability']) {
      relationshipData['Associated Capability'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.associatedCapability.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.associatedCapability.push(rel.element1);
        }
      });
    }
    
    // Uses Service - from Uses Service relationship
    if (relationshipData['Uses Service']) {
      relationshipData['Uses Service'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.usesService.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.usesService.push(rel.element1);
        }
      });
    }
    
    // Uses Tool - from Uses Component relationship
    if (relationshipData['Uses Component']) {
      relationshipData['Uses Component'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.usesTool.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.usesTool.push(rel.element1);
        }
      });
    }
    
    return categorized;
  };

  // Get all relationships for the selected function, categorized
  const getNodeRelationships = (nodeId) => {
    const categorized = {
      capabilityPillar: [],
      associatedGate: [],
      toolsUsed: [],
      requirements: []
    };
    
    // Capability Pillar - from Realises Capability relationship
    // Functions can be in either element1 or element2
    if (relationshipData['Realises Capability']) {
      relationshipData['Realises Capability'].forEach(rel => {
        if (rel.element2 === nodeId) {
          categorized.capabilityPillar.push(rel.element1);
        } else if (rel.element1 === nodeId) {
          categorized.capabilityPillar.push(rel.element2);
        }
      });
    }
    
    // Associated Gate - from Associated Gate to Function relationship
    // Function is typically in element1, gate in element2
    if (relationshipData['Associated Gate to Function']) {
      relationshipData['Associated Gate to Function'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.associatedGate.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.associatedGate.push(rel.element1);
        }
      });
    }
    
    // Tools Used - from Tool Services Function relationship
    if (relationshipData['Tool Services Function']) {
      relationshipData['Tool Services Function'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.toolsUsed.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.toolsUsed.push(rel.element1);
        }
      });
    }
    
    // Requirements - from Requirement Realises Function relationship
    if (relationshipData['Requirement Realises Function']) {
      relationshipData['Requirement Realises Function'].forEach(rel => {
        if (rel.element1 === nodeId) {
          categorized.requirements.push(rel.element2);
        } else if (rel.element2 === nodeId) {
          categorized.requirements.push(rel.element1);
        }
      });
    }
    
    return categorized;
  };
  // Build breadcrumb trail
  const breadcrumbs = ['Home'];
  if (selectedPillar) breadcrumbs.push(selectedPillar);
  if (selectedFunction) breadcrumbs.push(selectedFunction);

  return (
    <div className="app">
      <div className="tab-navigation">
        <button 
          className={`tab-button ${currentView === 'hierarchical' ? 'active' : ''}`}
          onClick={() => setCurrentView('hierarchical')}
        >
          Hierarchical View
        </button>
        <button 
          className={`tab-button ${currentView === 'functionalFlow' ? 'active' : ''}`}
          onClick={() => setCurrentView('functionalFlow')}
        >
          Functional Flow View
        </button>
      </div>
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Relationship Diagram</h1>
            <div className="breadcrumb" style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx}>
                  {idx > 0 && ' > '}
                  {idx === 0 && breadcrumbs.length > 1 ? (
                    <span onClick={() => { setSelectedPillar(null); setSelectedFunction(null); }} style={{ cursor: 'pointer', color: '#61dafb' }}>
                      {crumb}
                    </span>
                  ) : idx === 1 && breadcrumbs.length > 2 ? (
                    <span onClick={() => setSelectedFunction(null)} style={{ cursor: 'pointer', color: '#61dafb' }}>
                      {crumb}
                    </span>
                  ) : (
                    crumb
                  )}
                </span>
              ))}
            </div>
          </div>
          {(selectedPillar || selectedFunction) && (
            <button onClick={handleBack} className="back-button">
              ← Back
            </button>
          )}
        </div>
      </header>

      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onSelectionChange={handleSelectionChange}
          onInit={(instance) => { reactFlowInstanceRef.current = instance; }}
          fitView
          nodesDraggable={false}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          style={{ width: '100%', height: '100%' }}
        >
          <Background gap={18} color="#444" />
          <Controls />
        </ReactFlow>
      </div>

      {/* Attribute Panel */}
      <div className={`attribute-panel ${attributePanelOpen ? 'open' : ''}`}>
        <div className="attribute-panel-header">
          <h3>{attributeNode}</h3>
          <button className="close-button" onClick={() => setAttributePanelOpen(false)}>×</button>
        </div>
        <div className="attribute-panel-content">
          {attributeNode && (() => {
            // Determine if selected node is a data object or function
            // Data objects typically contain commas and brackets in their names
            const isDataObject = attributeNode.includes(',') || attributeNode.includes('[');
            
            // Strip "read-" or "write-" prefix from data object IDs when looking up relationships
            const lookupId = isDataObject 
              ? attributeNode.replace(/^(read-|write-)/, '') 
              : attributeNode;
            
            if (isDataObject) {
              const relationships = getDataObjectRelationships(lookupId);
              const hasAnyData = relationships.instanceOf.length > 0 || 
                                 relationships.associatedGate.length > 0 || 
                                 relationships.associatedCapability.length > 0 || 
                                 relationships.usesService.length > 0 || 
                                 relationships.usesTool.length > 0;
              
              if (!hasAnyData) {
                return (
                  <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>
                    No attributes found for this data object.
                  </div>
                );
              }
              
              return (
                <>
                  {relationships.instanceOf.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Instance Of:
                      </div>
                      {relationships.instanceOf.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {relationships.associatedGate.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Associated Gate:
                      </div>
                      {relationships.associatedGate.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {relationships.associatedCapability.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Associated Capability:
                      </div>
                      {relationships.associatedCapability.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {relationships.usesService.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Uses Service:
                      </div>
                      {relationships.usesService.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {relationships.usesTool.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Uses Tool:
                      </div>
                      {relationships.usesTool.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            } else {
              // Function attributes
              const relationships = getNodeRelationships(lookupId);
              const hasAnyData = relationships.capabilityPillar.length > 0 || 
                                 relationships.associatedGate.length > 0 || 
                                 relationships.toolsUsed.length > 0 || 
                                 relationships.requirements.length > 0;
              
              if (!hasAnyData) {
                return (
                  <div style={{ color: '#888', padding: '20px', textAlign: 'center' }}>
                    No attributes found for this node.
                  </div>
                );
              }
              
              return (
                <>
                  {relationships.capabilityPillar.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Capability Pillar:
                      </div>
                      {relationships.capabilityPillar.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {relationships.associatedGate.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Associated Gate:
                      </div>
                      {relationships.associatedGate.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {relationships.toolsUsed.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Tools Used:
                      </div>
                      {relationships.toolsUsed.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {relationships.requirements.length > 0 && (
                    <div className="relationship-item">
                      <div className="relationship-field" style={{ color: '#61dafb', fontWeight: 'bold', marginBottom: '8px' }}>
                        Requirements:
                      </div>
                      {relationships.requirements.map((item, idx) => (
                        <div key={idx} style={{ marginLeft: '12px', marginBottom: '4px', color: '#e6edf3' }}>
                          • {item}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              );
            }
          })()}
        </div>
      </div>
    </div>
  );
}

export default App;
