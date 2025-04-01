import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AiFillEye, AiFillDelete } from "react-icons/ai";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import CreateProjectPopup from '../../components/CreateProjectPopup.jsx';
import ActionIcons from '../../components/gem-chem/ActionIcons.jsx';
import AddCollaboratorsPopup from '../../components/AddCollaboratorsPopup.jsx'; 

const RetroProjects = () => {
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
    const username = activeAccount?.name;
    const [projectsData, setProjectsData] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [showCreateProjectPopup, setShowCreateProjectPopup] = useState(false);
    const [showAddCollaboratorsPopup, setShowAddCollaboratorsPopup] = useState(false); // State to control the Add Collaborators popup
    const [editingProject, setEditingProject] = useState(null);
    const navigate = useNavigate();

    const handleDelete = (id, projectName) => {
        setProjectToDelete({ id, projectName });
        setIsDeleteModalOpen(true);
    };

    const handleAddClick = () => {
        setShowAddCollaboratorsPopup(true);
    };

    const confirmDelete = () => {
        if (projectToDelete !== null) {
            const { id, projectName } = projectToDelete;

            fetch(`https://caitapimus.azure-api.net/projectManagement/api/projects?id=${id}`, {
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
                toast.success(`Deleted project: ${projectName}`);
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

    const handleCloseCreateProject = (projectData) => {
        setShowCreateProjectPopup(false);
        if (projectData) {
            setProjectsData([projectData, ...projectsData]); // Prepend new project data
        }
    };

    const closeModal = () => {
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
    };

    const fetchProjects =useEffect(() => {
        if (username) {
            fetch(`https://caitapimus.azure-api.net/projectManagement/api/projects/get-user-projects?userName=${username}&productId=1`, {
                headers: {
                    'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setProjectsData(data);
            })
            .catch(error => {
                console.error("There was an error fetching the projects!", error);
            });
        }
    }, [username]);

    const handleSmilesClick = (projectId, projectName) => {
        navigate(`/Retroprojects/projectroute/${projectId}`, { state: { projectName } });
    };

    const columns = useMemo(
        () => [
            {
                headerName: 'Project Name',
                field: 'projectName',
                cellRenderer: ({ data }) => (
                    <Link
                        to={{
                            pathname: `/Retroprojects/projectdetail/${data.id}`,
                            state: { projectName: data.projectName } // Pass projectName as state
                        }}
                        className="text-blue-500 hover:underline"
                    >
                        {data.projectName}
                    </Link>
                ),
                onCellClicked: ({ data }) => {
                    navigate(`/Retroprojects/projectdetail/${data.id}`, { state: { projectName: data.projectName, projectDescription: data.projectDescription, id:data.id } });
                },
            },
            // { headerName: 'Project Id', field: 'id' },
            { headerName: 'Status', field: 'projectResult', cellClass: params => params.value === "Pending" ? "text-red-500" : params.value === "Ready" ? "text-green-500" : "" },
            { headerName: 'Date Created', field: 'createdDate', valueFormatter: params => new Date(params.value).toLocaleDateString() },
            { headerName: 'Project Owner', field: 'createdBy' },
            { headerName: 'Last Execution', field: 'updatedDate', valueFormatter: params => new Date(params.value).toLocaleDateString() },
            // { headerName: 'Project Description', field: 'projectDescription' },
            {headerName:'Product Owner',field:'updatedBy'},
            {
                headerName: 'Action',
                field: 'action',
                cellRenderer: ({ data }) => (
                    <ActionIcons
                        onAddClick={handleAddClick}
                        onEditClick={() => handleEditClick(data)}
                        onDeleteClick={() => handleDelete(data.id, data.projectName)}
                    />
                ),
            },
        ],
        [navigate]
    );

    const defaultColDef = useMemo(() => ({
        sortable: true,
        filter: true,
        resizable: false,
    }), []);

    return (
        <div className='p-3'>
            <AuthenticatedTemplate>
                <ToastContainer />
                <div className="flex justify-between">
                    <div className="text-lg font-bold mt-8">
                        Retrosynthesis
                    </div>
                    <button
                        onClick={() => setShowCreateProjectPopup(true)}
                        className="bg-[#8D6CBB] hover:bg-[#735AA7]  font-sm text-white pb-2 px-1 mb-2 rounded-[7px] h-[40px] w-[117px]"
                    >
                        <span className="plus text-2xl">+ </span>Create New
                    </button>
                </div>
                <div className="ag-theme-alpine mt-6" style={{ height: '70vh' , overflow: 'hidden'}}>
                    <AgGridReact
                        rowData={projectsData}
                        columnDefs={columns}
                        defaultColDef={defaultColDef}
                        pagination={true}
                        paginationPageSize={10}
                        paginationPageSizeSelector={[10,25,50,100]}
                    />
                </div>
                {isDeleteModalOpen && (
                    <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50 z-50'>
                        <div className='bg-white p-4 rounded-lg shadow-lg relative'>
                            <button onClick={closeModal} className='absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none'>
                                &times;
                            </button>
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
                        RetroProjectsProjects={fetchProjects}
                        editingProject={editingProject}
                    />
                )}
                {showAddCollaboratorsPopup && (
                    <AddCollaboratorsPopup
                        onClose={() => setShowAddCollaboratorsPopup(false)}
                        id={projectToDelete?.id}
                        firstName={projectToDelete?.firstName}
                        lastName={projectToDelete?.lastName}
                    />
                )}
            </AuthenticatedTemplate>
        </div>
    );
};

export default RetroProjects;
