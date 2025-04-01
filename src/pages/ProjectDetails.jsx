import React, { useEffect, useState,useMemo } from 'react';
import { useNavigate, useLocation,  } from 'react-router-dom';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { AiOutlineArrowLeft, AiOutlineShareAlt, AiOutlineDownload } from 'react-icons/ai';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import Modal from 'react-modal';
import SmileViewer from '../components/smileViewer';
import { useAtom } from 'jotai';
import { base_api_url, default_api_headers, post_api_headers } from '../utils/Store';
import AdmetResults from '../components/admet/AdmetResultPage';
import RetroSingleTypeResults from '../components/retro/RetroSingleTypeResults';
import RetroResultPage from '../components/retro/RetroResultPage';
import { X } from 'lucide-react';
 
 
const ModalContent = ({ show, onClose, taskDetails }) => {
    if (!show || !taskDetails) return null;
 
    const { parsedRecords } = taskDetails.result || {};
    const hasParsedData = parsedRecords && parsedRecords.length > 0;
 
    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex z-50 justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">Virtual Screening Result</h2>
 
                {hasParsedData ? (
                    <div>
                        <div className="border border-[#3182CE] rounded-sm mb-2">
                            <SmileViewer smileString={parsedRecords[0].smiles} imgwidth={400} imgheight={300} />
                        </div>
                        <p><strong>Title:</strong> {parsedRecords[0].title}</p>
                        <p><strong>RMD Score:</strong> {parsedRecords[0].rmdscore}</p>
                        <p><strong>Similarity:</strong> {parsedRecords[0].similarity}</p>
                        <p><strong>Most Similar Compound:</strong> {parsedRecords[0].mostSimilarCompound}</p>
                        <p><strong>Potential Pain:</strong> {parsedRecords[0].potentialPain}</p>
                    </div>
                ) : (
                    <div>
                       
                        <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-96">{JSON.stringify(taskDetails, null, 2)}</pre>
                    </div>
                )}
 
                <button
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};
 
 
 
 
 
const ProjectDetails = () => {
    const location = useLocation();
    const baseurl = useAtom(base_api_url)[0];
    const defaultheaders = useAtom(default_api_headers)[0];
    const postapi_header = useAtom(post_api_headers)[0]
    const { projectName, projectDescription, id } = location.state || {};
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;
    const navigate = useNavigate();
    const [projectHistory, setProjectHistory] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [currentSmiles, setCurrentSmiles] = useState('');
    const [currentSmilesId, setCurrentSmilesId] = useState('');
    const [buttonDisp, setButtonDisp] = useState('');
    const [admetModalIsOpen, setAdmetModalIsOpen] = useState(false);
    const [admetResultData, setAdmetResultData] = useState(null);
    const [selectedSmiles, setSelectedSmiles] = useState('');
    const [virtualScreeningModalIsOpen, setVirtualScreeningModalIsOpen] = useState(false);
    const [virtualScreeningResultData, setVirtualScreeningResultData] = useState(null);
    const isRetrosynthesisPath = location.pathname.includes('retrosynthesis');
    const [retroResultData,setretroResultData]=useState(null);
    const [retroSingleStepModalIsOpen, setRetroSingleStepModalIsOpen]= useState(false)
    const [retroWorkflowType, setRetroWorkflowType] = useState('');
    const [retroSmileString, setRetroSmileString] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(() => {
        let path = location.pathname.split('/');
        const id = path[3];
        const workflow = path[1];
 
        const pid = workflow === "retrosynthesis" ? 1 : workflow === "admet" ? 2 : workflow === 'generativeai' ? 3 : workflow === 'virtualscreening' ? 4 : 5;
        const buttonLabel = workflow === "retrosynthesis" ? 'Predict Route' : workflow === "admet" ? 'Predict' : workflow === 'generativeai' ? 'Generate Smiles' : workflow === 'virtualscreening' ? 'Screen Targets' : 'Unknown';
 
        setButtonDisp(buttonLabel);
 
        if (username && id && pid) {
            const apiUrl = `${baseurl}/projectManagement-uat/api/projects/get-projects-history?userName=${username}&projectId=${id}&productId=${pid}`;
 
            axios.get(apiUrl, { headers: defaultheaders })
                .then(response => {
                    setProjectHistory(response.data);
                })
                .catch(error => {
                    console.error('Error fetching project history:', error);
                });
        } else {
            navigate('/' + workflow);
        }
    }, [username, location.pathname]);
 
    const handleBack = () => {
        navigate('/' + location.pathname.split('/')[1]);
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
 
    const openAdmetModal = (resultData, smiles) => {
        console.log("Opening ADMET modal with data:", resultData, "and smiles:", smiles); // Debug log
        setAdmetResultData(resultData.result);
        setSelectedSmiles(smiles);
        setAdmetModalIsOpen(true);
    };
 
    const closeAdmetModal = () => {
        setAdmetModalIsOpen(false);
    };
 
 
    const openRetroModal = (predictionResult, smileString) => {
        setretroResultData(predictionResult);
        console.log(predictionResult)
        setSelectedSmiles(smileString);
        setRetroSingleStepModalIsOpen(true); // Open the modal
    };
 
    const getStatus = (resultData) => {
        return resultData ? 'Completed' : 'Pending';
    };
 
 
    const handleViewClick = (smilesOrTaskId,workflowType = '') => {
        const workflow = location.pathname.split('/')[1]; // Extract the workflow from the URL
   
        if (workflow === 'admet') {
            const apiUrl = `${baseurl}/projectManagement-uat/api/projects/project-history/admet/get-result`;
   
            axios.post(apiUrl, { smile: smilesOrTaskId }, { headers: defaultheaders })
                .then(response => {
                    openAdmetModal(response.data, smilesOrTaskId);
                })
                .catch(error => {
                    console.error('Error fetching ADMET result:', error);
                });
        } else if (workflow === 'generativeai') {
            navigate(`/projects/generativeai/results`);
        } else if (workflow === 'virtualscreening') {
            const apiUrl = `https://caitspringclusterapi-dev-virtualscreening-workflow-api.azuremicroservices.io/api/virtual-screening/result-by-taskid?task_id=${smilesOrTaskId}`;
   
            axios.get(apiUrl, { headers: defaultheaders })
                .then(response => {
                    openVirtualScreeningModal(response.data);
                })
                .catch(error => {
                    console.error('Error fetching Virtual Screening result:', error);
                });
        } else if (workflow === 'retrosynthesis') {
            setIsLoading(true);
            setError(null);
            setRetroWorkflowType(workflowType);
       
            const apiUrl = `${baseurl}/projectManagement-uat/api/projects/project-history/retro/single-step`;
            const requestBody = {
                projectId: id,
                inputStringOrFileName: smilesOrTaskId,
                workflow: workflowType || 'Single-step Retrosynthesis'
            };
       
            axios.post(apiUrl, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    ...postapi_header
                }
            })
            .then(response => {
                setIsLoading(false);
                openRetroModal(response.data, smilesOrTaskId);
            })
            .catch(error => {
                setIsLoading(false);
                setError('Error fetching retrosynthesis result');
                console.error('Error fetching retrosynthesis result:', error);
            });
        }
    };
 
    const handleCloseRetroModal = () => {
        setRetroSingleStepModalIsOpen(false);
       
        setRetroSmileString('');
    };
   
   
    const openVirtualScreeningModal = (resultData) => {
        if (!resultData) {
            console.error('No result data available for Virtual Screening');
            return;
        }
       
        // Set the data to display in the modal, or show the raw JSON if detailed data isn't available
        setVirtualScreeningResultData(resultData);
        setVirtualScreeningModalIsOpen(true);
    };
   
 
    // const openVirtualScreeningModal = (resultData) => {
    //     setVirtualScreeningResultData(resultData);
    //     setVirtualScreeningModalIsOpen(true);
    // };
 
    const closeVirtualScreeningModal = () => {
        setVirtualScreeningModalIsOpen(false);
    };
    const columnDefs = [
        {
            headerName: 'SMILES',
            field: 'inputStringOrFileName',
            sortable: true,
            filter: true,
            width: isRetrosynthesisPath ? 200 : 370, // Conditional width
        },
        {
            headerName: 'Executed By',
            field: 'executedBy',
            sortable: false,
            filter: false,
            width: isRetrosynthesisPath ? 150 : 200, // Conditional width
        },
        isRetrosynthesisPath && {
            headerName: 'Type of Execution',
            field: 'workflow',
            sortable: false,
            filter: false,
            width: 200,
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
            field: 'resultData',
            sortable: true,
            filter: true,
            valueFormatter: ({ value }) => getStatus(value),
            cellStyle: ({ value }) => ({
                color: getStatus(value) === 'Completed' ? 'green' : 'red',
            }),
        },
        {
            headerName: 'Actions',
            cellRenderer: ({ data }) => (
                <button
                    className="text-blue-600 hover:underline focus:outline-none"
                    onClick={() => handleViewClick(data.inputStringOrFileName, data.workflow)}
                >
                    View
                </button>
            ),
            sortable: false,
            filter: false,
        },
    ].filter(Boolean);
   
 
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: true,
        unSortIcon: true,
    }), []);
 
 
    return (
        <AuthenticatedTemplate>
            <div className='p-3'>
                <div className="flex items-center">
                    <button onClick={handleBack} className="flex items-center text-black hover:text-gray-800 focus:outline-none">
                        <AiOutlineArrowLeft className="text-xl mr-2" />
                        Back
                    </button>
                </div>
                <div className="flex items-center justify-between">
                    <span className='text-base font-bold text-left'>{projectName}</span>
                    <div className="flex flex-col items-center space-y-2">
                        <button className="flex items-center  font-medium text-white mb-2 rounded-md px-4 py-2   bg-[#735AA7] hover:bg-[#8A7DB8] active:bg-[#8A7DB8] focus:outline-none focus:ring focus:ring-violet-300" onClick={() => navigate(`${location.pathname}/${buttonDisp.replace(' ', '')}`)}>
                            <span className="">{buttonDisp}</span>
                        </button>
                       
                    </div>
                </div>
                <p className="mt-3">{projectDescription}</p>
                <div className="mt-8">
                    {projectHistory.length > 0 && (
                        <>
                            <span className='text-lg font-medium'>Project History</span>
                            <div
                                className="ag-theme-alpine mt-2"
                                style={{
                                    height: '50vh',
                                   
                                }}
                            >
                                <AgGridReact
                                    rowData={projectHistory}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={10}
                                    suppressHorizontalScroll={false}  // Ensures horizontal scrollbar is shown when needed
                                    alwaysShowVerticalScroll={true}   // Always shows vertical scrollbar
                                />
                            </div>
                        </>
                    )}
                    {projectHistory.length === 0 && (
                        <div className="text-center text-gray-500">
                            <p>Start working on the project to see your actions logged here.</p>
                        </div>
                    )}
                </div>
 
 
                <Modal
                    isOpen={modalIsOpen}
                    onRequestClose={closeModal}
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-1/2 h-1/2 overflow-auto"
                    overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                >
                    <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none" onClick={closeModal}>
                        X
                    </button>
                    <div className="flex justify-center items-center h-full">
                        <SmileViewer smiles={currentSmiles} smilesId={currentSmilesId} />
                    </div>
                </Modal>
 
                <Modal
                    isOpen={admetModalIsOpen}
                    onRequestClose={closeAdmetModal}
                    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-3/4 h-3/4 overflow-auto"
                    overlayClassName="fixed inset-0  bg-opacity-50 flex justify-center items-center backdrop-blur-sm "
                >
                    <button className="absolute top-2 right-2 text-white hover:text-gray-700 focus:outline-none" onClick={closeAdmetModal}>
                    <X classname='h-6 w-6'/>
                    </button>
                    {admetResultData && (
                        <AdmetResults
                            predictionResult={admetResultData} smileString={selectedSmiles} />
                    )}
                </Modal>
 
                <ModalContent show={virtualScreeningModalIsOpen} taskDetails={virtualScreeningResultData} onClose={() => setVirtualScreeningModalIsOpen(false)} />
         
                <Modal
    isOpen={retroSingleStepModalIsOpen}
    onRequestClose={() => setRetroSingleStepModalIsOpen(false)}
    className="fixed inset-0 z-[1000] bg-white p-6 overflow-auto" // Fullscreen coverage with high z-index
    overlayClassName="fixed inset-0 z-[999] bg-black bg-opacity-60 backdrop-blur-sm" // Fullscreen overlay
>
    <button
        className="absolute top-8 right-12   px-2 py-1  rounded-md bg-red-400  text-white hover:text-gray-700 focus:outline-none text-xl"
        onClick={() => setRetroSingleStepModalIsOpen(false)}
    >
        <X  className='h-6 w-6'/>
    </button>
 
    {retroResultData && (
        retroWorkflowType === 'Single-step Retrosynthesis' ? (
            <RetroSingleTypeResults
                predictionResult={retroResultData}
                smileString={selectedSmiles}
            />
        ) : (
            <RetroResultPage
                predictionResult={retroResultData}
                smileString={selectedSmiles}
            />
        )
    )}
</Modal>
 
 
 
 
            </div>
        </AuthenticatedTemplate>
    );
};
 
export default ProjectDetails
 
 
 