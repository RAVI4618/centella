import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ReactFlow, Background, Controls, applyNodeChanges, applyEdgeChanges,
  useReactFlow, ReactFlowProvider, Panel, MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import RetroBreakdownNode from './RetroBreakdownNode';
import Loader from "../Loader";
import Dagre from '@dagrejs/dagre';
import { TiFlowMerge } from "react-icons/ti";
import { LuExpand } from 'react-icons/lu';
import { MdClose } from 'react-icons/md';
import Modal from './FullScreenPopup';
import { X , Hourglass} from 'lucide-react';
import { CircleCheck, Gauge, Info, ShoppingCart, Copy, Maximize, HelpCircle, CircleChevronRight, SquarePlus, ClipboardList, Thermometer, Droplet, Percent } from 'lucide-react';
import SmileViewer from '../smileViewer';
import { base_api_url, default_api_headers, post_api_headers } from '../../utils/Store';
import { useAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
const initialNodes = [];
const initialEdges = [];
const nodeTypes = { retroBreakdownNode: RetroBreakdownNode };
 
 
const getLayoutedElements = (nodes, edges, options) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
 
  g.setGraph({ rankdir: options.direction });
 
  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 330,
      height: node.measured?.height ?? 290,
    })
  );
 
  Dagre.layout(g);
 
  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      const x = position.x - (node.measured?.width ?? 290) / 2;
      const y = position.y - (node.measured?.height ?? 290) / 2;
      return { ...node, position: { x, y } };
    }),
    edges,
  };
};
 
