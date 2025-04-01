import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handle, Position } from '@xyflow/react';
import { BsThreeDots } from "react-icons/bs";
import { BsCopy } from 'react-icons/bs';
import { FiShoppingCart, FiInfo } from 'react-icons/fi';
import { toast } from 'sonner';
import SmilesDrawer from 'smiles-drawer';
import axios from 'axios';
import SmileToStructure from '../SmileToName';
import SmileViewer from '../smileViewer';
import SmileToName from '../SmileToName';
import { useAtom } from 'jotai';
import { base_api_url, post_api_headers } from "../../utils/Store";


const RetroBreakdownNode = ({ data }) => {
    const { smile, type, predictionResult } = data;
    const navigate = useNavigate();
    const smilesRef = useRef(null);
    const [showPopup, setShowPopup] = useState(false);
    const [properties, setProperties] = useState(null);
    const [copyCount, setCopyCount] = useState(0);
    const [smileName, setSmileName] = useState('');
    const [loading, setLoading] = useState(true);
    const popupRef = useRef(null);
    const [visibleProperties, setVisibleProperties] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const tableRef = useRef(null);
    const baseurl = useAtom(base_api_url)[0];
    const postapi_header = useAtom(post_api_headers)[0];


    useEffect(() => {
        console.log("Data", data);

        if (properties) {
            const entries = Object.entries(properties);
            setVisibleProperties(entries.slice(0, 4));
            setHasMore(entries.length > 4);
        }
    }, [properties]);




    useEffect(() => {
        if (smilesRef.current) {
            smilesRef.current.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.width = 150;
            canvas.height = 100;
            smilesRef.current.appendChild(canvas);

            const options = { width: 150, height: 100 };
            const smilesDrawer = new SmilesDrawer.Drawer(options);

            SmilesDrawer.parse(smile, (tree) => {
                smilesDrawer.draw(tree, canvas, 'light', false);
            }, (err) => {
                console.error('Error parsing SMILES string:', err);
            });
        }
    }, [smile]);

    // Close popup when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                setShowPopup(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCopyClick = () => {
        const newCopyCount = copyCount + 1;
        setCopyCount(newCopyCount);
        const label = `1${String.fromCharCode(96 + newCopyCount)}`;
        navigator.clipboard.writeText(smile);
        toast.success(`smileString Copied to clipboard`, { position: 'top-right' });
    };

    const handleInfoClick = async () => {
        try {
            const response = await fetch(baseurl + 'retro/molecular-descriptors', {
                method: 'POST',
                headers: postapi_header,
                body: JSON.stringify({ smile: smile })
            });
 
            // Log the response details for debugging
            console.log('Response status:', response.status);
            const responseData = await response.json();
            console.log('Response data:', responseData);
 
            if (!response.ok) {
                // Log more details about the error
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(responseData)}`);
            }
 
            // If we get here, call the handler with the response data
            data.onPropertiesOpen(smile, responseData);
 
        } catch (error) {
            console.error('Error details:', error);
            toast.error(`Failed to fetch properties: ${error.message}`);
        }
    };
 


    const handleCartClick = () => {
        navigate('/retrosynthesis/vendor', { state: { smile } });
    };

    return (
        <div className="flex flex-col items-center">
            <Handle type="target" position={Position.Right} />

            <div className="flex flex-row items-center">
                {type === "mol" && (
                    <div className='border-[#89AF3E] rounded-md border-2 bg-white w-[280px] cursor-pointer'>
                        <div className='flex justify-center text-xl font-bold'>
                            <SmileViewer smileString={smile} imgwidth={170} imgheight={170} />

                        </div>
                        <span className='mx-2 break-all px-4 text-center '><SmileToName smileString={smile} /></span>
                        <div className='py-3 px-2 flex flex-row items-center justify-center'>
                            {/* <div className="relative group">
                            <Repeat
                                    size={18}
                                    className='text-gray-600 cursor-pointer'
                                    onClick={handleRepeatClick}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                                    <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                                        Re-predict smile
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                            <div className="border-solid border-t-gray-800 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
                                        </div>
                                    </div>
                                </div>
                            </div> */}
 
                            <div className="relative group">
                                <BsCopy
                                    size={18}
                                    className='ml-2 text-dark cursor-pointer'
                                    onClick={handleCopyClick}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                                    <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                                        Copy SMILES 
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                            <div className="border-solid border-t-gray-800 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            <div className="relative group">
                                <FiShoppingCart
                                    size={18}
                                    className='text-dark mx-2 cursor-pointer'
                                    onClick={handleCartClick}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                                    <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                                        View Vendors
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                            <div className="border-solid border-t-gray-800 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            <div className="relative group">
                                <FiInfo
                                    size={18}
                                    className='text-dark mx-2 cursor-pointer'
                                    onClick={handleInfoClick}
                                />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
                                    <div className="bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
                                        View Molecular Descriptors
                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                            <div className="border-solid border-t-gray-800 border-t-8 border-x-transparent border-x-8 border-b-0"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
 
                    </div>
                )}

                {type === 'reaction' && (
                    <div className='relative px-4 py-2 rounded-full border-2 border-[#735DA8] w-[180px] bg-[#735DA8]'>
                        <div className="flex justify-between items-center">
                            <div className='text-white text-xl items-center relative left-2 p-2 font-normal' onClick={() => data.onReactionOpen(data)}>Reaction</div>
                            <div className="relative">
                                <BsThreeDots
                                    size={40}
                                    className="text-black cursor-pointer bg-white border-4 border-white relative left-3 rounded-full shadow-md p-[3px]"
                                    onClick={() => data.onReactionOpen(data)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {properties && showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-4 w-[700px]">
                        <h2 className="text-lg font-bold mb-2">Molecular Properties</h2>

                        {/* Fixed header */}
                        <div className="border rounded-lg">
                            <table className="w-full">
                                <thead>
                                    <tr>
                                        <th colSpan={2} className="text-center pointer-events-none p-2 bg-gray-50 border-b">
                                            {smileName}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th className="text-left p-2 w-1/2 bg-gray-50 border-b">Key</th>
                                        <th className="text-left p-2 w-1/2 bg-gray-50 border-b">Value</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Scrollable content */}
                        <div
                            className="max-h-[200px] overflow-y-auto  overflow-x-hidden border-x border-b rounded-b-lg"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#CBD5E0 #EDF2F7'
                            }}
                        >
                            <table className="w-full">
                                <tbody>
                                    {Object.entries(properties).map(([key, value], index) => (
                                        <tr key={index}>
                                            <td className="border-b p-2 w-1/2">{key}</td>
                                            <td className="border-b p-2 w-1/2">
                                                {typeof value === 'object' ? JSON.stringify(value) : value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-150"
                            onClick={() => setShowPopup(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
            <Handle type="source" position={Position.Left} id="a" />
        </div>
    );
};

export default RetroBreakdownNode;


