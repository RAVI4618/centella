import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AiFillEye, AiFillDelete } from "react-icons/ai";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { toast } from 'sonner';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import CreateProjectPopup from '../components/CreateProjectPopup';
import ActionIcons from '../components/gem-chem/ActionIcons';
import AddCollaboratorsPopup from '../components/AddCollaboratorsPopup.jsx';
import Loader from '../components/Loader.jsx';
import { useAtom } from 'jotai';
import { base_api_url , default_api_headers,post_api_headers} from '../utils/Store.jsx';
 
 
const RetrosynthesisPage = () => {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;
    const location=useLocation();
    const [projectsData, setProjectsData] = useState([]);
    const baseurl=useAtom(base_api_url)[0]
    const post_headers=useAtom(post_api_headers)[0]
    const defaultheaders=useAtom(default_api_headers)[0]
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [showCreateProjectPopup, setShowCreateProjectPopup] = useState(false);
    const [showAddCollaboratorsPopup, setShowAddCollaboratorsPopup] = useState(false); // State to control the Add Collaborators popup
    const [editingProject, setEditingProject] = useState(null);
    const [loading, setLoading] = useState(true);  // New loading state
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [showCollaboratorPopup, setShowCollaboratorPopup] = useState(false);
 
    const navigate = useNavigate();
 
    const handleDelete = (id, projectName) => {
        setProjectToDelete({ id, projectName });
        setIsDeleteModalOpen(true);
    };
 
    const handleCollaboratorClick = (projectId) => {
        setSelectedProjectId(projectId);
        setShowAddCollaboratorsPopup(true);
    };
 
    const confirmDelete = () => {
        if (projectToDelete !== null) {
            const { id, projectName } = projectToDelete;
 
            fetch(`${baseurl}/projectManagement-uat/api/projects?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                setProjectsData(projectsData.filter(project => project.id !== id));
                toast.success(`Deleted project: ${projectName}`,{
                    className:'mt-8'
                });
                setIsDeleteModalOpen(false);
            })
            .catch(error => {
                console.error("There was an error deleting the project!", error);
            });
        }
    };
 
    const handleEditClick = (project) => {
        setEditingProject(project);
        setShowCreateProjectPopup(true);
    };
 
    const handleCloseCreateProject = (newProjectData) => {
        setShowCreateProjectPopup(false);
        if (newProjectData) {
            fetchprojectsList(username); // Refetch the projects list to include the new project
        }
    };
   
 
    const closeModal = () => {
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
    };
 
    useEffect(() => {
        if (username) {
            fetchprojectsList(username)
        }
    }, [username]);
 
   
    const fetchprojectsList = (uname) => {
        setLoading(true);  // Set loading to true before fetching
        fetch(`${baseurl}/projectManagement-uat/api/projects/get-user-projects?userName=${username}&productId=1`, {
            headers: defaultheaders
        })
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch'))
        .then(data => {
            setProjectsData(data);
        })
        .catch(error => {
            console.error("There was an error fetching the projects!", error);
        })
        .finally(() => {
            setLoading(false);  // Set loading to false after fetching
        });
    };
 
    const handleCreateClick = () => {
        setEditingProject(null); // Reset editingProject to null
        setShowCreateProjectPopup(true);
    };
   
 
   const columns = useMemo(
        () => [
            {
                headerName: 'Project Name',
                field: 'projectName',
                cellRenderer: ({ data }) => (
                    <Link
                        to={`/retrosynthesis/projectdetail/${data.id}`}
                        className="text-blue-500 hover:underline"
                    >
                        {data.projectName}
                    </Link>
                ),
                width: 200,
                onCellClicked: ({ data }) => {
                    navigate(`/retrosynthesis/projectdetail/${data.id} `,{ state: { projectName: data.projectName, projectDescription: data.projectDescription, id: data.id } });
                },
            },
            { headerName: 'Project Description', field: 'projectDescription', width: 300 },
            { headerName: 'Project Owner', field: 'createdBy', width: 150 },
            { headerName: 'Date Created', field: 'createdDate', valueFormatter: params => new Date(params.value).toLocaleDateString(), width: 150 },
            { headerName: 'Last Execution', field: 'updatedDate', valueFormatter: params => new Date(params.value).toLocaleDateString(), width: 150 },
            { headerName: 'Status', field: 'projectResult', width: 150, cellClass: params => params.value === "Pending" ? "text-red-500" : params.value === "Ready" ? "text-green-500" : "" },
            {
                headerName: 'Actions',
                field: 'action',
                // width: 140,
                cellRenderer: ({ data }) => (
                    <ActionIcons
                        onCollaboratorClick={() => handleCollaboratorClick(data.id)}
                        onEditClick={() => handleEditClick(data)}
                        onDeleteClick={() => handleDelete(data.id, data.projectName)}
                    />
                ),
                sortable: false,
            },
        ],
        [navigate]
    );
 
    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: false,
    }), []);
    // const autoSizeStrategy = {
    //     type: 'fitGridWidth',
    //     defaultMinWidth: 100,
    //     columnLimits: [
    //         {
    //             colId: 'projectName',
    //             minWidth: 200
    //         }
    //     ]
    // };
    return (
        <div className='p-3'>
            <p className="mt-2 flex flex-row">
  <Link className='font-semibold text-[#3182CE]' to={`/`}>Home</Link>
  <img src="https://cdn-icons-png.flaticon.com/128/8591/8591654.png" height={20} width={20} alt="" className="mt-1" />
 
 
 
</p>
 
            <AuthenticatedTemplate>
                <div className="flex justify-between py-2">
                    <div className="font-bold text-lg">
                        Retrosynthesis
                    </div>
                    <button
                        onClick={handleCreateClick}
                        className="bg-[#735DA8] font-medium text-white mb-2  rounded-[7px] h-[40px] w-[126px]"
                    >
                        <span className="plus">+ </span>Create New
                    </button>
                </div>
                <div className="ag-theme-alpine" style={{ height: '70vh', width: '80vw', overflow: 'hidden' }}>
                    {loading ? (  // Show loader while fetching data
                       <div className='flex items-center justify-center h-full'>
 
                            <Loader />
                       </div>
                       
                    ) : projectsData.length === 0 ? (  // Show message if no projects found
                        <div className='flex items-center justify-center h-full'>
                            <div className="text-center text-gray-500">
                            <p className='text-lg font-segoe font-medium'>Create a project and accelerate your research today!</p>
                            </div>
                        </div>
                    ) : (
                        <AgGridReact
                            rowData={projectsData}
                            columnDefs={columns}
                            defaultColDef={defaultColDef}
                            pagination={true}
                            paginationPageSize={10}
                            paginationPageSizeSelector={[10, 25, 50, 100]}
                        />
                    )}
                </div>
                {isDeleteModalOpen && (
                    <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50 z-50'>
                        <div className='bg-white p-4 rounded-lg shadow-lg relative'>
                            {/* <button onClick={closeModal} className='absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none'>
                                &times;
                            </button> */}
                            <div className='text-center'>
                                <h2 className='text-xl font-semibold mb-4'>Delete Confirmation</h2>
                                <p className='mb-4'> You want to delete this project: <strong>{projectToDelete?.projectName}</strong>?</p>
                                <div className='flex justify-center'>
                                    <button onClick= {closeModal} className='mr-4 px-4 py-2 text-white rounded-md bg-gray-700 hover:bg-gray-600'>
                                        Cancel
                                    </button>
                                    <button onClick={confirmDelete} className='px-4 py-2  text-white rounded-md bg-[#89AF3E] hover:bg-[#6f8d30] '>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {showCreateProjectPopup && (
                    <CreateProjectPopup
                        onClose={handleCloseCreateProject}
                        fetchProjects={fetchprojectsList}
                        editingProject={editingProject}
                    />
                )}
{showAddCollaboratorsPopup && (
                    <AddCollaboratorsPopup
                        onClose={() => setShowAddCollaboratorsPopup(false)}
                        projectId={selectedProjectId}
                    />
                )}
            </AuthenticatedTemplate>
        </div>
    );
};
 
export default RetrosynthesisPage;
 
 