const RetroBreakDownComponents = ({ route, predictionResult, onClose, smileString }) => {
 
  const { zoomTo, fitView } = useReactFlow();
 
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [yieldValue, setYieldValue] = useState(0);
  const [reactionDetails, setReactionDetails] = useState(null)
  const [selectedReactants, setSelectedReactants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canApplyLayout, setCanApplyLayout] = useState(false);
  const [isDetailsPopupVisible, setIsDetailsPopupVisible] = useState(false);
  const [holdEdges, setHoldEdges] = useState(false);
  const buttonRef = useRef(null);
 const [isFullScreen,setIsFullScreen] = useState(false)
  const baseUrl = useAtom(base_api_url)[0];
  const defaultHeaders = useAtom(default_api_headers)[0];
  const postHeaders = useAtom(post_api_headers)[0];
  const [isPropertiesPopupVisible, setIsPropertiesPopupVisible] = useState(false);
  const [selectedMoleculeProperties, setSelectedMoleculeProperties] = useState(null);
  const [selectedSmile, setSelectedSmile] = useState('');
  const [loadingConditions, setLoadingConditions] = useState(true)
  console.log("set hold edges", holdEdges);
 
  const location = useLocation()
 
  const isRetroRoute = () => {
    return location.pathname.match(/^\/retrosynthesis\/projectdetail\/\d+\/PredictRoute$/);
  };
 
  const handleViewDetails = () => {
    setIsDetailsPopupVisible(true);
  };
 
  const handleYieldDetails = async (data) => {
    setLoadingConditions(true)
    let sequence = "";
    const children = data.children;
    const parent = data.parent;
 
    setSelectedReactants(children.map((child) => child.data.smile));
 
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      sequence += `${child.data.smile}`;
      if (i < children.length - 1) {
        sequence += ".";
      }
    }
 
    sequence = `${sequence}>>${parent.data.smile}`;
 
    const response = await fetch(`${baseUrl}/retro/reaction-details`, {
      method: "POST",
      headers: postHeaders,
      body: JSON.stringify({ sequence }),
    });
 
    const result = await response.json();
 
    if (result.reactionConditions) {
      const reactionKey = Object.keys(result.reactionConditions)[0];
      setReactionDetails(result.reactionConditions[reactionKey]); // Set only the relevant details
      setYieldValue(result.yield[reactionKey]); // Set the yield value corresponding to the key
    }
    setLoadingConditions(false)
  };
 
 
  // const handleYieldDetails = async (data) => {
 
  //   let sequence = ""
  //   const children = data.children;
  //   const parent = data.parent;
 
  //   for (let i = 0; i < children.length; i++) {
  //     const child = children[i];
  //     sequence += `${child.data.smile}`;
  //     if (i < children.length - 1) {
  //       sequence += ".";
  //     }
  //   }
 
  //   sequence = `${sequence}>>${parent.data.smile}`;
 
  //   const response = await fetch(`${baseUrl}/retro/reaction-details`, {
  //     method: 'POST',
  //     headers: postHeaders,
  //     body: JSON.stringify({ sequence })
  //   });
 
  //   const result = await response.json();
  //   if (result.yield) {
  //     setYieldValue(result.yield);
  //   }
  // }
 
  const closeDetailsPopup = () => {
    setIsDetailsPopupVisible(false);
  };
 
 
  const onNodesChange = useCallback(
    (changes) => {
      if (!holdEdges) {
        console.log('nodes change', changes);
        console.log('set hold edges', holdEdges);
        return setNodes((nds) => applyNodeChanges(changes, nds))
      }
    },
    [holdEdges]
  );
  const onEdgesChange = useCallback(
    (changes) => {
      if (!holdEdges) {
        return setEdges((eds) => applyEdgeChanges(changes, eds))
      }
    },
    [holdEdges]
  );
 
  const onLayout = useCallback(
    (direction) => {
      console.log('layouting with direction', direction);
 
      const layouted = getLayoutedElements(nodes, edges, { direction });
      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);
 
      window.requestAnimationFrame(() => {
        fitView({ padding: 0.1, zoom: 1 }); // Add zoom level
      });
      setCanApplyLayout(false);
      setHoldEdges(true);
      console.log('set hold edges', holdEdges);
    },
    [nodes, edges, fitView]
  );
 
  const processNode = (route, id, x, y, accumulatedNodes, accumulatedEdges, parent = null) => {
    const node = {
      id,
      data: {
        smile: route.smiles,
        type: route.type,
        isReaction: route.is_reaction,
        predictionResult: predictionResult,
        onReactionOpen: (data) => {
          handleViewDetails();
          handleYieldDetails(data);
        },
        onPropertiesOpen: handlePropertiesView,
        parent: parent,
        children: [],
      },
      type: 'retroBreakdownNode',
      position: { x, y },
    };
 
    accumulatedNodes.push(node);
 
    if (route.children) {
      route.children.forEach((child, index) => {
        const childId = `${id}-${index + 1}`;
        const edge = {
          id: `e${id}-${childId}`,
          source: id,
          target: childId,
          style: { stroke: '#735DA8', strokeWidth: 2 },
          type: 'step',
          color: child.is_reaction ? '#735DA8' : '#000',
          markerStart: child.is_reaction
            ? { type: MarkerType.ArrowClosed, fill: '#735DA8', color: '#735DA8' }
            : undefined,
        };
 
        accumulatedEdges.push(edge);
 
        const childX = x + 280 * index;
        const childY = y + 280 * index;
 
        const childNode = processNode(child, childId, childX, childY + 250, accumulatedNodes, accumulatedEdges, node);
 
        node.data.children.push(childNode);
      });
    }
 
    return node;
  };
 
  useEffect(() => {
    if (route) {
      const accumulatedNodes = [];
      const accumulatedEdges = [];
      processNode(route, '1', 0, 0, accumulatedNodes, accumulatedEdges);
      setNodes(accumulatedNodes);
      setEdges(accumulatedEdges);
      setCanApplyLayout(true);
    }
  }, [route]);
 
 
  useEffect(() => {
    if (canApplyLayout && nodes.length > 0 && edges.length > 0) {
      // after timer of 1 second, apply layout
      setTimeout(() => {
        if (buttonRef.current) {
          buttonRef.current.click();
        }
      }, 1000);
    }
  }, [canApplyLayout, nodes, edges, onLayout]);
 
  const handlePropertiesView = async (smile, properties) => {
    setSelectedSmile(smile);
    setSelectedMoleculeProperties(properties);
    setIsPropertiesPopupVisible(true);
  };
 
  if (route) {
 
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {!isModalOpen &&
          <div className='flex justify-center items-center h-full'>
            <ReactFlow
              nodes={nodes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              className='w-full h-full'
            >
              <Background bgColor='#ffffff' />
              <Controls />
              <Panel position="top-right">
                <div className='flex flex-row'>
                  <button
                    ref={buttonRef}
                    onClick={() => onLayout('RL')}
                    className="flex items-center bg-[#735DA8] font-medium text-white mb-2 rounded-md px-4 py-2 text-s"
                  >                                    <TiFlowMerge className='text-xl mr-2' />
                    Format Layout
                  </button>
                  {isRetroRoute() && (
                  <button
                    onClick={() => setIsModalOpen(!isModalOpen)}
                    className="flex items-center bg-[#735DA8] font-medium text-white mb-2 ml-2 rounded-md px-4 py-2 text-s"
                  >
                    <LuExpand className="text-xl" />
                  </button>
                )}
                </div>
 
              </Panel>
            </ReactFlow>
 
       
 
            {isDetailsPopupVisible && (
          <div className="fixed right-2 top-2  border-2  border-[#00000029] rounded-lg h-full bg-white shadow-sm p-6 overflow-y-auto transition-transform transform translate-x-0"
          style={{ width: '400px', height: '98.5vh', zIndex: 50 }}>
            {/* Header Section */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-bold flex items-center space-x-2">Reactant Details</h2>
                                            <button
                                                onClick={()=>closeDetailsPopup()}
                                                className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                                            >
                                                <X className='h-5 w-5 text-red-500' />
                                            </button>
                                        </div>
 
                                       
<div className='p-4 overflow-y-auto' style={{ maxHeight: 'calc(100% - 60px)' }}>
  {/* Render Reactants Images */}
  <div className="flex flex-row space-x-4 items-center">
    <div className='border-2 border-blue-500 p-4 rounded-lg flex flex-col items-center'>
      <div className="flex items-center space-x-12 mb-2">
      {selectedReactants.map((smile, index) => (
               <div key={index} >
                 <SmileViewer smileString={smile} imgheight={120} imgwidth={120} />
                 <p className='text-xs mt-1 text-center font-medium text-gray-600'>Reactant {index + 1}</p>
               </div>
             ))}
       
      </div>
 
      {/* Yield Information */}
      <div className="flex justify-center gap-6 mt-4">
      <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
       
      <Gauge className="w-4 h-4 text-blue-500 mr-2" />
        <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">Yield</span>
            {loadingConditions ? ( // Show loader while loading
                <span className="animate-spin">Loading...</span>
            ) : (
                <span className="text-lg font-bold text-blue-700">{yieldValue}%</span>
            )}
        </div>
</div>
 
      </div>
    </div>
  </div>
 
  {/* Reaction Details Section */}
  <div className="bg-white rounded-xl mt-4 border border-gray-200 divide-y divide-gray-100">
 
          <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <CircleCheck className="w-4 h-4 mr-2 text-[#735AA7]" />
            Reagents
          </h3>
        </div>
        <div className="rounded-lg overflow-hidden border border-gray-100">
  {reactionDetails && (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-[#735AA7]" />
          <span className="text-gray-600">Temperature</span>
        </div>
        <span className="font-medium text-gray-800">
          {reactionDetails.Temperature}°C
        </span>
      </div>
      <div className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center space-x-2">
          <Droplet className="w-4 h-4 text-[#735AA7]" />
          <span className="text-gray-600">Solvent</span>
        </div>
        <span className="font-medium text-gray-800">
          {reactionDetails["Solvent(s)"]}
        </span>
      </div>
      <div className="flex items-center justify-between p-4 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Percent className="w-4 h-4 text-[#735AA7]" />
          <span className="text-gray-600">Probability</span>
        </div>
        <span className="font-medium text-gray-800">
          {reactionDetails.Probability}%
        </span>
      </div>
    </>
  )}
</div>
 
 
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <ClipboardList className="w-4 h-4 mr-2 text-[#735AA7]" />
        Experimental Procedure
      </h3>
      <div className="text-sm text-gray-500 italic ml-6">
        Currently Under Development
      </div>
    </div>
  </div>
</div>
 
          </div>
        )}
          </div>
        }
                   {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ReactFlow
              nodes={nodes}
              onNodesChange={onNodesChange}
              edges={edges}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              // style={{ height: '100vh', width: '100vw' }} // Set full screen dimensions
 
            >
              <Background bgColor="#ffffff" />
              <Controls />
              <Panel position="top-right">
                <div className="flex flex-row">
                  <button
                    onClick={() => onLayout('RL')}
                    className="flex items-center bg-[#735DA8] font-medium text-white mb-2 rounded-md px-4 py-2 text-s"
                  >
                    <TiFlowMerge className="text-xl mr-2" />
                    Format Layout
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex items-center bg-red-400 font-medium text-white mb-2 ml-2 rounded-md px-4 py-2 text-s"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>
              </Panel>
            </ReactFlow>
          </Modal>
        )}
         {isDetailsPopupVisible && (
          <div className="fixed right-2 top-2  border-2  border-[#00000029] rounded-lg h-full bg-white shadow-sm p-6 overflow-y-auto transition-transform transform translate-x-0"
          style={{ width: '400px', height: '98.5vh', zIndex: 50 }}>
            {/* Header Section */}
                                        <div className="flex items-center justify-between mb-4">
                                            <h2 className="text-lg font-bold flex items-center space-x-2">Reactant Details</h2>
                                            <button
                                                onClick={()=>closeDetailsPopup()}
                                                className="p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                                            >
                                                <X className='h-5 w-5 text-red-500' />
                                            </button>
                                        </div>
 
                                       
<div className='p-4 overflow-y-auto' style={{ maxHeight: 'calc(100% - 60px)' }}>
  {/* Render Reactants Images */}
  <div className="flex flex-row space-x-4 items-center">
    <div className='border-2 border-blue-500 p-4 rounded-lg flex flex-col items-center'>
      <div className="flex items-center space-x-12 mb-2">
      {selectedReactants.map((smile, index) => (
               <div key={index} >
                 <SmileViewer smileString={smile} imgheight={120} imgwidth={120} />
                 <p className='text-xs mt-1 text-center font-medium text-gray-600'>Reactant {index + 1}</p>
               </div>
             ))}
       
      </div>
 
      {/* Yield Information */}
      <div className="flex justify-center gap-6 mt-4">
      <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
       
      <Gauge className="w-4 h-4 text-blue-500 mr-2" />
        <div className="flex items-center gap-2">
            <span className="text-xs text-blue-600 font-medium">Yield</span>
            {loadingConditions ? ( // Show loader while loading
                <span className="animate-spin"><Hourglass size={10}/></span>
            ) : (
                <span className="text-lg font-bold text-blue-700">{yieldValue}%</span>
            )}
        </div>
</div>
 
      </div>
    </div>
  </div>
 
  {/* Reaction Details Section */}
  <div className="bg-white rounded-xl mt-4 border border-gray-200 divide-y divide-gray-100">
 
          <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <CircleCheck className="w-4 h-4 mr-2 text-[#735AA7]" />
            Reagents
          </h3>
        </div>
        <div className="rounded-lg overflow-hidden border border-gray-100">
      {loadingConditions ? (
        <div className="flex items-center justify-center p-4">
                <span className="animate-spin"><Hourglass size={20}/></span>
                </div>
      ) : (
        reactionDetails && (
          <>
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-[#735AA7]" />
                <span className="text-gray-600">Temperature</span>
              </div>
              <span className="font-medium text-gray-800">
                {reactionDetails.Temperature}°C
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white">
              <div className="flex items-center space-x-2">
                <Droplet className="w-4 h-4 text-[#735AA7]" />
                <span className="text-gray-600">Solvent</span>
              </div>
              <span className="font-medium text-gray-800">
                {reactionDetails["Solvent(s)"]}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50">
              <div className="flex items-center space-x-2">
                <Percent className="w-4 h-4 text-[#735AA7]" />
                <span className="text-gray-600">Probability</span>
              </div>
              <span className="font-medium text-gray-800">
                {reactionDetails.Probability}%
              </span>
            </div>
          </>
        )
      )}
    </div>
 
 
    <div className="p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <ClipboardList className="w-4 h-4 mr-2 text-[#735AA7]" />
        Experimental Procedure
      </h3>
      <div className="text-sm text-gray-500 italic ml-6">
        Currently Under Development
      </div>
    </div>
  </div>
</div>
 
          </div>
        )}
 
 
        {/* New properties popup */}
        {isPropertiesPopupVisible && (
  <>
    {/* Add a blur overlay */}
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[999]" />
   
    <div className="fixed inset-0 flex items-center justify-center z-[1000]">
      <div className="bg-white rounded-lg w-[60%] max-h-[80%] overflow-auto">
        <div className="relative p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Molecular Descriptors</h2>
            <button
              onClick={() => setIsPropertiesPopupVisible(false)}
              className="absolute top-4 right-5 bg-red-400 text-white hover:text-gray-600 px-2 py-1 rounded-md flex items-center justify-center text-sm"
            >
              <X className='h-6 w-6' />
            </button>
          </div>
 
          {/* Content Container */}
          <div className="border-2 border-gray-300 rounded-lg">
            {/* Molecule Viewer */}
            <div className="flex justify-center items-center mb-4">
              <SmileViewer
                smileString={selectedSmile}
                imgheight={250} // h-48 equals 192px
                imgwidth={300}
              />
            </div>
 
            <hr />
 
            {/* Properties Table */}
            <table className="w-full border-collapse capitalize">
              <tbody>
                {selectedMoleculeProperties ? (
                  (() => {
                    const entries = Object.entries(selectedMoleculeProperties);
                    const half = Math.ceil(entries.length / 2);
                    const leftColumn = entries.slice(0, half);
                    const rightColumn = entries.slice(half);
 
                    return leftColumn.map(([keyLeft, valueLeft], index) => {
                      const [keyRight, valueRight] = rightColumn[index] || [];
 
                      return (
                        <tr key={index} className="border-b text-sm border-gray-200">
                          {/* Left Column */}
                          <td className="py-3 px-4 font-semibold text-gray-700 border-r border-gray-200">
                            {keyLeft}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-900 border-r border-gray-200">
                            {typeof valueLeft === 'number' ? valueLeft.toFixed(3) : valueLeft}
                          </td>
 
                          {/* Right Column */}
                          {keyRight ? (
                            <>
                              <td className="py-3 px-4 font-semibold text-gray-700 border-l border-gray-200">
                                {keyRight}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-900 border-l border-gray-200">
                                {typeof valueRight === 'number' ? valueRight.toFixed(3) : valueRight}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="py-3 px-4 border-l border-gray-200"></td>
                              <td className="py-3 px-4"></td>
                            </>
                          )}
                        </tr>
                      );
                    });
                  })()
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      No properties available for this molecule.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </>
)}
 
      </div >
    )
  } else {
    return (
      <div className='flex justify-center items-center h-full'>
        <Loader />
      </div>
    )
  }
}
 
const RetroBreakDown = ({ route, predictionResult, onClose, smileString }) => {
  console.log("route", route);
  return (
    <ReactFlowProvider>
      <RetroBreakDownComponents route={route} predictionResult={predictionResult} onClose={() => onClose()} smileString={smileString} />
    </ReactFlowProvider>
  )
}
 
export default RetroBreakDown;
 
 
 
 
 