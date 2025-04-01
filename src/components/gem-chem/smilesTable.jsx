import React, { useState, useEffect, useMemo } from 'react';
import { MdDelete } from "react-icons/md";
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import SmileViewer from '../../components/smileViewer';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from '../../components/Loader';
import { useAtom } from 'jotai';
import { base_api_url,  post_api_headers } from "../../utils/Store";
 
const SmilesTable = () => {
    const [showData, setShowData] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [smilesData, setSmilesData] = useState([]);
    const [viewingSmile, setViewingSmile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [smileToDelete, setSmileToDelete] = useState(null);
    const [disableValidateButton, setDisableValidateButton] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isValidationComplete, setIsValidationComplete] = useState(false);
    const apiUrl = useAtom(base_api_url)[0];
    const postapi_header = useAtom(post_api_headers)[0];
    // const post_api_file_header = useAtom(post_api_file_headers)[0]
    const navigate = useNavigate();
    const location = useLocation();
 
    useEffect(() => {
        console.log('Smiles Data:', smilesData);
    }, [smilesData]);
 
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
 
        if (!['application/octet-stream', 'text/plain'].includes(file.type) &&
            !['.smi', '.sdf', '.mol', '.csv'].includes(file.name.slice(-4).toLowerCase())) {
            toast.error('Upload file in SMI, SDF, MOL, or CSV format only.', {
                className: 'mt-16'
           
            });
            return;
        }
 
        setSelectedFile(file);
        setDisableValidateButton(false);
        setIsValidationComplete(false);
        parseFile(file);
    };
 
    const parseFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const contents = e.target.result;
            const smilesArray = contents.split('\n').map(line => line.trim()).filter(line => line);
            const smilesWithStatus = smilesArray.map(smile => ({
                smile,
                status: 'Pending',
                compoundID: 'BN25678245G5'
            }));
            setSmilesData(smilesWithStatus);
            setShowData(true);
        };
        reader.readAsText(file);
    };
 
    const openModal = (index) => {
        setSmileToDelete(index);
        setIsModalOpen(true);
    };
 
    const closeModal = () => {
        setIsModalOpen(false);
        setSmileToDelete(null);
    };
 
    const confirmDelete = () => {
        if (smileToDelete !== null) {
            const updatedSmilesData = smilesData.filter((_, i) => i !== smileToDelete);
            setSmilesData(updatedSmilesData);
            toast.success('Deleted SMILE', {
                className: 'mt-16'
            });
            closeModal();
        }
    };
 
    const handleViewStructure = (smile) => {
        setViewingSmile(smile);
    };
 
    const closeStructureView = () => {
        setViewingSmile(null);
    };
 
    const validateSmiles = async () => {
        if (!selectedFile) {
            toast.error('Please upload a file first.', {
                className: 'mt-16'
            });
            return;
        }
 
        setLoading(true); // Show loader when validation starts
 
        const formData = new FormData();
        formData.append('file', selectedFile);
 
        try {
            const response = await axios.post(apiUrl+`api/smiles/v1/upload_smiles`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
 
            const validationResult = response.data;
            const updatedSmilesData = smilesData.map((smileObj) => {
                const validationResultItem = validationResult.find(item => item.sequence === smileObj.smile);
                return {
                    ...smileObj,
                    status: validationResultItem ? (validationResultItem.result === "Valid" ? 'Valid' : 'Invalid') : 'Invalid',
                };
            });
 
            setSmilesData(updatedSmilesData);
            toast.success('Validation Complete', {
                className: 'mt-16'
            });
            setIsValidationComplete(true);
        } catch (error) {
            console.error('Error validating SMILES:', error);
            toast.error('Error validating SMILES.', {
                className: 'mt-16'
            });
        } finally {
            setLoading(false);
        }
    };
 
    const columnDefs = [
        { headerName: 'S.No', field: 'serial', width: 100 },
        { headerName: 'SMILES', field: 'smile', width: 500 },
        {
            headerName: 'Structure', field: 'structure', width: 220, cellRenderer: (params) => (
                <button onClick={() => handleViewStructure(params.data.smile)} className='text-blue-500 hover:underline focus:outline-none'>
                    View
                </button>
            )
        },
        {
            headerName: 'Status', field: 'status', width: 240, cellStyle: (params) => {
                return { color: params.value === 'Valid' ? 'green' : params.value === 'Invalid' ? 'red' : 'black' };
            }
        },
        {
            headerName: 'Actions', field: 'actions', width:230, cellRenderer: (params) => (
                <span className='mr-2 cursor-pointer' onClick={() => openModal(params.node.rowIndex)}>
                    <MdDelete size={"22px"} />
                </span>
            )
        }
    ];
 
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: false,
    }), []);
 
    const rowData = useMemo(() => smilesData.map((smileObj, index) => ({
        serial: index + 1,
        smile: smileObj.smile,
        structure: 'View',
        status: smileObj.status,
        actions: ''
    })), [smilesData]);
 
    const handleNextClick = () => {
        const validSmiles = smilesData.filter(smile => smile.status === 'Valid').map(smile => smile.smile);
        const path = location.pathname.split('/');
        const projectId = path[path.length - 1];
   
        // Determine next route based on current pathname
        if (location.pathname.includes('/smile&targets/')) {
            // Navigate to targets page
            navigate(`/projects/generativeai/smiles&targets/${projectId}`, {
                state: { validSmiles }
            });
        } else {
            // Navigate to select-molecule page
            navigate(`/projects/generativeai/select-molecule/${projectId}`, {
                state: { validSmiles }
            });
        }
    };

 
   
    return (
        <>
            <div className='flex ml-10 my-5 mr-12 w-full'>
                <div className='w-[65%]'>
                    <input
                        type='text'
                        placeholder='File Name'
                        value={selectedFile ? selectedFile.name : ''}
                        className='pl-5 text-sm py-4 w-full'
                        readOnly
                    />
                </div>
                <div className='w-[13%]'>
                    <label className='w-full'>
                        <input
                            type='file'
                            accept='.smi,.sdf,.mol,.csv'
                            className='hidden'
                            onChange={handleFileChange}
                        />
                        <div className='w-full rounded-r-lg items-center px-5 py-[1px] bg-[#CBD5E0] rounded-sm hover:dark:bg-slate-300 cursor-pointer'>
                            <p className='text-normal font-medium text-gray-900 mr-2 grid-rows-1 p-0 mt-1 relative top-1'>
                                Upload File <br />
                                <span className='text-xs font-medium text-gray-700 mr-2 relative bottom-1'>SMI/SDF/MOL/CSV</span>
                            </p>
                        </div>
                    </label>
                </div>
                <div className='w-[15%] mr-12'>
                    <button
                        className={`flex w-full rounded-md justify-center cursor-pointer items-center px-6 py-[14px] ml-3 ${disableValidateButton ? 'bg-gray-400' : 'bg-[#735AA7]'} text-white rounded-sm hover:dark:bg-slate-600 focus:outline-none`}
                        onClick={validateSmiles}
                        disabled={disableValidateButton}
                    >
                        <span className='font-medium'>Validate Smile</span>
                    </button>
                </div>
            </div>
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-opacity-50 z-50">
                    <Loader />
                </div>
            )}
            {showData && (
                <div className='mt-12 mr-12'>
                    <div className='ml-10 flex sm:flex-row flex-col mt-2'>
                        <div className='ag-theme-alpine w-full' style={{ height: 400 }}>
                            <AgGridReact
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                rowData={rowData}
                                pagination={true}
                                paginationPageSize={10}
                                paginationPageSizeSelector={[10, 25, 50, 100]}
                            />
                        </div>
                    </div>
                    <div className='flex justify-end mt-4'>
                        <button
                            className={`bg-[#89AF3E] text-white px-6 py-2 rounded-md hover:bg-[#76a42b] ${isValidationComplete ? '' : 'opacity-50 cursor-not-allowed'} focus:outline-none`}
                            onClick={handleNextClick}
                            disabled={!isValidationComplete}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
          {viewingSmile && (
                <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50 z-50'>
                    <div className='bg-white p-4 rounded-lg shadow-lg relative'>
                        <button onClick={closeStructureView} className='absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none'>
                            &times;
                        </button>
                        <div className='text-center'>
                            <h2 className='text-xl font-semibold mb-4'>Structure Viewer</h2>
                            <p className='mb-4'>{viewingSmile}</p> {/* Display SMILES string */}
                            {/* Render SmileViewer component */}
                            <SmileViewer smileString={viewingSmile} id='structure-view' imgwidth={400} imgheight={300} />
                            <button onClick={closeStructureView} className='mt-4 px-4 py-2 bg-[#735AA7] text-white rounded-md '>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isModalOpen && (
                <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
                    <div className='bg-white p-8 rounded-lg shadow-lg'>
                        <h2 className='text-lg font-medium mb-4'>Confirm Delete</h2>
                        <p>Are you sure you want to delete this SMILE?</p>
                        <div className='mt-6 flex justify-end'>
                            <button
                                className='bg-gray-400 text-white px-4 py-2 rounded-md mr-4 hover:bg-gray-500 focus:outline-none'
                                onClick={closeModal}
                            >
                                Cancel
                            </button>
                            <button
                                className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none'
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
 
export default SmilesTable;
 
 