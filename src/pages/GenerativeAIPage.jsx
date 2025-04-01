import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import '../styles/aggrid.css';
import CreateProjectPopup from '../components/CreateProjectPopup';
import ActionIcons from '../components/gem-chem/ActionIcons';
import { useAtom } from 'jotai';
import { base_api_url } from '../utils/Store';
import Loader from "../components/Loader";
import AddCollaboratorsPopup from '../components/AddCollaboratorsPopup';
 
const GenerativeAIPage = () => {
  const navigate = useNavigate();
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const username = activeAccount?.name;
  const [showCreateProjectPopup, setShowCreateProjectPopup] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true)
  const baseurl = useAtom(base_api_url)[0]
  const [showAddCollaboratorsPopup, setShowAddCollaboratorsPopup] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
 
  const handleDelete = (id, projectName) => {
    setProjectToDelete({ id, projectName });
    setIsDeleteModalOpen(true);
  };
 
  const confirmDelete = () => {
    if (projectToDelete !== null) {
      const { id, projectName } = projectToDelete;
 
      fetch(`${baseurl}/projectManagement/api/projects?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82'
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          setProjects(projects.filter(project => project.id !== id));
          toast.success(`Deleted project: ${projectName}`, {
            className: 'mt-16'
          });
          setIsDeleteModalOpen(false);
        })
        .catch(error => {
          console.error("There was an error deleting the project!", error);
        });
    }
  };
  const handleCloseCreateProject = (projectData) => {
    setShowCreateProjectPopup(false);
    if (projectData) {
      setProjects((prevProjects) => {
        const projectExists = prevProjects.some(project => project.id === projectData.id);
        if (projectExists) {
          return prevProjects.map(project => project.id === projectData.id ? projectData : project);
        } else {
          return [...prevProjects, projectData];
        }
      });
    }
  };
 
 
  const handleEditClick = (project) => {
    setEditingProject(project);
    setShowCreateProjectPopup(true);
  };
 
  const closeModal = () => {
    setIsDeleteModalOpen(false);
    setProjectToDelete(null);
  };
 
  const handleCollaboratorClick = (projectId) => {
    setSelectedProjectId(projectId);
    setShowAddCollaboratorsPopup(true);
  };
 
  const columnDefs = useMemo(() => [
    {
      headerName: 'Project Name',
      field: 'projectName',
      cellRenderer: params => (
        <Link
          // to={`/GenChemprojects/projectdetail/${para.id}`}
          className="text-blue-500 hover:underline bold-text"
        >
          {params.value}
        </Link>
      ),
      onCellClicked: ({ data }) => {
        navigate(`/generativeai/projectdetail/${data.id}`, { state: { projectName: data.projectName, projectDescription: data.projectDescription, id: data.id } });
      },
    },
    {
      headerName: 'Project Description', field: 'projectDescription', cellClass: 'bold-text',
      // width:250
    },
    { headerName: 'Product Owner', field: 'updatedBy', cellClass: 'bold-text' },
    { headerName: 'Created On', field: 'createdDate', valueFormatter: params => new Date(params.value).toLocaleDateString(), cellClass: 'bold-text' },
    { headerName: 'Last Execution', field: 'updatedDate', valueFormatter: params => new Date(params.value).toLocaleDateString(), cellClass: 'bold-text' },
    {
      headerName: 'Status', field: 'projectResult',width: 150,
      cellClass: params => params.value === "Pending" ? "text-red-500" : params.value === "Ready" ? "text-green-500" : ""
  },
    {
      headerName: 'Actions',
      field: 'actions',
      // width:160,
      cellRenderer: params => (
        <ActionIcons
          onCollaboratorClick={() => handleCollaboratorClick(params.data.id)}
          onEditClick={() => handleEditClick(params.data)}
          onDeleteClick={() => handleDelete(params.data.id, params.data.projectName)}
        />
      ),
      cellClass: 'bold-text'
    }
  ], []);
 
  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: false,
  }), []);
 
  useEffect(() => {
    if (username) {
      fetchProjectsList(username);
    }
  }, [username]);
 
  const fetchProjectsList = (uname) => {
    setLoading(true)
    fetch(`${baseurl}/projectManagement/api/projects/get-user-projects?userName=${uname}&productId=3`, {
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
        // Set the fetched projects to state
        setProjects(data);
      })
      .catch(error => {
        console.error("There was an error fetching the projects!", error);
        // Optionally show an error message to the user
        toast.error("Error fetching projects.");
      })
      .finally(() => {
 
        setLoading(false);
      });
  };
 
 
  return (
    <div className='p-3 '>
      <AuthenticatedTemplate>
        <div className="flex justify-between py-2">
          <div className="font-bold text-lg">
            Generative AI
          </div>
          <button
            onClick={() => { setEditingProject(null); setShowCreateProjectPopup(true); }}
            className="bg-[#735DA8] font-medium text-white mb-2 rounded-[7px] h-[40px] w-[117px]"
          >
            <span className="plus">+ </span>Create New
          </button>
        </div>
 
        <div className="ag-theme-alpine" style={{ height: '70vh', width: '80vw', overflow: 'hidden' }}>
          {loading ? (  // Show loader while fetching data
            <div className='flex items-center justify-center h-full'>
 
              <Loader />
            </div>
 
          ) : projects.length === 0 ? (  // Show message if no projects found
            <div className='flex items-center justify-center h-full'>
              <div className="text-center text-gray-500">
                <p className='text-lg font-medium'>Create a project and accelerate your research today!</p>
              </div>
            </div>
          ) : (
 
 
 
            <AgGridReact
              rowData={projects}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
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
                  <button onClick={closeModal} className='mr-4 px-4 py-2 text-white rounded-md bg-gray-700 hover:bg-gray-600'>
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className='px-4 py-2 text-white rounded-md bg-[#89AF3E] hover:bg-[#6f8d30]'>
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
            // fetchProjects={fetchProjectsList}
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
 
export default GenerativeAIPage;
 
 