import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAtom } from 'jotai';
import { base_api_url } from '../utils/Store';
import { X, Search, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
 
const getRoleBadgeStyle = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-700';
    case 'editor':
      return 'bg-blue-100 text-blue-700';
    case 'viewer':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
 
const AddCollaboratorsPopup = ({ onClose, projectId }) => {
  console.log(projectId);
 
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentCollaborators, setCurrentCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingCollaborator, setAddingCollaborator] = useState(false);
  const [error, setError] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);
 
  const apiUrl = useAtom(base_api_url)[0];
 
  // Extract productId based on workflow path
  const workflow = location.pathname.split('/')[1];
  const productId = workflow === "retrosynthesis" ? 1
    : workflow === "admet" ? 2
    : workflow === 'generativeai' ? 3
    : workflow === 'virtualscreening' ? 4
    : 5;
console.log(productId);
  const companyId = 15202;
 
  // Fetch current collaborators on mount
  useEffect(() => {
    fetchCurrentCollaborators();
  }, [projectId]);
 
  const fetchCurrentCollaborators = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/projectManagement-uat/api/projects/get-collaborators`, {
        headers: {
          'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
        },
        params: { projectId }
      });
      setCurrentCollaborators(response.data);
    } catch (error) {
      // toast.error('Failed to fetch collaborators');
      // setError('Unable to load collaborators');
    } finally {
      setLoading(false);
    }
  };
 
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
   
    if (value.trim()) {
      setLoading(true);
      try {
        const response = await axios.get(`${apiUrl}/projectManagement-uat/api/projects/search`, {
          headers: {
            'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
            'Content-Type': 'application/json',
          },
          params: {
            companyId,
            searchTerm: value
          },
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          },
          maxRedirects: 5,
          followRedirects: true
        });
 
        // Extract all users including nested ones
        const allUsers = [];
       
        response.data.forEach(item => {
          // If item is an object (not a number), process it
          if (typeof item === 'object' && item !== null) {
            // Add the main user
            allUsers.push({
              id: item.id,
              firstName: item.firstName,
              lastName: item.lastName,
              userEmail: item.userEmail
            });
           
            // Check for nested users in company.adminUser
            if (item.company?.adminUser) {
              item.company.adminUser.forEach(adminUser => {
                // If adminUser is an object (not a number), add it
                if (typeof adminUser === 'object' && adminUser !== null) {
                  allUsers.push({
                    id: adminUser.id,
                    firstName: adminUser.firstName,
                    lastName: adminUser.lastName,
                    userEmail: adminUser.userEmail
                  });
                }
              });
            }
          }
        });
 
        // Remove duplicates based on id
        const uniqueUsers = allUsers.filter((user, index, self) =>
          index === self.findIndex((u) => u.id === user.id)
        );
 
        // Filter out current collaborators
        const currentCollaboratorIds = currentCollaborators.map(c => c.userId);
        const filteredResults = uniqueUsers.filter(user =>
          !currentCollaboratorIds.includes(user.id)
        );
 
        console.log('Search Results:', filteredResults);
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Search error details:', {
          message: error.message,
          response: error.response,
          status: error.response?.status
        });
        toast.error('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };
 
  const handleAddCollaborator = async (userId) => {
    setAddingCollaborator(true);
    try {
      await axios.post(`${apiUrl}/projectManagement-uat/api/projects/add-collaborator`, null, {
        headers: {
          'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
        },
        params: {
          userId,
          projectId,
          productId
        }
      });
     
      toast.success('Collaborator added successfully');
      setSearchTerm(''); // Clear search
      setSearchResults([]); // Clear results
      await fetchCurrentCollaborators(); // Refresh list
    } catch (error) {
      toast.error('Failed to add collaborator');
    } finally {
      setAddingCollaborator(false);
    }
  };
 
  const handleDeleteClick = (userId) => {
    setDeletingUserId(userId);
  };
 
  const handleDeleteCollaborator = async (userId) => {
    try {
      await axios.delete(`${apiUrl}/projectManagement-uat/api/projects/delete-collaborator`, {
        headers: {
          'Ocp-Apim-Subscription-Key': 'e3ad0fb3039a48ba840ce271ef718c82',
        },
        params: {
          userId,
          projectId,
          productId
        }
      });
     
      toast.success('Collaborator removed successfully');
      await fetchCurrentCollaborators();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove collaborator');
    } finally {
      setDeletingUserId(null); // Clear the deleting state
    }
  };
 
  return (
    <div className="fixed inset-0 flex justify-center items-center backdrop-filter backdrop-blur-sm z-[1000]">
      <div className="bg-white rounded-lg shadow-lg w-[500px] max-h-[599px] flex flex-col">
        {/* Header */}
        <div className="bg-[#85AD4B] px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Project Collaborators</h3>
            <p className="text-sm text-white/80">Manage team members</p>
          </div>
          <button
            className="text-white hover:bg-white/10 rounded-full p-1"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
 
        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search collaborators by name or email..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#85AD4B]/50"
              disabled={addingCollaborator}
            />
          </div>
        </div>
 
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-[#85AD4B]" />
            </div>
          ) : searchTerm ? (
            // Search Results
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-4">Search Results</p>
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-600">{user.userEmail}</p>
                      </div>
                      <button
                        onClick={() => !addingCollaborator && handleAddCollaborator(user.id)}
                        className="text-[#85AD4B] hover:bg-[#85AD4B]/10 px-3 py-1.5 rounded-md text-sm font-medium"
                        disabled={addingCollaborator}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No matching users found</p>
              )}
            </div>
          ) : (
            // Current Collaborators List
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-4">Current Collaborators</p>
              {currentCollaborators.length > 0 ? (
                currentCollaborators.map((collab) => (
                  <div key={collab.userId} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-start gap-3 flex-1">
                        <div>
                          <p className="font-medium">{collab.firstName} {collab.lastName}</p>
                          <p className="text-sm text-gray-600">{collab.userEmail}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeStyle(collab.projectAccessRole)}`}>
                          {collab.projectAccessRole || 'No Role'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteClick(collab.userId)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-md ml-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No collaborators yet</p>
              )}
            </div>
          )}
        </div>
 
        {/* Loading Overlay for Add Operation */}
        {addingCollaborator && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#85AD4B]" />
              <p className="text-sm font-medium">Adding collaborator...</p>
            </div>
          </div>
        )}
 
        {/* Add Delete Confirmation Dialog */}
        {deletingUserId && (
          <div className="absolute inset-0 bg-black/5 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 shadow-lg w-[400px]">
              <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
              <p className="text-gray-600 mb-4">Are you sure you want to remove this collaborator?</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingUserId(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCollaborator(deletingUserId)}
                  className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
AddCollaboratorsPopup.propTypes = {
  onClose: PropTypes.func.isRequired,
  projectId: PropTypes.number.isRequired
};
 
export default AddCollaboratorsPopup;
 