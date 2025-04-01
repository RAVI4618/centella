import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AiFillDelete, AiFillEdit } from 'react-icons/ai';
import { HiUserAdd } from 'react-icons/hi';
import ActionIcons from '../../components/gem-chem/ActionIcons.jsx';
import { useAtom } from 'jotai';
import { currentWorkflow } from '../../utils/Store.jsx';
import * as CONTANTS from '../../utils/constants.js';
import GenChemProjectList from '../../components/gem-chem/genChemProjectList.jsx';
import AddGenChemProject from '../../components/gem-chem/addProject.jsx';
import { useMsal } from "@azure/msal-react";
import { ToastContainer, toast } from 'react-toastify';
import CreateProjectPopup from '../../components/CreateProjectPopup.jsx';
import AddCollaboratorsPopup from '../../components/AddCollaboratorsPopup.jsx'; 
import { format } from 'date-fns';
import 'react-toastify/dist/ReactToastify.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import PropertiesTable from '../../components/admet/AdmetFullscreen.jsx';

function Projects() {
  const [platformSelected, setPlatformSelected] = useAtom(currentWorkflow);
  const [projectsData, setProjectsData] = useState([]);
  const [showCreateProjectPopup, setShowCreateProjectPopup] = useState(false);
  const [showAddCollaboratorsPopup, setShowAddCollaboratorsPopup] = useState(false); // State to control the Add Collaborators popup
  const [loading, setLoading] = useState(false); // Loading state
  const [editingProject, setEditingProject] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const navigate = useNavigate()
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://caitapimus.azure-api.net/projectManagement/api/projects/get-user-projects?userName=${activeAccount?.name}&productId=2`,
        {
          headers: {
            'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82' // Replace with your actual token
          }
        }
      );
      console.log('API Response:', response.data);
      // Sort projects by id in descending order
      const sortedProjects = (response.data.projects || response.data).sort((a, b) => b.id - a.id);
      setProjectsData(sortedProjects); // Adjust as needed
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDeleteClick = (projectId, projectName) => {
    setProjectToDelete({ id: projectId, projectName });
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (projectToDelete !== null) {
      const { id } = projectToDelete;

      try {
        const response = await fetch(`https://caitapimus.azure-api.net/projectManagement/api/projects?id=${id}`, {
          method: 'DELETE',
          headers: {
            'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete project');
        }

        console.log('Deleted successfully');
        setProjectsData((prevProjects) => prevProjects.filter((project) => project.id !== id));
        toast.success(`Deleted project: ${projectToDelete.projectName}`,{
          className:'mt-12'
        });
        setIsDeleteModalOpen(false);
      } catch (error) {
        console.error('Error deleting:', error);
      }
    }
  };

  const handleEditClick = (project) => {
    setEditingProject(project);
    setShowCreateProjectPopup(true);
  };

  const handleAddClick = () => {
    setShowAddCollaboratorsPopup(true);
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Project Name',
        field: 'projectName',
        cellRenderer: ({ data }) => (
<Link className="text-blue-500 hover:underline">{data.projectName}</Link>  
      ),
     filter: 'agDateColumnFilter'  ,
  //    onCellClicked: ({ data }) => {
  //     navigate(`/Retroprojects/projectdetail/${data.id}` ,{state:{projectName:data.projectName, projectDescription:data.projectDescription}});
  // },
     onCellClicked: ({ data }) => {
      navigate(`/Admetprojects/projectdetail/${data.id}` ,{state:{projectName:data.projectName, projectDescription:data.projectDescription, id:data.id}});
  },
    //  onCellClicked: ({ data }) => {
    //   navigate(`/projects/projectroute/${data.id}`);
    // },
  },
      // { headerName: 'Project Id', field: 'id' , filter: 'agDateColumnFilter'},
      {
        headerName: 'Status',
        field: 'projectResult',
        cellClass: params => params.value === "Pending" ? "text-red-500" : params.value === "Ready" ? "text-green-400" : "",
       filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Date Created',
        field: 'createdDate',
        valueFormatter: ({ value }) => value ? format(new Date(value), 'yyyy-MM-dd') : 'N/A',
         filter: 'agDateColumnFilter',
      },
      {
        headerName: 'Project Owner',
        field: 'Project Owner',
        valueFormatter: ({ data }) => {
          const adminUser = data.company?.adminUser;
          if (!adminUser) return 'N/A';

          const uniqueAdminUsers = new Set();
          adminUser.forEach((user) => {
            uniqueAdminUsers.add(`${user.firstName} ${user.lastName}`);
          });

          return Array.from(uniqueAdminUsers).join(', ');
        },
         filter: 'agDateColumnFilter'
      },
      {
        headerName: 'Last Executed',
        field: 'updatedDate',
        valueFormatter: ({ value }) => value ? format(new Date(value), 'yyyy-MM-dd') : 'N/A',
         filter: 'agDateColumnFilter'
      },
      {headerName:'Product Owner',field:'updatedBy'},
      // {
      //   headerName: 'Project Description',
      //   field: 'projectDescription',
      //   valueFormatter: ({ data }) => data.projectDescription || 'N/A',
      //    filter: 'agDateColumnFilter'
      // },
      {
        headerName: 'Action',
        field: 'action',
        cellRenderer: ({ data }) => (
          <ActionIcons
          onAddClick={handleAddClick}
            onEditClick={() => handleEditClick(data)}
            onDeleteClick={() => handleDeleteClick(data.id, data.projectName)}
          />
        ),
      },
    ],
    []
  );


  return (
    <>
      {/* <div className="header">
        <p>
          <Link className='hover:underline' to={`/`}>Home</Link> &gt;
          <Link className='hover:underline' to={`/projects`}>Projects</Link>
        </p>
      </div> */}
      <div className="flex justify-between p-2">
        <div className="total-projects mt-8 ">
          {/* Total Projects {projectsData.length} */}
          ADMET
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowCreateProjectPopup(true);

          }}
          className="bg-[#735DA8]  font-sm text-white pb-2 rounded-[7px] h-[40px] w-[117px]"
        >
          <span className="plus text-base">+ </span>Create New
        </button>
      </div>
      {platformSelected === CONTANTS.GEN_CHEM && (
        <AddGenChemProject
          addProjectStatus={true}
          setAddProjectStatus={() => { }}
        />
      )}
      <div className="">
        {platformSelected === CONTANTS.GEN_CHEM ? (
          <GenChemProjectList />
        ) : (
          <div className=" gen-chem responsive-table mt-6">
             <div className="ag-theme-alpine" style={{ height: '70vh', overflow: 'hidden' }}>
              <AgGridReact
                rowData={projectsData}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={10}
              />
            </div>
          </div>
        )}
      </div>
      {showCreateProjectPopup && (
        <CreateProjectPopup
          onClose={(projectData) => {
            setShowCreateProjectPopup(false);
            if (projectData) {
              setProjectsData((prevProjects) => [...prevProjects, projectData]);
            }
          }}
          fetchProjects={fetchProjects}
          fetchRetroProjects={() => { }}
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
      {isDeleteModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-xl font-semibold mb-4">Delete Project</h2>
            <p className='mb-4'> You want to delete this project <strong>{projectToDelete?.projectName}</strong>?</p>
            <div className="flex justify-center space-x-2">
              <button
                className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-600 rounded-md"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#89AF3E] text-white rounded-md"
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
}

export default Projects;
