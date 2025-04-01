import React, { useState } from 'react';


function CollaboratorsPopup({ project, onClose }) {
  const projectName = project ? project.project_name : '';
  const [view, setView] = useState('list'); // 'list' or 'confirm'
  const [collaborators, setCollaborators] = useState([
    { name: 'Pavan', email: 'pavankumar@gmail.com', imageUrl: '' },
    { name: 'Sadiq', email: 'Sadiq@gamil.com', imageUrl: '' },
    { name: 'Keerthana', email: 'keerthana@example.com', imageUrl: '' },
    { name: 'Irfan', email: 'irfan@example.com', imageUrl: '' },
  ]);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [removalMessage, setRemovalMessage] = useState(''); // State to hold the removal message

  const handleDeleteClick = (collaborator) => {
    setSelectedCollaborator(collaborator);
    setRemovalMessage(''); // Clear the removal message when opening the confirm view
    setView('confirm');
  };

  const handleRemoveCollaborator = () => {
    setCollaborators(collaborators.filter(c => c !== selectedCollaborator));
    setRemovalMessage(`${selectedCollaborator.name} removed as a collaborator.`);
    setSelectedCollaborator(null);
    setView('list');
  };

  const handleCancel = () => {
    setSelectedCollaborator(null);
    setView('list');
  };

  return (
   <>
        <div 
         style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'slideIn 0.5s ease forwards', // Apply the animation here

        }}
        onClick={onClose}
        >
          <div style={{
            position: 'relative',
            padding: '20px',
            background: '#FFF',
            borderRadius: '8px',
            width: '511px',
            height: 'auto', // Adjusted for dynamic content
            overflowY: 'auto',
            margin: 'auto',
            zIndex: 1001,
          }}
          onClick={e => e.stopPropagation()}
          >
            {/* X button on the top right */}
            <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer' }} onClick={onClose}><X classname='h-6 w-6'/></div>
  
            {/* Conditionally render the removal message */}
            {view === 'list' && removalMessage && <div style={{ marginBottom: '20px', color: 'green' }}>{removalMessage}</div>}
          
          {view === 'list' && (
            <>
              <h6>Collaborators of {projectName}</h6>
              <input type="search" placeholder="Search collaborators..." style={{ width: '100%', marginBottom: '20px' }} />
              {collaborators.map((collaborator, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <img src={collaborator.imageUrl} alt="" style={{ width: '46px', height: '46px', borderRadius: '50%', marginRight: '10px' }}/>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h5 style={{ margin: 0, width: '84px', height: '24px', color: '#4c4c4c',  fontWeight: 400, fontSize: '16px', lineHeight: '24px' }}>{collaborator.name}</h5>
                    <p style={{ margin: 0, width: '179px', height: '21px', color: '#B6B6B6',  fontWeight: 400, fontSize: '14px', lineHeight: '22px' }}>{collaborator.email}</p>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <img src="https://cdn-icons-png.flaticon.com/128/484/484662.png" alt="Delete" style={{height: '20px', cursor: 'pointer'}} onClick={() => handleDeleteClick(collaborator)} />
                  </div>
                </div>
              ))}
            </>
          )}
          {view === 'confirm' && selectedCollaborator && (
            <div>
              <h5>Are you sure you want to remove {selectedCollaborator.name} as a collaborator?</h5>
              <div style={{ display: 'flex', marginTop: '20px', justifyContent: 'space-between' }}>
                <button style={{
                  backgroundColor: 'blue',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }} onClick={handleRemoveCollaborator}>Remove</button>
                <button style={{
                  backgroundColor: 'gray',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }} onClick={handleCancel}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CollaboratorsPopup;