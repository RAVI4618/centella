import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import Loader from '../components/Loader';
import SmileViewer from '../components/smileViewer';
import { useAtom } from 'jotai';
import { base_api_url , default_api_headers,post_api_headers} from '../utils/Store.jsx';
 
const Modal = ({ show, onClose, taskDetails }) => {
    if (!show || !taskDetails) return null;
 
    const { parsedRecords } = taskDetails.result;
    const { smiles, title, rmdscore, similarity, mostSimilarCompound, potentialPain } = parsedRecords[0];
 
    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex z-50 justify-center items-center">
            <div className="bg-white p-6 rounded-lg max-w-lg w-full">
                <h2 className="text-xl font-bold mb-4">Task Details</h2>
                <div className='border border-[#3182CE] rounded-sm mb-2'>
                {/* <h3 className="mt-4 font-bold">SMILES Structure:</h3> */}
               
                <SmileViewer smileString={smiles} imgwidth={400} imgheight={300}  />
 
                </div>
             
                <p ><strong>Title:</strong> {title}</p>
                <p><strong>RMD Score:</strong> {rmdscore}</p>
                <p><strong>Similarity:</strong> {similarity}</p>
                <p><strong>Most Similar Compound:</strong> {mostSimilarCompound}</p>
                <p><strong>Potential Pain:</strong> {potentialPain}</p>
 
             
 
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
 
const VirtualScreenStaticResults = () => {
    const [rowData, setRowData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [taskDetails, setTaskDetails] = useState(null);
    const baseurl=useAtom(base_api_url)[0]
    const post_headers=useAtom(post_api_headers)[0]
    const defaultheaders=useAtom(default_api_headers)[0]
    useEffect(() => {
        const fetchTaskIds = async () => {
            try {
                const response = await fetch('https://caitspringclusterapi-dev-virtualscreening-workflow-api.azuremicroservices.io/api/virtual-screening/get-list');
                if (response.ok) {
                    const data = await response.json();
                    console.log('Fetched task IDs:', data);
 
                    const tasks = data.task_ids.map(task_id => ({
                        task_id,
                        status: 'Completed',
                        executed_by: 'testuser1',
                        execution_date: new Date().toLocaleDateString(),
                        execution_Time: '4:02pm',
                        actions: 'View'
                    }));
                    setRowData(tasks);
                } else {
                    console.error('Failed to fetch task IDs');
                    setRowData([]);
                }
            } catch (error) {
                console.error('An error occurred:', error);
                setRowData([]);
            } finally {
                setLoading(false);
            }
        };
 
        fetchTaskIds();
    }, []);
 
    const handleViewClick = async (task_id) => {
        console.log('View button clicked');
        try {
            const response = await fetch(`https://caitspringclusterapi-dev-virtualscreening-workflow-api.azuremicroservices.io/api/virtual-screening/result-by-taskid?task_id=${task_id}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Task details:', data);
                setTaskDetails(data); // Set task details in state
                setShowModal(true); // Show modal
            } else {
                console.error('Failed to fetch task details');
                alert('Failed to fetch task details');
            }
        } catch (error) {
            console.error('An error occurred:', error);
            alert('An error occurred while fetching task details');
        }
    };
 
    const columnDefs = [
        { headerName: 'Task ID', field: 'task_id', sortable: true, filter: true, width: 310,
            cellStyle: { fontWeight: 'bold' }
        },
        {
            headerName: 'Status',
            field: 'status',
            cellStyle: { color: 'green', fontWeight: 'bold' },
            sortable: true,
            filter: true
        },
        { headerName: 'Executed By', field: 'executed_by', sortable: true, filter: true },
        { headerName: 'Execution Date', field: 'execution_date', sortable: true, filter: true },
        { headerName: 'Execution Time', field: 'execution_Time', sortable: true, filter: true },
        {
            headerName: 'Actions',
            cellRenderer: ({ data }) => (
                <button
                    className="text-blue-600 hover:underline focus:outline-none"
                    onClick={() => handleViewClick(data.task_id)}
                >
                    View
                </button>
            ),
            sortable: false,
            filter: false,
        },
    ];
 
    return (
        <div className='p-4'>
        <div className='font-bold text-xl p-2 '>Genereted Task Ids</div>
        <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
            {loading ? (
                <div className='flex items-center justify-center h-full'>
                    <Loader />
                </div>
            ) : (
                <AgGridReact
                    rowData={rowData}
                    columnDefs={columnDefs}
                    pagination={true}
                    paginationPageSize={10}
                />
            )}
 
            {/* Modal for showing task details */}
            <Modal show={showModal} taskDetails={taskDetails} onClose={() => setShowModal(false)} />
        </div>
        </div>
       
    );
};
 
export default VirtualScreenStaticResults;
 
 