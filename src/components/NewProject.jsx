
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from './../images/empty_logo.png'
import { FiShare2, FiDownload, FiEdit } from "react-icons/fi";
import 'react-quill/dist/quill.snow.css';

function ProjectDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const { projectName } = location.state || {}; // Fallback to an empty object if state is undefined
    const [editMode, setEditMode] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [tempNoteContent, setTempNoteContent] = useState('')

    // JSON object for paragraph content
    const paragraphJson = {
        projectDescription: "This Will be a small description about the project can be edited later need to know when one will input it. This will be a small description about the project to can be edited later need to know when one will input it. this will be a small race description about the project."
    };

    const handleNewNote = () => {
        setEditMode(true);
        setTempNoteContent('');
      };
    
      const handleNoteChange = (e) => {
        setTempNoteContent(e.target.value);
      };
    
      const handleSubmit = () => {
        setNoteContent(tempNoteContent);
        setEditMode(false);
      };
    
      const handleCancel = () => {
        setTempNoteContent(noteContent);
        setEditMode(false);
      };
    
      const applyStyle = (style) => {
        // Placeholder for functionality to apply text styles like bold, italic, underline.
      };
    const [value, setValue] = useState('');
    return (
        <div className="container mx-auto p-3 flex gap-4">
            <div className="flex-1">
            {projectName && <p className="mt-4">Project Name&gt; {projectName}</p>}
                <div className=" bg-white rounded-md p-4">
                    <div>
                        <div className="flex items-center mb-4">
                            {/* Image and project details */}
                            <div>
                                <img src={logo} width={100} height={100} alt='Logo' />
                            </div>
                            <div className="flex-grow">
                                <h3 className="text-2xl text-[#746AAF] font-semibold">{projectName}</h3>
                                <p className="text-sm"></p>
                            </div>
                            {/* Navigation buttons */}
                            <div>
                                <Link className="bg-[#4E8FAB] text-white py-2 px-4 rounded-lg mr-2" >+ predict route</Link>
                                <div className="flex">
                                    {/* Button icons */}
                                    <button className="p-2 border mx-1 my-2"><FiShare2 className=' text-xl' /></button>
                                    <button className="p-2 border mx-1 my-2"><FiDownload className=' text-xl' /></button>
                                    <button className="p-2 border mx-1 my-2"><FiEdit className=' text-xl' /></button>
                                </div>
                            </div>


                        </div>
                        <p className="mb-4"></p>

                    </div>
                    
                    
                    {/* Section for project notes */}
                    <div className="  rounded-md p-3">
                        <div>
                        <div className="flex justify-between">
    <textarea 
        className='w-full p-6 ml-10 text-xl font-semibold border rounded-md'
        placeholder='Add Project Description'
        name='projectDescription'
    />
</div>

                        {/* Project Notes Section */}
          <h4 className="font-bold text-lg mt-5">Projects Notes</h4>
          <div className='flex flex-col items-center my-12'>
            <p className='font-medium text-base'>Add a Project note</p>               
            <button
        className="border font-bold py-2 px-4 rounded-lg mt-4"
        style={{color: '#4E8FAB'}}
        onClick={handleNewNote}>
        + New Note
      </button>
          </div>
          
          {editMode ? (
            <div>
              <textarea value={tempNoteContent} onChange={handleNoteChange} className="form-textarea mt-1 block w-full border rounded-md" style={{ height: '100px' }}></textarea>
              <div className="flex gap-2 mt-2">
                <button className="py-2 px-4 font-bold border rounded-md" onClick={() => applyStyle('bold')}>B</button>
                <button className="py-2 px-4 italic border rounded-md" onClick={() => applyStyle('italic')}>I</button>
                <button className="py-2 px-4 underline border rounded-md" onClick={() => applyStyle('underline')}>U</button>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button className="py-2 px-4 border rounded-md" onClick={handleCancel}>Cancel</button>
                <button className="py-2 px-4 border rounded-md" onClick={handleSubmit}>Submit</button>
              </div>
            </div>
          ) : (
            <p className="mt-2">{noteContent}</p>
          )}
        </div>        
                            </div>
                        </div>
                        </div>
                        <div className="w-96">
    <div className="shadow-lg h-2/4 p-4 bg-white">
        <h3 className="font-semibold mb-4">Projects Updates</h3>
        <div className="flex justify-center">
            <button
                className="border font-bold py-2 px-4 rounded-lg mt-4"
                style={{color: '#4E8FAB'}}
            >
                + New Note
            </button>
        </div>
    </div>

    
    <div className="shadow-lg mt-4 p-4 bg-white h-60">
        <h3 className="font-semibold mb-4">Route History</h3>
        {/* Content of Route History goes here */}
    </div>
</div>
        </div>
    );
};

export default ProjectDetails
