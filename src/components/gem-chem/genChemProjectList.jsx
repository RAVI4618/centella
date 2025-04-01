// GemChemProjectList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import CreateProjectPopup from '../CreateProjectPopup';
import ActionIcons from './ActionIcons'; 

const GemChemProjectList = () => {
  const navigate =useNavigate()
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();
  const username = activeAccount?.name;
  const [showCreateProjectPopup, setShowCreateProjectPopup] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const handleDelete = (id, projectName) => {
    setProjectToDelete({ id, projectName });
    setIsDeleteModalOpen(true);
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
        setProjects(projects.filter(project => project.id !== id));
        toast.success(`Deleted project: ${projectName}`);
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
      setProjects((prevProjects) => [...prevProjects, projectData]);
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

  const columnDefs = useMemo(() => [
    {
      headerName: 'Project Name',
      field: 'projectName',
      cellRenderer: params => (
        <Link
        //  to={`/projects/genchem/validate-protien/${params.data.id}`} 
        className="text-blue-500 hover:underline bold-text">
          {params.value}
        </Link>
      ),
      onCellClicked: ({ data }) => {
        navigate(`/GenChemprojects/projectdetail/${data.id}` ,{state:{projectName:data.projectName, projectDescription:data.projectDescription, id:data.id}});
    },
    },
    {
      headerName: 'Status',
      field: 'projectResult',
      cellClass: params => params.value === "Pending" ? "text-red-500 " : params.value === "Completed" ? "text-green-400 bold-text" : "bold-text"
    },

    { headerName: 'Created By', field: 'createdBy', cellClass: 'bold-text' },
    { headerName: 'Product Owner', field: 'updatedBy', cellClass: 'bold-text' },
    { headerName: 'Created On', field: 'createdDate', valueFormatter: params => new Date(params.value).toLocaleDateString(), cellClass: 'bold-text' },
    { headerName: 'Last Modified', field: 'updatedDate', valueFormatter: params => new Date(params.value).toLocaleDateString(), cellClass: 'bold-text' },
    
    // { headerName: 'Last Execution', field: 'updatedDate', valueFormatter: params => new Date(params.value).toLocaleDateString(), cellClass: 'bold-text' },
    // { headerName: 'Project Description', field: 'projectDescription', cellClass: 'bold-text' },
    {
      headerName: 'Actions',
      field: 'actions',
      cellRenderer: params => (
        <ActionIcons 
        onEditClick={() => handleEditClick(params.data.id)}
          onDeleteClick={() => handleDelete(params.data.id, params.data.projectName)} 
        />
      ),
      cellClass: 'bold-text'
    }
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  useEffect(() => {
    if (username) {
      fetch(`https://caitapimus.azure-api.net/projectManagement/api/projects/get-user-projects?userName=${username}&productId=3`, {
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
        setProjects(data);
      })
      .catch(error => {
        console.error("There was an error fetching the projects!", error);
      });
    }
  }, [username]);

  return (
    <div className='p-3 '>
      <AuthenticatedTemplate>
        <ToastContainer />
        <div className="flex justify-between">
          <div className="font-bold text-base">
            Generative AI
          </div>
          <button
            onClick={() => setShowCreateProjectPopup(true)}
            className="bg-[#735DA8]  font-medium text-white mb-2 rounded-[7px] h-[40px] w-[117px]"
          >
            <span className="plus">+ </span>Create New
          </button>
        </div>
        <div className="ag-theme-alpine" style={{ height: '70vh', }}>
          <AgGridReact
            rowData={projects}
            columnDefs={columnDefs}
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
                  <button onClick={confirmDelete} className='mr-4 px-4 py-2 text-white rounded-md bg-[#89AF3E] hover:bg-[#6f8d30]'>
                    Delete
                  </button>
                  <button onClick={closeModal} className='px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600'>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showCreateProjectPopup && (
          <CreateProjectPopup
            onClose={handleCloseCreateProject}
            editingProject={editingProject}
          />
        )}
      </AuthenticatedTemplate>
    </div>
  );
};

export default GemChemProjectList;
