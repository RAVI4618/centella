
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import projData from '../../json/projects.json'
import logo from './../images/empty_logo.png'
import { FiShare2, FiDownload, FiEdit } from "react-icons/fi";
import ProjectAnalysis from '../../components/projectAnalysis';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaUserCircle } from "react-icons/fa";
import { useAtom } from 'jotai';
import { currentWorkflow } from '../../utils/Store';

function ProjectDetails() {
    const currentwflow = useAtom(currentWorkflow)[0]
    const location = useLocation();
    const oid = location.pathname.split('/')[3]
    let projectDetails = projData.filter(e => e.id == oid)[0]
    const [editMode, setEditMode] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [tempNoteContent, setTempNoteContent] = useState('');
    const [isVisible, setIsVisible] = useState(true);

    // JSON object for paragraph content
    const paragraphJson = {
        projectDescription: "This Will be a small description about the project can be edited later need to know when one will input it. This will be a small description about the project to can be edited later need to know when one will input it. this will be a small race description about the project."
    };

    const handleDelete = () => setIsVisible(false);
    const handleNewNote = () => {
        setEditMode(true);
        setTempNoteContent('');
    };
    const handleNoteChange = (e) => setTempNoteContent(e.target.value);
    const handleSubmit = () => {
        setNoteContent(tempNoteContent);
        setEditMode(false);
    };
    const handleCancel = () => {
        setTempNoteContent(noteContent);
        setEditMode(false);
    };
    const applyStyle = (style) => {
        // Placeholder for apply text styles
    };
    const [value, setValue] = useState('');
    return (
        <div className="container mx-auto p-3 flex gap-4">
            <div className="flex-1">
                <p className="mb-4"><Link className=' hover:underline' to={`/`}>Home</Link> &gt; <Link className=' hover:underline' to={`/projects`}>  Projects</Link> &gt; {projectDetails.project_name}</p>
                <div className=" bg-white rounded-md p-4">
                    <div>
                        <div className="flex items-center mb-4">
                            {/* Image and project details */}
                            <div className="flex items-center flex-row justify-between"> {/* Changes made here wrapped logo and project details in one div */}
                                <div>
                                    <img src={logo} width={90} height={90} alt='Logo' />
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-2xl text-[#746AAF] font-semibold">{projectDetails.project_name}</h3>
                                    <p className="text-sm">{projectDetails.createdDate}</p>
                                </div>
                            </div>
                            {/* Predict button and icons */}
                            <div className='text-center ml-auto mt-8'> {/*added ml-auto to move predict button and icons*/}
                                <div>
                                    {currentwflow === 'ADMET' ?
                                        <Link className="bg-[#4E8FAB] text-white py-2 px-10 rounded-lg mr-2" to={`/projects/projectdetails/` + projectDetails.id + `/routes`}>Predict</Link> :
                                        <Link className="bg-[#4E8FAB] text-white py-2 px-14 rounded-lg mr-2" to={`/projects/projectdetails/` + projectDetails.id + `/routes`}>Edit</Link>}
                                    <div className="flex mt-2">
                                        {/* Button icons */}
                                        <button className="p-2 border border-[#4E8FAB] rounded mx-1 my-2"><FiShare2 className='text-[#4E8FAB] text-xl' /></button>
                                        <button className="p-2 border border-[#4E8FAB] rounded mx-1 my-2"><FiDownload className='text-[#4E8FAB] text-xl' /></button>
                                        <button className="p-2 border border-[#4E8FAB] rounded mx-1 my-2"><FiEdit className='text-[#4E8FAB] text-xl' /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mb-4 ml-6">{paragraphJson.projectDescription}</p>

                        <hr className="my-4" />
                        <div className={`mb-4 ${currentwflow === 'ADMET' ? ' hidden' : ''} `}>
                            <h3 className="text-2xl font-semibold mb-2">Project Data</h3>

                            {/* Data metrics */}
                            <ProjectAnalysis />
                        </div>

                        {/* Section for project notes */}
                        <div className="border  rounded-md p-3">
                            <div>
                                <div className="flex justify-between">
                                    <p className='text-xl font-semibold px-4'>Project Notes</p>
                                    <button className=" border-2 font-semibold border-[#4E8FAB] text-[#4E8FAB] rounded-md px-4 py-1" onClick={handleNewNote}>+ New Note</button>
                                </div>
                                <div>
                                    {editMode ? (
                                        <div>
                                            <ReactQuill className='h-56 my-2' theme="snow" value={value} onChange={setValue} />
                                            {/* Submit and Cancel buttons */}
                                            <div className="flex justify-end gap-2 mr-2 -mt-3 submit-cancel-buttons">
                                                <button className="border border-gray-300 p-2 rounded-md" onClick={handleCancel}>Cancel</button>
                                                <button className="border border-gray-300 text-white bg-[#4E8FAB] p-2 rounded-md" onClick={handleSubmit}>Submit</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="sec3-para1 mt-2">{noteContent}</p>
                                    )}
                                </div>
                                <div className='text-gray-500'>
                                    <div className="flex justify-between mt-4">
                                        <div className='flex items-center px-4'>
                                            {/* <img src="" alt="(you)" /> */}
                                            <FaUserCircle />
                                            <p className="sec3-para2">You</p>
                                        </div>
                                        <div className="flex items-center"> {/* Added flex and items-center for alignment */}
                                            <h6 className="sec3-head1 text-[#4E8FAB]">Edit Note</h6>
                                            <img src="https://cdn-icons-png.flaticon.com/128/484/484662.png" className="h-5 ml-2" /> {/* Added ml-2 for a little space between the text and icon */}
                                        </div>
                                    </div>
                                    {isVisible && (
                                        <p className="sec3-para1 mt-3 px-4 ">
                                            This will be a small description about the project can be edited later need to know
                                            well when One will input it.This will be a small description about the project can be edited later need to
                                            know well when one will input it. This will be a small description  about the project can be
                                            Edited later need to know well when one will input it be a lot small description about the
                                            Project can be edited later need to know when one will input it.
                                        </p>
                                    )}
                                    <hr className="section-divider mt-3" />
                                    <div className="flex justify-between mt-3 px-4">
                                        <div className='flex items-center'>
                                            {/* <img src="" alt="(you)" /> */}
                                            <FaUserCircle />
                                            <p className="sec3-para2">You</p>
                                        </div>
                                        <div className="flex items-center"> {/* Added flex and items-center for alignment */}
                                            <h6 className="sec3-head1 text-[#4E8FAB]">Edit Note</h6>
                                            <img src="https://cdn-icons-png.flaticon.com/128/484/484662.png" className="h-5 ml-2" /> {/* Added ml-2 for a little space between the text and icon */}
                                        </div>
                                    </div>

                                    <p className="sec3-para1 mt-3 px-4">
                                        This will be a small description about the project can be edited later need to know
                                        well when One will input it.This will be a small description about the project can be  edited later need to
                                        know well when one willinput it. This will be a small description about the project can be
                                        Edited later need to know well when one will input it be a lot small description about the
                                        Project can be edited later need to know when one will input it.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="w-96">
                <div className="shadow-lg h-2/4 p-4  bg-white ">
                    <h3 className="font-semibold mb-4">Projects Updates</h3>
                    {/* Update content 
                </div>
            </div> */}
            </div>
        </div>
    );
};

export default ProjectDetails





