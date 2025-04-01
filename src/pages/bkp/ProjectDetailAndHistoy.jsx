import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { AiOutlineArrowLeft, AiOutlineShareAlt, AiOutlineDownload } from 'react-icons/ai';
import axios from 'axios';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Modal from 'react-modal';
import SmileViewer from '../../components/smileViewer'; // Adjust the path as per your file structure

const ProjectDetailsAndHistory = () => {
    const location = useLocation();
    const { projectName, projectDescription,id } = location.state || {};
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;
    const navigate = useNavigate();
    const [projectHistory, setProjectHistory] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentSmiles, setCurrentSmiles] = useState('');
    const [currentSmilesId, setCurrentSmilesId] = useState('');

    useEffect(() => {
        if (username) {
            axios.get(`https://caitapimus.azure-api.net/projectManagement/api/projects/get-projects-history?userName=${username}&projectId=${id}&productId=1`, {
                headers: {
                    'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82'
                }
            })
                .then(response => {
                    console.log('API response:', response.data); // Log API response
                    setProjectHistory(response.data);
                })
                .catch(error => {
                    console.error('Error fetching project history:', error);
                });
        }
    }, [username]);

    const handleBack = () => {
        navigate('/RetroProjects'); // Navigate back to projects (ADME or Retro section)
    };

    const handlePredictClick = (projectId) => {
        if (location.pathname.startsWith('/Retroprojects')) {
            navigate(`/Retroprojects/projectroute/${projectId}`);
        } else {
            navigate(`/projects/projectroute/${projectId}`);
        }
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return isNaN(date) ? 'N/A' : date.toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'N/A';
        }
    };

    const formatTime = (dateString) => {
        try {
            const date = new Date(dateString);
            return isNaN(date) ? 'N/A' : date.toLocaleTimeString();
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'N/A';
        }
    };

    const openModal = (smilesString, id) => {
        setCurrentSmiles(smilesString || 'N/A');
        setCurrentSmilesId(id);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const getStatus = (result) => {
        return result ? 'Ready' : 'Pending';
    };

    const handleSmilesClick = (smilesString) => {
        navigate('/Retro/history-results', { state: { smile: smilesString } });
    };

    // Ag-Grid column definitions
    const columnDefs = [
        {
            headerName: 'SMILES',
            field: 'inputStringOrFileName',
            sortable: true,
            filter: true,
            width: 370,
            cellRenderer: ({ value }) => (
                <button
                    className="text-blue-600 hover:underline focus:outline-none"
                    onClick={() => handleSmilesClick(value)}
                >
                    {value ? value : 'N/A'}
                </button>
            ),
        },
        {
            headerName: 'Structure',
            cellRenderer: ({ data }) => (
                <button
                    className="text-blue-600 hover:underline focus:outline-none"
                    onClick={() => openModal(data.inputStringOrFileName, `smiles-canvas-${data.id}`)}
                >
                    View
                </button>
            ),
            sortable: false,
            filter: false,
            width: 200, // Adjust width as needed
        },
        {
            headerName: 'Execution Date',
            field: 'executedDate',
            sortable: true,
            filter: true,
            valueFormatter: ({ value }) => formatDate(value),
        },
        {
            headerName: 'Execution Time',
            field: 'executedDate',
            sortable: true,
            filter: true,
            valueFormatter: ({ value }) => formatTime(value),
        },
        {
            headerName: 'Status',
            field: 'projectResults',
            sortable: true,
            filter: true,
            valueFormatter: ({ value }) => getStatus(value),
            cellStyle: ({ value }) => {
                return {
                    color: getStatus(value) === 'Ready' ? 'green' : 'red'
                };
            }
        },
        {
            headerName: 'Actions',
            cellRenderer: ({ data }) => (
                <button
                    className="text-blue-600 hover:underline focus:outline-none"
                    onClick={() => handlePredictClick(data.id)}
                >
                    Predict
                </button>
            ),
            sortable: false,
            filter: false,
        },
    ];

    return (
        <AuthenticatedTemplate>
            <div className='p-3'>
                <div className="flex items-center ">
                    <button onClick={handleBack} className="flex items-center text-black hover:text-gray-800 focus:outline-none">
                        <AiOutlineArrowLeft className="text-xl mr-2" />
                        Back
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <span className=' text-base font-bold text-left'> {projectName}</span>
                    <div className="flex flex-col items-center space-y-2">
                        <button className="flex items-center bg-[#735DA8]  font-medium text-white mb-2 pl-2 rounded-[7px] h-[40px] w-[85px]" onClick={() => navigate('/Retroprojects/projectroute/:id')}>
                            <span className="ml-2">Predict</span>
                        </button>
                        <button className="flex items-center text-black hover:text-gray-800 focus:outline-none">
                            <AiOutlineDownload className="text-xl" />
                            <AiOutlineShareAlt className="text-xl" />
                        </button>
                    </div>
                </div>
                <p className="mt-3">
                    {projectDescription}
                </p>

                <div className="mt-8 ">
                    <div className="ag-theme-alpine" style={{ height: '50vh', }}>
                        <AgGridReact
                            rowData={projectHistory}
                            columnDefs={columnDefs}
                            pagination={true}
                            paginationPageSize={10}
                        />
                    </div>
                </div>

                {/* Modal for SMILES structure */}
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="fixed inset-2 flex items-center justify-center z-50 p-4 rounded-lg shadow-xl"
                    overlayClassName="fixed inset-0  bg-opacity-50 backdrop-blur-sm z-40"
                    contentLabel="SMILES Structure Modal"
                >
                    <div className="relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                        >
                            &times;
                        </button>
                        <div className="flex flex-col items-center justify-center">
                            <SmileViewer
                                smileString={currentSmiles}
                                id={currentSmilesId}
                            />
                        </div>
                    </div>
                </Modal>
            </div>
        </AuthenticatedTemplate>
    );
};

export default ProjectDetailsAndHistory;
